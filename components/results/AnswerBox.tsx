"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { about, site } from "@/content/site";
import type { AnswerKind } from "@/lib/search";
import { spring } from "@/lib/motion";
import { Icon } from "@/components/Icon";
import { useCompose } from "@/components/providers/Compose";

const box = "mb-6 overflow-hidden rounded-xl border border-outline";

export function AnswerBox({ kind }: { kind: AnswerKind }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.spatialDefault}
      aria-live="polite"
      className={box}
    >
      {kind === "hire" && <Hire />}
      {kind === "resume" && <Resume />}
      {kind === "cgpa" && <Big value="9.04" unit="/ 10 CGPA" note={`${about.education.degree}, ${about.education.school}`} />}
      {kind === "education" && <Big value="B.E. CSE" unit="(AI & ML)" note={`${about.education.school}. CGPA ${about.education.cgpa}.`} />}
      {kind === "contact" && <Contact />}
      {kind === "hackathons" && <Wins />}
      {kind === "coin" && <Coin />}
      {kind === "die" && <Die />}
    </motion.section>
  );
}

function Big({ value, unit, note }: { value: string; unit: string; note: string }) {
  return (
    <div className="p-5">
      <p className="text-[14px] text-on-surface-variant">Kaiuf › {unit.includes("CGPA") ? "grades" : "education"}</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-[44px] font-medium leading-none" style={{ fontVariationSettings: '"ROND" 100' }}>
          {value}
        </span>
        <span className="text-[18px] text-on-surface-variant">{unit}</span>
      </p>
      <p className="mt-2 text-[14px] text-on-surface-variant">{note}</p>
    </div>
  );
}

function Hire() {
  const compose = useCompose();
  return (
    <div className="p-5">
      <p className="text-[14px] text-on-surface-variant">Is Kaiuf available for hire?</p>
      {site.status ? (
        <p className="mt-2 flex items-center gap-3 text-[28px] font-medium leading-tight">
          <span className="pulse-dot h-3 w-3 shrink-0 rounded-full bg-g-green" />
          {site.status}
        </p>
      ) : (
        <p className="mt-2 text-[24px] font-medium">Ask directly. He replies.</p>
      )}
      <p className="mt-2 max-w-[60ch] text-[14px] text-on-surface-variant">
        Internships, freelance builds and hackathon teams. Best fit: AI systems with real retrieval, full-stack prototypes, and anything XR or games.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={(e) => compose.open({ origin: e.currentTarget, subject: "Internship" })} className="state soft inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-medium text-on-primary">
          <Icon name="mail" size={18} /> Write to Kaiuf
        </button>
        <a href={site.resume} target="_blank" rel="noreferrer" className="state soft inline-flex h-10 items-center gap-2 rounded-full border border-outline px-5 text-[14px] font-medium text-primary">
          <Icon name="doc" size={18} /> Resume
        </a>
      </div>
    </div>
  );
}

function Resume() {
  return (
    <a href={site.resume} target="_blank" rel="noreferrer" className="group flex items-center gap-4 p-5" data-cursor="Open">
      <span className="grid h-16 w-14 shrink-0 place-items-center rounded-sm bg-g-red text-[12px] font-medium text-white">PDF</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] text-result-url">kaiuf › resume</span>
        <span className="draw-underline text-[20px] text-link">Kaiuf_M_Resume.pdf</span>
        <span className="block text-[14px] text-on-surface-variant">AI / ML engineer in progress. Full-stack. XR & games. One page.</span>
      </span>
      <Icon name="open" size={22} className="text-on-surface-variant" />
    </a>
  );
}

function Contact() {
  const compose = useCompose();
  return (
    <div className="flex flex-wrap items-center gap-4 p-5">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-tint-red text-g-red">
        <Icon name="mail" size={28} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[20px]">Got an interesting problem?</p>
        <p className="text-[14px] text-on-surface-variant">Let&apos;s skip the bla-bla. {site.email}</p>
      </div>
      <button type="button" onClick={(e) => compose.open({ origin: e.currentTarget })} className="state soft inline-flex h-10 items-center rounded-full bg-primary px-5 text-[14px] font-medium text-on-primary">
        Compose
      </button>
    </div>
  );
}

