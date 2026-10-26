"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { site } from "@/content/site";
import { spring } from "@/lib/motion";
import { Icon } from "@/components/Icon";
import { useSnackbar } from "@/components/providers/Snackbar";

type Draft = { from: string; subject: string; message: string };
type OpenOpts = { subject?: string; origin?: Element | null };
type Ctx = { open: (opts?: OpenOpts) => void; isOpen: boolean };

const ComposeCtx = createContext<Ctx | null>(null);
export const useCompose = () => useContext(ComposeCtx)!;

const QUICK = ["Internship", "Freelance project", "Hackathon team", "Just saying hi"];
const EMPTY: Draft = { from: "", subject: "", message: "" };
const SEND_DELAY = 5000;

type Rect = { left: number; top: number; width: number; height: number };

function targetRect(): Rect {
  if (innerWidth < 600) return { left: 0, top: innerHeight * 0.08, width: innerWidth, height: innerHeight * 0.92 };
  const width = 520;
  const height = Math.min(560, innerHeight - 48);
  return { left: innerWidth - width - 24, top: innerHeight - height, width, height };
}

export function ComposeProvider({ children }: { children: React.ReactNode }) {
  const snackbar = useSnackbar();
  const [isOpen, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [from, setFrom] = useState<Rect | null>(null);
  const [exitMode, setExitMode] = useState<"close" | "send">("close");
  const [plane, setPlane] = useState<Rect | null>(null);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canSend, setCanSend] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOpen || canSend !== null) return;
    fetch("/api/contact")
      .then((r) => r.json())
      .then((d: { configured?: boolean }) => setCanSend(!!d.configured))
      .catch(() => setCanSend(false));
  }, [isOpen, canSend]);

  const open = useCallback((opts?: OpenOpts) => {
    const r = opts?.origin?.getBoundingClientRect();
    setFrom(r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null);
    if (opts?.subject) setDraft((d) => ({ ...d, subject: opts.subject! }));
    setExitMode("close");
    setMinimized(false);
    setOpen(true);
  }, []);

  const deliver = useCallback(
    async (d: Draft) => {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(d),
        });
        if (!res.ok) throw new Error(String(res.status));
        setDraft(EMPTY);
      } catch {
        const mailto = `mailto:${site.email}?subject=${encodeURIComponent(d.subject || "Hello")}&body=${encodeURIComponent(d.message)}`;
        snackbar.show({
          message: "Couldn't send from here. Your draft is saved.",
          actionLabel: "Email instead",
          onAction: () => (window.location.href = mailto),
          duration: 8000,
        });
      }
    },
    [snackbar],
  );

  const send = useCallback(
    (d: Draft, windowRect: Rect) => {
      if (canSend === false) {
        // No delivery configured: hand the draft to the visitor's own mail app.
        window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(d.subject || "Hello")}&body=${encodeURIComponent(d.message)}`;
        snackbar.show({ message: "Opening your email app with this draft." });
        return;
      }
      setExitMode("send");
      setPlane(windowRect);
      setOpen(false);
      pending.current = setTimeout(() => {
        pending.current = null;
        deliver(d);
      }, SEND_DELAY);
      snackbar.show({
        message: "Message sent. Kaiuf will see it.",
        actionLabel: "Undo",
        duration: SEND_DELAY,
        onAction: () => {
          if (pending.current) clearTimeout(pending.current);
          pending.current = null;
          setFrom(null);
          setExitMode("close");
          setOpen(true);
        },
      });
    },
    [deliver, snackbar, canSend],
  );

  return (
    <ComposeCtx.Provider value={{ open, isOpen }}>
      {children}
      <AnimatePresence custom={exitMode}>
        {isOpen && (
          <ComposeWindow
            key="compose"
            from={from}
            draft={draft}
            setDraft={setDraft}
            minimized={minimized}
            setMinimized={setMinimized}
            onClose={() => {
              setExitMode("close");
              setOpen(false);
            }}
            onSend={send}
            viaMailApp={canSend === false}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{plane && <PaperPlane key="plane" rect={plane} onDone={() => setPlane(null)} />}</AnimatePresence>
    </ComposeCtx.Provider>
  );
}

function ComposeWindow({
  from,
  draft,
  setDraft,
  minimized,
  setMinimized,
  onClose,
  onSend,
  viaMailApp,
}: {
  viaMailApp: boolean;
  from: Rect | null;
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  minimized: boolean;
  setMinimized: (v: boolean) => void;
  onClose: () => void;
  onSend: (d: Draft, rect: Rect) => void;
}) {
  const [target] = useState(targetRect);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const ref = useRef<HTMLFormElement>(null);
  const firstField = useRef<HTMLInputElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const id = useId();
  const compact = target.width === innerWidth;

  const initial = from
    ? {
        x: from.left - target.left,
        y: from.top - target.top,
        scaleX: from.width / target.width,
        scaleY: from.height / target.height,
        opacity: 0.4,
        borderRadius: 999,
      }
    : { y: 60, opacity: 0, scaleX: 1, scaleY: 1, x: 0, borderRadius: 16 };

  useEffect(() => {
    const t = setTimeout(() => firstField.current?.focus({ preventScroll: true }), 250);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const validate = () => {
    const e: typeof errors = {};
    if (!draft.from.trim()) e.from = "Add an email so Kaiuf can reply.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.from.trim())) e.from = "That email looks off. Check for typos.";
    if (!draft.message.trim()) e.message = "Say something. Even “hi” works.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (honeypot.current?.value) return onClose();
    if (!validate()) return;
    const r = ref.current!.getBoundingClientRect();
    onSend(draft, { left: r.left, top: r.top, width: r.width, height: r.height });
  };

  const field = (k: keyof Draft) => ({
    value: draft[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraft((d) => ({ ...d, [k]: e.target.value }));
      if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
    },
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `${id}-${k}-err` : undefined,
  });

  return (
    <motion.form
      ref={ref}
      role="dialog"
      aria-label="New message to Kaiuf"
      onSubmit={submit}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
      }}
      data-lenis-prevent
      className="fixed z-[70] flex flex-col overflow-hidden bg-surface shadow-float dark:bg-surface-container"
      style={{
        left: target.left,
        top: minimized ? undefined : target.top,
        bottom: minimized ? 0 : undefined,
        width: compact || !minimized ? target.width : 280,
        height: minimized ? 48 : target.height,
        transformOrigin: "0 0",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        ...(minimized && !compact ? { left: innerWidth - 280 - 24 } : {}),
      }}
      initial={initial}
      animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, borderRadius: 16 }}
      exit="exit"
      variants={{
        exit: (mode: "close" | "send") =>
          mode === "send"
            ? { scaleX: 0.08, scaleY: 0.08, x: target.width * 0.46, y: target.height * 0.46, opacity: 0, transition: { duration: 0.32, ease: [0.3, 0, 0.8, 0.15] } }
            : from
              ? { ...initial, opacity: 0, transition: { ...spring.spatialFast, opacity: { duration: 0.2 } } }
              : { y: 40, opacity: 0, transition: { duration: 0.18 } },
      }}
      transition={spring.spatialDefault}
    >
      <div
        className="flex h-12 shrink-0 cursor-default items-center gap-1 bg-surface-container-high pl-4 pr-1.5 dark:bg-surface-container-highest"
        onClick={() => minimized && setMinimized(false)}
      >
        <h2 className="flex-1 text-[14px] font-medium">New message</h2>
        {!compact && (
          <button
            type="button"
            aria-label={minimized ? "Expand" : "Minimise"}
            className="state grid h-9 w-9 place-items-center rounded-full text-on-surface-variant"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(!minimized);
            }}
          >
            <Icon name={minimized ? "chevronDown" : "minimize"} size={18} className={minimized ? "rotate-180" : ""} />
          </button>
        )}
        <button type="button" aria-label="Close" className="state grid h-9 w-9 place-items-center rounded-full text-on-surface-variant" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </div>

      {!minimized && (
        <motion.div
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.2 } }}
        >
          <div className="flex items-center gap-2 border-b border-outline px-4 py-2 text-[14px]">
            <span className="w-16 text-on-surface-variant">To</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high py-1 pl-1 pr-3 text-[14px] dark:bg-surface-container-highest">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-g-blue text-[12px] font-medium text-white">K</span>
              Kaiuf
            </span>
          </div>
          <label className="flex items-center gap-2 border-b border-outline px-4 text-[14px]">
            <span className="w-16 shrink-0 text-on-surface-variant">From</span>
            <input
              ref={firstField}
              type="email"
              autoComplete="email"
              placeholder="you@somewhere.com"
              className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-on-surface-variant/70"
              {...field("from")}
            />
          </label>
          {errors.from && (
            <p id={`${id}-from-err`} className="px-4 pt-1.5 text-[13px] text-g-red">
              {errors.from}
            </p>
          )}
          <label className="flex items-center gap-2 border-b border-outline px-4 text-[14px]">
            <span className="w-16 shrink-0 text-on-surface-variant">Subject</span>
            <input className="min-w-0 flex-1 bg-transparent py-3 outline-none" placeholder="What's this about?" {...field("subject")} />
          </label>
          <div className="flex flex-wrap gap-2 px-4 pt-3" role="group" aria-label="Quick subjects">
            {QUICK.map((q) => {
              const on = draft.subject === q;
              return (
                <motion.button
                  key={q}
                  type="button"
                  aria-pressed={on}
                  whileTap={{ scale: 0.95 }}
                  transition={spring.spatialFast}
                  onClick={() => setDraft((d) => ({ ...d, subject: on ? "" : q }))}
                  className={`state inline-flex h-8 items-center gap-1 border px-3 text-[13px] font-medium transition-[border-radius,background-color,color] duration-300 ${
                    on ? "rounded-full border-transparent bg-primary-container text-on-primary-container" : "rounded-sm border-outline text-on-surface-variant"
                  }`}
                >
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.svg key="check" viewBox="0 0 24 24" width={16} height={16} initial={{ width: 0 }} animate={{ width: 16 }} exit={{ width: 0 }} className="-ml-1">
                        <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25, delay: 0.05 }} />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                  {q}
                </motion.button>
              );
            })}
          </div>
          <textarea
            aria-label="Message"
            placeholder="Got an interesting problem? Let's skip the bla-bla."
            className="min-h-0 flex-1 resize-none bg-transparent px-4 py-3 text-[15px] outline-none placeholder:text-on-surface-variant/70"
            {...field("message")}
          />
          {errors.message && (
            <p id={`${id}-message-err`} className="px-4 pb-1 text-[13px] text-g-red">
              {errors.message}
            </p>
          )}
          <input ref={honeypot} name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0" />
          <div className="flex items-center gap-3 px-4 pb-4 pt-2">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              transition={spring.spatialFast}
              className="state soft inline-flex h-10 items-center gap-2 rounded-full bg-primary pl-6 pr-5 text-[14px] font-medium text-on-primary"
            >
              {viaMailApp ? "Send via email app" : "Send"}
              <Icon name="send" size={18} />
            </motion.button>
            <span className="hidden text-[12px] text-on-surface-variant sm:inline">⌘/Ctrl + Enter</span>
            <a href={`mailto:${site.email}`} className="ml-auto text-[13px] text-on-surface-variant underline-offset-4 hover:underline">
              or email {site.email}
            </a>
          </div>
        </motion.div>
      )}
    </motion.form>
  );
}

function PaperPlane({ rect, onDone }: { rect: Rect; onDone: () => void }) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[75] text-g-blue"
      initial={{ x: cx - 20, y: cy - 20, rotate: -10, scale: 0.4, opacity: 0 }}
      animate={{
        x: [cx - 20, cx - 140, cx + 120, innerWidth + 80],
        y: [cy - 20, cy - 120, cy - 320, -120],
        rotate: [-10, -40, -20, -30],
        scale: [0.4, 1.2, 1, 0.8],
        opacity: [0, 1, 1, 0.9],
      }}
      transition={{ duration: 1.1, ease: [0.2, 0, 0, 1], times: [0, 0.25, 0.65, 1] }}
      onAnimationComplete={onDone}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.5 11.3 21 3.2c.6-.27 1.2.33.93.93L13.8 22.6a.7.7 0 0 1-1.3-.08l-2.2-7.1-7.1-2.2a.7.7 0 0 1-.08-1.3Zm8.9 2.9 1.6 5.2 6.1-13.6-7.7 8.4Zm-1-1L18.1 5 4.6 11.4l5.8 1.8Z" />
      </svg>
    </motion.div>
  );
}
