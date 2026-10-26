"use client";

import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EGGS, EGG_EVENT, foundEggs, type EggId } from "@/lib/eggs";
import { spring } from "@/lib/motion";
import { Icon } from "@/components/Icon";
import { useCompose } from "@/components/providers/Compose";

const head = "text-[14px] text-on-surface-variant";

// ---------- Tic-tac-toe ----------
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
type Cell = "X" | "O" | null;
const winner = (b: Cell[]) => LINES.find(([a, c, d]) => b[a] && b[a] === b[c] && b[a] === b[d]);

function aiMove(b: Cell[]) {
  const free = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const tryFor = (p: Cell) => free.find((i) => winner(b.map((v, j) => (j === i ? p : v))));
  return tryFor("O") ?? tryFor("X") ?? (b[4] ? undefined : 4) ?? [0, 2, 6, 8].find((i) => !b[i]) ?? free[Math.floor(Math.random() * free.length)];
}

export function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [score, setScore] = useState({ you: 0, kaiuf: 0, draws: 0 });
  const win = winner(board);
  const full = board.every(Boolean);
  const done = !!win || full;
  const status = win ? (board[win[0]] === "X" ? "You win. Kaiuf demands a rematch." : "Kaiuf wins. He's competitive, sorry.") : full ? "Draw. Mutual respect." : "You're X. Your move.";

  const play = (i: number) => {
    if (board[i] || done) return;
    const next = board.map((v, j) => (j === i ? "X" : v)) as Cell[];
    if (!winner(next) && next.some((v) => !v)) {
      const m = aiMove(next);
      if (m !== undefined) next[m] = "O";
    }
    setBoard(next);
    const w = winner(next);
    if (w) setScore((s) => (next[w[0]] === "X" ? { ...s, you: s.you + 1 } : { ...s, kaiuf: s.kaiuf + 1 }));
    else if (next.every(Boolean)) setScore((s) => ({ ...s, draws: s.draws + 1 }));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <p className={head}>Tic-tac-toe vs. Kaiuf</p>
      <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-outline p-1.5" role="grid" aria-label="Tic-tac-toe board">
        {board.map((v, i) => (
          <button
            key={i}
            type="button"
            aria-label={v ? `${v} at ${i + 1}` : `Play square ${i + 1}`}
            onClick={() => play(i)}
            className={`state grid h-20 w-20 place-items-center rounded-lg bg-surface text-[40px] font-semibold ${win?.includes(i) ? "bg-tint-yellow" : ""}`}
            style={{ fontVariationSettings: '"ROND" 100' }}
          >
            <AnimatePresence>
              {v && (
                <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={spring.spatialFast} className={v === "X" ? "text-g-blue" : "text-g-red"}>
                  {v}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
      <p className="text-[18px] font-medium" aria-live="polite">
        {status}
      </p>
      <p className="text-[13px] text-on-surface-variant">
        You {score.you}, Kaiuf {score.kaiuf}, draws {score.draws}
      </p>
      {done && (
        <button type="button" onClick={() => setBoard(Array(9).fill(null))} className="state rounded-full bg-primary px-5 py-2 text-[14px] font-medium text-on-primary">
          Play again
        </button>
      )}
    </div>
  );
}

// ---------- Fidget spinner ----------
export function Spinner() {
  const rotate = useMotionValue(0);
  const vel = useRef(0);
  const drag = useRef<{ a: number; t: number } | null>(null);
  const el = useRef<HTMLDivElement>(null);
  const [rpm, setRpm] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag.current) {
        rotate.set(rotate.get() + vel.current * dt);
        vel.current *= Math.pow(0.55, dt);
        if (Math.abs(vel.current) < 4) vel.current = 0;
      }
      const r = Math.round(Math.abs(vel.current) / 6);
      setRpm(r);
      setBest((b) => Math.max(b, r));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rotate]);

  const angle = (e: React.PointerEvent) => {
    const r = el.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  return (
    <div className="flex flex-col items-center gap-3 p-6">
      <p className={head}>Fidget spinner. Flick it.</p>
      <motion.div
        ref={el}
        data-cursor="Flick"
        className="h-48 w-48 cursor-grab touch-none active:cursor-grabbing"
        style={{ rotate }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { a: angle(e), t: performance.now() };
          vel.current = 0;
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const a = angle(e);
          let d = a - drag.current.a;
          if (d > 180) d -= 360;
          if (d < -180) d += 360;
          const now = performance.now();
          rotate.set(rotate.get() + d);
          vel.current = (d / Math.max(1, now - drag.current.t)) * 1000;
          drag.current = { a, t: now };
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-label="Fidget spinner">
          {[
            [100, 38, "var(--g-blue)"],
            [154, 131, "var(--g-red)"],
            [46, 131, "var(--g-yellow)"],
          ].map(([x, y, c]) => (
            <g key={String(c)}>
              <line x1="100" y1="100" x2={x} y2={y} stroke={String(c)} strokeWidth="34" strokeLinecap="round" />
              <circle cx={x} cy={y} r="30" fill={String(c)} />
              <circle cx={x} cy={y} r="14" fill="var(--surface)" />
            </g>
          ))}
          <circle cx="100" cy="100" r="30" fill="var(--g-green)" />
          <circle cx="100" cy="100" r="12" fill="var(--surface)" />
        </svg>
      </motion.div>
      <button type="button" onClick={() => (vel.current += 2400)} className="state rounded-full bg-primary px-5 py-2 text-[14px] font-medium text-on-primary">
        Give it a spin
      </button>
      <p className="font-mono text-[13px] text-on-surface-variant" aria-live="off">
        {rpm} rpm · best {best}
      </p>
    </div>
  );
}

// ---------- Breathe ----------
const PHASES = [
  { label: "Breathe in", scale: 1.6, ms: 4000 },
  { label: "Hold", scale: 1.6, ms: 2000 },
  { label: "Breathe out", scale: 1, ms: 4000 },
];

export function Breathe() {
  const [step, setStep] = useState(0);
  const cycles = 3;
  const finished = step >= cycles * PHASES.length;
  const phase = PHASES[step % PHASES.length];

  useEffect(() => {
    if (finished) return;
    const t = setTimeout(() => setStep((s) => s + 1), phase.ms);
    return () => clearTimeout(t);
  }, [step, finished, phase.ms]);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <p className={head}>One minute. Just breathe.</p>
      <div className="grid h-48 w-48 place-items-center">
        <motion.div
          className="h-28 w-28 rounded-full bg-tint-blue"
          animate={{ scale: finished ? 1 : phase.scale, backgroundColor: finished ? "var(--tint-green)" : "var(--tint-blue)" }}
          transition={{ duration: phase.ms / 1000, ease: "easeInOut" }}
        />
      </div>
      <p className="text-[22px] font-medium" aria-live="polite">
        {finished ? "Nice. Calm brain, better decisions." : phase.label}
      </p>
      {finished && (
        <button type="button" onClick={() => setStep(0)} className="text-[14px] font-medium text-primary underline-offset-4 hover:underline">
          Again
        </button>
      )}
    </div>
  );
}

// ---------- sudo ----------
export function Sudo({ query }: { query: string }) {
  const compose = useCompose();
  const hire = /hire|kaiuf|recruit|intern/.test(query.toLowerCase());
  const lines = hire
    ? [`$ ${query}`, "[sudo] password for recruiter: ********", "Checking credentials… ok", "Granting access to: one (1) motivated engineer", "Permission granted. Opening compose…"]
    : [`$ ${query}`, "[sudo] password for visitor: ********", "visitor is not in the sudoers file. This incident will be reported.", "Hint: some commands work better with the word hire."];
  const [shown, setShown] = useState(0);
  const opened = useRef(false);

  useEffect(() => {
    if (shown < lines.length) {
      const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 150 : 520);
      return () => clearTimeout(t);
    }
    if (hire && !opened.current) {
      opened.current = true;
      setTimeout(() => compose.open({ subject: "Internship" }), 400);
    }
  }, [shown, lines.length, hire, compose]);

  return (
    <div className="bg-[#1b1c1e] p-5 font-mono text-[13px] leading-[1.8] text-[#e8eaed]">
      <div className="mb-3 flex gap-1.5" aria-hidden>
        <span className="h-3 w-3 rounded-full bg-g-red" />
        <span className="h-3 w-3 rounded-full bg-g-yellow" />
        <span className="h-3 w-3 rounded-full bg-g-green" />
      </div>
      {lines.slice(0, shown).map((l, i) => (
        <motion.p key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className={i === lines.length - 1 ? (hire ? "text-[#81c995]" : "text-[#f28b82]") : ""}>
          {l}
        </motion.p>
      ))}
      {shown < lines.length && <span className="inline-block h-4 w-2 animate-pulse bg-[#e8eaed]" />}
    </div>
  );
}

// ---------- Vibe check ----------
const VIBES: [RegExp, string][] = [
  [/cooked/, "Not cooked. Actively cooking: Aphelion AI and an MBBS study assistant are on the stove."],
  [/rizz/, "Unspoken rizz. Ships the prototype, lets the demo do the talking."],
  [/aura/, "Aura farming since day one: 10+ hackathons and a Best Performing Team trophy."],
  [/no cap/, "No cap: 9.04 CGPA while shipping side projects."],
  [/goated|slay/, "Goated with the RAG. Exact-match routing before vector search, every single time."],
  [/\bmid\b/, "Mid? Respectfully, the SIH 2025 grand finale disagrees."],
  [/delulu/, "Not delulu. The trophy is real: SIH 2026, Madurai."],
];

export function Cooked({ query }: { query: string }) {
  const line = VIBES.find(([re]) => re.test(query.toLowerCase()))?.[1] ?? "Vibe check passed. Builds things, breaks them on purpose, rebuilds them better.";
  return (
    <div className="p-5">
      <p className={head}>Vibe check</p>
      <p className="mt-2 text-[24px] font-medium leading-snug">{line}</p>
      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-[12px] text-on-surface-variant">
          <span>Cooking level</span>
          <span>Chef</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-surface-container-high">
          {["var(--g-blue)", "var(--g-red)", "var(--g-yellow)", "var(--g-green)"].map((c, i) => (
            <motion.span key={c} className="h-full" style={{ background: c }} initial={{ width: 0 }} animate={{ width: "25%" }} transition={{ delay: 0.2 + i * 0.25, duration: 0.35, ease: "easeOut" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Secrets collector ----------
export function EggCollection() {
  const [found, setFound] = useState<Set<EggId>>(new Set());
  useEffect(() => {
    const read = () => setFound(foundEggs());
    read();
    window.addEventListener(EGG_EVENT, read);
    return () => window.removeEventListener(EGG_EVENT, read);
  }, []);
  const pct = Math.round((found.size / EGGS.length) * 100);

  return (
    <div className="p-5">
      <p className={head}>Secrets found</p>
      <p className="mt-1 text-[28px] font-medium">
        {found.size} <span className="text-on-surface-variant">of {EGGS.length}</span>
      </p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-container-high">
        <motion.div className="h-full rounded-full bg-[linear-gradient(90deg,var(--g-blue),var(--g-red),var(--g-yellow),var(--g-green))]" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={spring.spatialSlow} />
      </div>
      <p className="mt-3 text-[14px] text-on-surface-variant">{found.size === EGGS.length ? "All of them. You're officially too curious. Kaiuf would like a word." : "Type things. Poke things. Wait around. Curiosity gets rewarded here."}</p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EGGS.map((e, i) => {
          const got = found.has(e.id);
          return (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.spatialDefault, delay: i * 0.015 }}
              className={`rounded-lg border px-3 py-2.5 ${got ? "border-transparent bg-primary-container text-on-primary-container" : "border-dashed border-outline text-on-surface-variant"}`}
            >
              <span className="flex items-center gap-1.5 text-[14px] font-medium">
                {got ? <Icon name="check" size={16} /> : <span aria-hidden>?</span>}
                {got ? e.name : "???"}
              </span>
              {!got && <span className="mt-0.5 block text-[12px]">{e.hint}</span>}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