const WINS = [
  { title: "Best Performing Team", detail: "SIH 2026 IDE Bootcamp, Thiagarajar College of Engineering, Madurai. May 2026.", color: "var(--g-yellow)" },
  { title: "National finalist", detail: "Smart India Hackathon 2025, with Seismora.", color: "var(--g-green)" },
  { title: "Global Game Jam 2026", detail: "Kerala site. A weekend of building games.", color: "var(--g-blue)" },
  { title: "10+ hackathons", detail: "Prototyping and pitching under tight deadlines.", color: "var(--g-red)" },
];

function Wins() {
  return (
    <div className="p-5">
      <p className="text-[14px] text-on-surface-variant">Kaiuf › hackathon wins</p>
      <ol className="mt-3 space-y-3">
        {WINS.map((w, i) => (
          <motion.li
            key={w.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring.spatialDefault, delay: 0.1 + i * 0.05 }}
            className="flex gap-3"
          >
            <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#202124]" style={{ background: w.color }}>
              <Icon name="lucky" size={16} />
            </span>
            <span>
              <span className="block text-[16px] font-medium">{w.title}</span>
              <span className="block text-[14px] text-on-surface-variant">{w.detail}</span>
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function Coin() {
  const [flips, setFlips] = useState(0);
  const [side, setSide] = useState<"Heads" | "Tails" | null>(null);
  const flip = () => {
    const next = crypto.getRandomValues(new Uint8Array(1))[0] % 2 === 0 ? "Heads" : "Tails";
    setSide(null);
    setFlips((f) => f + 1);
    setTimeout(() => setSide(next), 900);
  };
  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <p className="text-[14px] text-on-surface-variant">Flip a coin</p>
      <div style={{ perspective: 600 }}>
        <motion.button
          type="button"
          aria-label="Flip the coin"
          onClick={flip}
          key={flips}
          initial={{ rotateY: 0, y: 0 }}
          animate={flips ? { rotateY: [0, 1800], y: [0, -60, 0] } : {}}
          transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
          className="grid h-24 w-24 place-items-center rounded-full bg-g-yellow text-[34px] font-semibold text-[#202124] shadow-[inset_0_-6px_0_rgba(0,0,0,.15)]"
          style={{ fontVariationSettings: '"ROND" 100' }}
        >
          K
        </motion.button>
      </div>
      <p className="min-h-8 text-[24px] font-medium" aria-live="polite">
        {side ?? (flips ? "…" : "Tap to flip")}
      </p>
      {flips > 0 && (
        <button type="button" onClick={flip} className="text-[14px] font-medium text-primary underline-offset-4 hover:underline">
          Flip again
        </button>
      )}
    </div>
  );
}

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};

function Die() {
  const [value, setValue] = useState(0);
  const [rolls, setRolls] = useState(0);
  const roll = () => {
    setRolls((r) => r + 1);
    setValue((crypto.getRandomValues(new Uint8Array(1))[0] % 6) + 1);
  };
  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <p className="text-[14px] text-on-surface-variant">Roll a die</p>
      <motion.button
        type="button"
        aria-label="Roll the die"
        onClick={roll}
        key={rolls}
        initial={{ rotate: 0, scale: 1 }}
        animate={rolls ? { rotate: [0, 200, 360], scale: [1, 0.8, 1] } : {}}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        className="relative h-24 w-24 rounded-[22px] bg-surface shadow-float"
      >
        <AnimatePresence mode="wait">
          <motion.span key={value} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.35 } }} className="absolute inset-3 grid grid-cols-3 grid-rows-3">
            {(PIPS[value || 6] ?? []).map(([x, y]) => (
              <span key={`${x}${y}`} className="m-auto h-3.5 w-3.5 rounded-full bg-g-red" style={{ gridColumn: x + 1, gridRow: y + 1 }} />
            ))}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <p className="min-h-8 text-[24px] font-medium" aria-live="polite">
        {value ? `You rolled ${value}` : "Tap to roll"}
      </p>
    </div>
  );
}
