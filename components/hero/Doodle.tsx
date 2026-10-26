"use client";

import { AnimatePresence, motion, useAnimationControls, useMotionValue, useSpring } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { shapePath } from "@/lib/shapes";
import { spring } from "@/lib/motion";
import { discover } from "@/lib/eggs";

const BODY = shapePath("cookie", 64);
const IDLE_MS = 25_000;

const LINES = [
  "hi!",
  "ship it.",
  "that tickles",
  "I run on caffeine",
  "ask me nothing, search everything",
  "psst, try the lucky button",
  "I'm a cookie, technically",
  "build. break. rebuild.",
  "did you try the console?",
  "boop",
];

type Mood = "idle" | "typing" | "dizzy" | "sleep";

/**
 * A tiny shape-built character. Eyes follow the cursor, it hops on every keystroke,
 * talks when poked, gets dizzy if you poke too much, and naps if you leave it alone.
 */
export function Doodle() {
  const ref = useRef<HTMLButtonElement>(null);
  const body = useAnimationControls();
  const px = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const py = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const [blink, setBlink] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");
  const [say, setSay] = useState<string | null>(null);
  const pokes = useRef<number[]>([]);
  const line = useRef(0);
  const moodRef = useRef<Mood>("idle");
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setMoodBoth = useCallback((m: Mood) => {
    moodRef.current = m;
    setMood(m);
  }, []);

  const speak = useCallback((text: string, ms = 2200) => {
    setSay(text);
    if (sayTimer.current) clearTimeout(sayTimer.current);
    sayTimer.current = setTimeout(() => setSay(null), ms);
  }, []);

  // Falls asleep after a while; any activity wakes it (and that's a secret).
  const armIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setMoodBoth("sleep"), IDLE_MS);
  }, [setMoodBoth]);

  const wake = useCallback(() => {
    if (moodRef.current === "sleep") {
      setMoodBoth("idle");
      body.start({ y: [0, -18, 0] }, { duration: 0.4 });
      speak("huh? I'm up, I'm up");
      discover("nap");
    }
    armIdle();
  }, [armIdle, body, setMoodBoth, speak]);

  useEffect(() => {
    let typingTimer: ReturnType<typeof setTimeout> | undefined;
    const move = (e: PointerEvent) => {
      wake();
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 200) * 3.2;
      px.set((dx / d) * k);
      py.set((dy / d) * k);
    };
    const hop = () => {
      wake();
      if (moodRef.current === "idle") setMoodBoth("typing");
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => moodRef.current === "typing" && setMoodBoth("idle"), 700);
      body.start({ y: [0, -10, 0], scaleY: [1, 1.08, 0.94, 1], scaleX: [1, 0.94, 1.06, 1] }, { duration: 0.36, ease: "easeOut" });
    };
    const dance = () => body.start({ rotate: [0, -20, 20, -20, 20, 0], y: [0, -16, 0, -16, 0] }, { duration: 1 });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("keydown", wake);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("kaiuf:keystroke", hop);
    window.addEventListener("kaiuf:dance", dance);
    armIdle();
    const blinker = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3800);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("kaiuf:keystroke", hop);
      window.removeEventListener("kaiuf:dance", dance);
      clearInterval(blinker);
      clearTimeout(typingTimer);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (sayTimer.current) clearTimeout(sayTimer.current);
    };
  }, [armIdle, body, px, py, setMoodBoth, wake]);

  const poke = () => {
    wake();
    const now = Date.now();
    pokes.current = [...pokes.current.filter((t) => now - t < 2000), now];
    if (pokes.current.length >= 5) {
      pokes.current = [];
      setMoodBoth("dizzy");
      speak("okay okay I'm dizzy", 2400);
      body.start({ rotate: [0, 720], scale: [1, 0.85, 1] }, { duration: 1.1, ease: [0.2, 0, 0, 1] }).then(() => {
        body.set({ rotate: 0 });
        setTimeout(() => setMoodBoth("idle"), 1200);
      });
      discover("poke");
      return;
    }
    body.start({ scaleX: [1, 1.25, 0.9, 1], scaleY: [1, 0.75, 1.1, 1] }, { duration: 0.45 });
    speak(LINES[line.current++ % LINES.length]);
  };

  const asleep = mood === "sleep";
  const dizzy = mood === "dizzy";

  return (
    <div className="relative">
      <AnimatePresence>
        {(say || asleep) && (
          <motion.span
            key={asleep ? "zzz" : say}
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={spring.spatialFast}
            className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface-container-high px-3 py-1 text-[13px] font-medium shadow-search"
            aria-live="polite"
          >
            {asleep ? <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>z z z</motion.span> : say}
          </motion.span>
        )}
      </AnimatePresence>
      <button ref={ref} type="button" onClick={poke} aria-label="Poke the doodle" data-cursor="Poke" className="block rounded-full">
        <motion.svg width="56" height="56" viewBox="0 0 64 64" aria-hidden animate={body} initial={{ y: 0 }} style={{ originY: 1 }} transition={spring.spatialFast} className="overflow-visible">
          <motion.g animate={{ rotate: 360 }} transition={{ duration: asleep ? 120 : 40, repeat: Infinity, ease: "linear" }} style={{ originX: "32px", originY: "32px" }}>
            <path d={BODY} fill={dizzy ? "var(--g-red)" : asleep ? "#7baaf7" : "var(--g-blue)"} style={{ transition: "fill 300ms" }} />
          </motion.g>
          {[22, 42].map((cx) =>
            asleep ? (
              <path key={cx} d={`M${cx - 6} 29 Q${cx} 33 ${cx + 6} 29`} fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
            ) : dizzy ? (
              <text key={cx} x={cx} y={33} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">
                @
              </text>
            ) : (
              <g key={cx}>
                <ellipse cx={cx} cy={28} rx={7} ry={blink ? 1 : 8} fill="#fff" style={{ transition: "ry 80ms" }} />
                {!blink && <motion.circle cx={cx} cy={29} r={3.4} fill="#202124" style={{ x: px, y: py }} />}
              </g>
            ),
          )}
          {mood === "typing" || dizzy ? (
            <ellipse cx="32" cy="44" rx="3.5" ry="4" fill="#fff" />
          ) : asleep ? (
            <path d="M28 44 H36" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          ) : (
            <path d="M26 42 Q32 47 38 42" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
          )}
        </motion.svg>
      </button>
    </div>
  );
}
