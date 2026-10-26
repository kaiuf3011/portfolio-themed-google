"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { spring } from "@/lib/motion";
import { Icon } from "@/components/Icon";
import { useCompose } from "@/components/providers/Compose";

type Msg = { role: "user" | "assistant"; content: string };

const CHIPS = ["What has he built?", "Show me his best AI project", "Has he won any hackathons?", "Can he build my website?"];

/** Minimal formatting: paragraphs, "- " bullets and **bold**. */
function Rich({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith("**") && part.endsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : <Fragment key={i}>{part}</Fragment>));
  return (
    <>
      {text.split(/\n{2,}/).map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*[-*] /.test(l)))
          return (
            <ul key={i} className="my-2 list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*] /, ""))}</li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="my-2 first:mt-0 last:mb-0">
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

export function AskKaiuf() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [focused, setFocused] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const compose = useCompose();

  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, thinking]);

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(history);
    setInput("");
    setBusy(true);
    setThinking(true);
    abort.current = new AbortController();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12) }),
        signal: abort.current.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "napping");
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let text = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        setThinking(false);
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: text }]);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      const msg = (e as Error).message;
      setMessages((m) => [...m.filter((x) => x.content), { role: "assistant", content: msg && msg !== "napping" ? msg : "The assistant is napping. Try the search bar instead." }]);
    } finally {
      setBusy(false);
      setThinking(false);
    }
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <AnimatePresence initial={false}>
        {messages.length === 0 && (
          <motion.div exit={{ opacity: 0, height: 0 }} className="overflow-hidden pb-8 pt-4">
            <h2 className="text-[clamp(32px,4vw,48px)] font-medium leading-tight">
              <span className="bg-[image:var(--ai-gradient)] bg-clip-text text-transparent">Hi, I&apos;m Ask Kaiuf.</span>
              <br />
              <span className="text-on-surface-variant">What do you want to know?</span>
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5" aria-live="polite" aria-busy={busy}>
        {messages.map((m, i) =>
          m.role === "user" ? (
            <motion.div key={i} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring.spatialDefault} className="flex justify-end">
              <p className="max-w-[80%] rounded-xl rounded-tr-xs bg-surface-container-high px-4 py-2.5 text-[16px]">{m.content}</p>
            </motion.div>
          ) : (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: "var(--ai-gradient)" }}>
                <Icon name="sparkle" size={18} className="text-white" />
              </span>
              <div className="min-w-0 flex-1 text-[16px] leading-[1.6]">
                <Rich text={m.content} />
                {!busy && i === messages.length - 1 && /compose|directly/i.test(m.content) && (
                  <button type="button" onClick={(e) => compose.open({ origin: e.currentTarget })} className="state mt-2 inline-flex h-9 items-center gap-2 rounded-full border border-outline px-4 text-[14px] font-medium text-primary">
                    <Icon name="mail" size={16} /> Open compose
                  </button>
                )}
              </div>
            </motion.div>
          ),
        )}
        {thinking && (
          <div className="flex items-center gap-3" role="status">
            <span className="dot-wave flex gap-1.5" aria-hidden>
              {["var(--g-blue)", "var(--g-red)", "var(--g-yellow)", "var(--g-green)"].map((c) => (
                <span key={c} className="h-2.5 w-2.5" style={{ background: c }} />
              ))}
            </span>
            <span className="ai-shimmer text-[14px] font-medium">Thinking</span>
          </div>
        )}
        <div ref={end} />
      </div>

      <div className="sticky bottom-4 mt-8">
        <div className="mb-3 flex flex-wrap gap-2">
          {CHIPS.map((c, i) => (
            <motion.button
              key={c}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.spatialDefault, delay: i * 0.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => ask(c)}
              disabled={busy}
              className="state h-9 rounded-sm border border-outline bg-surface px-3 text-[14px] text-on-surface"
            >
              {c}
            </motion.button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="relative rounded-[28px] p-[2px] transition-[background] duration-300"
          style={{ background: focused ? "var(--ai-gradient)" : "var(--outline)" }}
        >
          <div className="flex items-end gap-2 rounded-[26px] bg-surface py-2 pl-5 pr-2 dark:bg-surface-container">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              placeholder="Ask about Kaiuf's work"
              aria-label="Ask a question about Kaiuf"
              maxLength={2000}
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2 text-[16px] outline-none [field-sizing:content] placeholder:text-on-surface-variant"
            />
            <motion.button
              type="submit"
              aria-label="Send question"
              disabled={!input.trim() || busy}
              whileTap={{ scale: 0.9 }}
              className="state grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary"
            >
              <Icon name="send" size={20} />
            </motion.button>
          </div>
        </form>
        <p className="mt-2 text-center text-[12px] text-on-surface-variant">AI answers about Kaiuf&apos;s work. Check important details with him.</p>
      </div>
    </div>
  );
}
