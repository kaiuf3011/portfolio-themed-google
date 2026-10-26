import Anthropic from "@anthropic-ai/sdk";
import { knowledgeText, retrieve } from "@/lib/knowledge";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MODEL = "claude-opus-5-5";
const NAP = "The assistant is napping. Try the search bar instead.";

const SYSTEM = `You are "Ask Kaiuf", the assistant on Kaiuf M's portfolio site. Visitors are recruiters, hackathon judges, clients and other builders.

Answer questions about Kaiuf using only the facts inside <knowledge>. The site refers to Kaiuf as he/him.
- If the answer isn't in <knowledge>, say plainly that you don't know that about Kaiuf and suggest the compose window on this site to ask him directly. Never invent projects, dates, numbers, employers or links.
- Keep answers short: two to five sentences, or a short list when listing things. Plain text; **bold** and "- " bullets are fine, no headings.
- Tone: friendly and clear, with a light Gen-Z wink at most once per answer.
- For questions unrelated to Kaiuf, give a one-line redirect back to what you can help with.
Latency-sensitive; begin your visible answer immediately.

<knowledge>
${knowledgeText()}
</knowledge>`;

type Msg = { role: "user" | "assistant"; content: string };

function parse(body: unknown): Msg[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 16) return null;
  const msgs: Msg[] = [];
  for (const m of raw) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    const content = m.content.trim().slice(0, 2000);
    if (!content) return null;
    msgs.push({ role: m.role, content });
  }
  return msgs[msgs.length - 1].role === "user" && msgs[0].role === "user" ? msgs : null;
}

function textStream(produce: (write: (s: string) => void) => Promise<void>, onCancel?: () => void, mode = "claude") {
  const enc = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      await produce((s) => controller.enqueue(enc.encode(s)));
      controller.close();
    },
    cancel: onCancel,
  });
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-kaiuf-mode": mode } });
}

/** Grounded keyword answer for when no model is configured. */
function localAnswer(question: string) {
  const found = retrieve(question);
  const text = found.length
    ? `Here's what I know:\n\n${found.map((c) => `**${c.title}.** ${c.text}`).join("\n\n")}`
    : "That isn't in what I know about Kaiuf yet. Ask him directly: the compose window is one click away.";
  return textStream(
    async (write) => {
      for (const word of text.split(/(?<=\s)/)) {
        write(word);
        await new Promise((r) => setTimeout(r, 14));
      }
    },
    undefined,
    "local",
  );
}

export async function POST(req: Request) {
  if (!rateLimit(`chat:${clientIp(req)}`, 20, 10 * 60_000)) {
    return Response.json({ error: "Too many questions. Take a breath and try again in a few minutes." }, { status: 429 });
  }
  const messages = parse(await req.json().catch(() => null));
  if (!messages) return Response.json({ error: "Send a question." }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return localAnswer(messages[messages.length - 1].content);
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages,
  });

  return textStream(
    async (write) => {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") write(event.delta.text);
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") write("\n\nI can't help with that one. Ask me about Kaiuf's projects, skills or wins instead.");
        if (final.stop_reason === "max_tokens") write("…");
      } catch (err) {
        if (err instanceof Anthropic.RateLimitError) write("Lots of questions right now. Try again in a minute.");
        else if (err instanceof Anthropic.APIError) write(NAP);
        else write(NAP);
      }
    },
    () => stream.abort(),
  );
}
