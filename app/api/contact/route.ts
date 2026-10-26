import { clientIp, rateLimit } from "@/lib/rate-limit";

// Delivers compose-window messages through Resend's REST API.
// Needs RESEND_API_KEY and CONTACT_TO_EMAIL; CONTACT_FROM_EMAIL is optional.
const configured = () => !!(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);

/** Lets the compose window know up front whether to send here or hand off to the mail app. */
export async function GET() {
  return Response.json({ configured: configured() });
}

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 60 * 60_000)) {
    return Response.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { from?: unknown; subject?: unknown; message?: unknown; company?: unknown } | null;
  const from = typeof body?.from === "string" ? body.from.trim().slice(0, 200) : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim().slice(0, 200) : "";
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 5000) : "";
  if (body?.company) return Response.json({ ok: true }); // honeypot
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from) || !message) {
    return Response.json({ error: "Add a valid email and a message." }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return Response.json({ error: "Email delivery isn't configured." }, { status: 503 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Kaiuf portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: from,
      subject: `[Portfolio] ${subject || "New message"}`,
      text: `From: ${from}\n\n${message}`,
    }),
  });
  if (!res.ok) return Response.json({ error: "Delivery failed." }, { status: 502 });
  return Response.json({ ok: true });
}
