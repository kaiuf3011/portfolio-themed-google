"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import type { Project } from "@/content/site";
import { shapePath, type ShapeName } from "@/lib/shapes";
import { spring } from "@/lib/motion";
import { KnightGame } from "@/components/projects/KnightGame";

const tint: Record<Project["color"], string> = {
  blue: "var(--tint-blue)",
  red: "var(--tint-red)",
  yellow: "var(--tint-yellow)",
  green: "var(--tint-green)",
};
const solid: Record<Project["color"], string> = {
  blue: "var(--g-blue)",
  red: "var(--g-red)",
  yellow: "var(--g-yellow)",
  green: "var(--g-green)",
};

const THUMB_SHAPE: Record<string, ShapeName> = {
  "aphelion-ai": "sunny",
  "rgu-ai-assistant": "cookie",
  "jharkhand-safety-ar": "gem",
  seismora: "clover",
  "the-knight": "softBurst",
  "mbbs-study-assistant": "pill",
};

/** Small shape-masked emblem shown on the right of a search result. */
export function ProjectThumb({ project, className = "" }: { project: Project; className?: string }) {
  const shape = THUMB_SHAPE[project.slug] ?? "cookie";
  const clip = `path("${shapePath(shape, 104)}")`;
  return (
    <div className={`relative h-[104px] w-[104px] shrink-0 ${className}`} style={{ clipPath: clip }}>
      {project.photo ? (
        <Image src={project.photo.src} alt="" fill sizes="104px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center" style={{ background: tint[project.color], color: solid[project.color] }}>
          <Emblem slug={project.slug} />
        </div>
      )}
    </div>
  );
}

function Emblem({ slug }: { slug: string }) {
  switch (slug) {
    case "aphelion-ai":
      return (
        <svg viewBox="0 0 48 48" width="52" height="52" aria-hidden>
          <circle cx="24" cy="24" r="9" fill="var(--g-yellow)" />
          <ellipse cx="24" cy="24" rx="20" ry="8" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(-25 24 24)" />
          <circle cx="42" cy="17" r="3" fill="currentColor" />
        </svg>
      );
    case "rgu-ai-assistant":
      return (
        <svg viewBox="0 0 48 48" width="52" height="52" aria-hidden>
          <rect x="4" y="8" width="28" height="18" rx="9" fill="currentColor" />
          <rect x="16" y="24" width="28" height="16" rx="8" fill="var(--g-blue)" />
          <circle cx="24" cy="32" r="2" fill="#fff" />
          <circle cx="30" cy="32" r="2" fill="#fff" />
          <circle cx="36" cy="32" r="2" fill="#fff" />
        </svg>
      );
    case "jharkhand-safety-ar":
      return (
        <svg viewBox="0 0 48 48" width="52" height="52" aria-hidden>
          <path d="M24 6 44 40H4L24 6Z" fill="var(--g-yellow)" stroke="#202124" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="22.5" y="17" width="3" height="12" rx="1.5" fill="#202124" />
          <circle cx="24" cy="34" r="2" fill="#202124" />
        </svg>
      );
    case "the-knight":
      return (
        <svg viewBox="0 0 12 12" width="48" height="48" shapeRendering="crispEdges" aria-hidden>
          <rect x="3" y="1" width="6" height="5" fill="#9aa0a6" />
          <rect x="4" y="3" width="4" height="1" fill="#202124" />
          <rect x="7" y="0" width="2" height="2" fill="var(--g-red)" />
          <rect x="3" y="6" width="6" height="4" fill="var(--g-blue)" />
          <rect x="3" y="10" width="2" height="2" fill="#5f6368" />
          <rect x="7" y="10" width="2" height="2" fill="#5f6368" />
          <rect x="10" y="4" width="1" height="6" fill="#dadce0" />
        </svg>
      );
    case "mbbs-study-assistant":
      return (
        <svg viewBox="0 0 48 48" width="52" height="52" aria-hidden>
          <rect x="10" y="8" width="28" height="20" rx="4" fill="currentColor" opacity=".35" transform="rotate(-8 24 18)" />
          <rect x="8" y="16" width="32" height="22" rx="4" fill="currentColor" />
          <path d="M24 21v12M18 27h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

/** The big visual at the top of a case study. */
export function ProjectVisual({ project }: { project: Project }) {
  const box = "relative w-full overflow-hidden rounded-xl";
  switch (project.slug) {
    case "aphelion-ai":
      return <FluxVisual className={box} />;
    case "rgu-ai-assistant":
      return <ChatVisual className={box} />;
    case "jharkhand-safety-ar":
      return <HazardVisual className={box} />;
    case "seismora":
      return <SeismoraVisual className={box} project={project} />;
    case "the-knight":
      return (
        <div className={`${box} aspect-[16/9] bg-[#202124]`}>
          <KnightGame />
        </div>
      );
    case "mbbs-study-assistant":
      return <FlashcardVisual className={box} />;
    default:
      return null;
  }
}

function FluxVisual({ className }: { className: string }) {
  // Illustrative waveform (not real mission data): a quiet baseline with two flare spikes.
  const pts = Array.from({ length: 120 }, (_, i) => {
    const x = (i / 119) * 600;
    const flare = (c: number, w: number, h: number) => h * Math.exp(-((i - c) ** 2) / w);
    const y = 150 - (14 * Math.sin(i / 6) + 6 * Math.sin(i / 2.3) + flare(42, 18, 70) + flare(88, 30, 105));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <div className={`${className} aspect-[16/9] bg-[#0b1220] p-5 text-[#e8eaed]`}>
      <div className="flex items-center gap-2 font-mono text-[12px] text-[#9aa0a6]">
        <span className="h-2 w-2 rounded-full bg-g-green" />
        Mission control
        <span className="ml-auto">Illustrative</span>
      </div>
      <svg viewBox="0 0 600 200" className="mt-3 h-[70%] w-full" preserveAspectRatio="none" aria-label="Illustrative solar X-ray flux curve with two flares">
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#ffffff14" />
        ))}
        <motion.polyline
          points={pts.join(" ")}
          fill="none"
          stroke="var(--g-yellow)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, ease: [0.2, 0, 0, 1] }}
        />
      </svg>
      <div className="mt-2 flex flex-wrap gap-2 font-mono text-[12px]">
        {["SoLEXS", "HEL1OS", "X-ray flux"].map((l, i) => (
          <span key={l} className="rounded-full border border-white/15 px-2.5 py-0.5" style={{ color: ["#8ab4f8", "#f28b82", "#fdd663"][i] }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChatVisual({ className }: { className: string }) {
  const step = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };
  return (
    <div className={`${className} flex aspect-[16/9] flex-col justify-center gap-3 bg-surface-container p-5 sm:p-8`}>
      <motion.div {...step} transition={{ ...spring.spatialDefault, delay: 0.1 }} className="ml-auto max-w-[80%] rounded-xl rounded-br-xs bg-primary px-4 py-2.5 text-[15px] text-on-primary">
        What&apos;s the fee structure for CSE AI&amp;ML?
      </motion.div>
      <motion.div {...step} transition={{ ...spring.spatialDefault, delay: 0.5 }} className="mx-auto flex flex-wrap items-center gap-2 font-mono text-[12px] text-on-surface-variant">
        <span className="rounded-full bg-surface px-2.5 py-1">intent: fees</span>
        <span className="rounded-full bg-tint-green px-2.5 py-1 text-on-surface">exact-match ✓</span>
        <span className="rounded-full bg-surface px-2.5 py-1">top-k: 4</span>
      </motion.div>
      <motion.div {...step} transition={{ ...spring.spatialDefault, delay: 0.9 }} className="max-w-[85%] rounded-xl rounded-bl-xs bg-surface px-4 py-3 text-[15px]">
        Here&apos;s the current CSE (AI &amp; ML) fee breakdown, from the admissions handbook…
        <span className="mt-2 block w-fit rounded-full bg-surface-container-high px-2.5 py-0.5 font-mono text-[12px] text-on-surface-variant">source: admissions.md</span>
      </motion.div>
    </div>
  );
}

function HazardVisual({ className }: { className: string }) {
  return (
    <div className={`${className} aspect-[16/9] bg-[#1b1f24]`}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect x="0" y="130" width="320" height="50" fill="#2a2f36" />
        <rect x="40" y="70" width="70" height="60" fill="#3c4043" />
        <circle cx="210" cy="78" r="12" fill="#9aa0a6" />
        <rect x="196" y="92" width="28" height="40" rx="6" fill="#5f6368" />
        <rect x="250" y="96" width="40" height="34" fill="#fbbc04" opacity=".8" />
      </svg>
      <motion.div
        className="absolute left-[56%] top-[30%] h-[48%] w-[22%] rounded-sm border-2 border-g-red"
        initial={{ opacity: 0, scale: 1.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring.spatialFast, delay: 0.6 }}
      >
        <span className="absolute -top-6 left-0 whitespace-nowrap rounded-xs bg-g-red px-1.5 py-0.5 font-mono text-[11px] text-white">HAZARD 0.94</span>
        <span className="absolute -bottom-6 left-0 whitespace-nowrap rounded-xs bg-g-yellow px-1.5 py-0.5 font-mono text-[11px] text-[#202124]">PPE MISSING</span>
      </motion.div>
      <motion.div
        aria-hidden
        className="absolute inset-x-0 h-0.5 bg-g-green/70 shadow-[0_0_12px_var(--g-green)]"
        animate={{ top: ["8%", "92%", "8%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function SeismoraVisual({ className, project }: { className: string; project: Project }) {
  return (
    <div className={`${className} grid aspect-[16/9] grid-cols-[1fr_1.1fr] bg-tint-green`}>
      <div className="relative">
        <Image src={project.photo!.src} alt={project.photo!.alt} fill sizes="(min-width: 840px) 400px, 50vw" className="object-cover" priority />
        <span className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-3 py-1 text-[12px] font-medium">Prototype, SIH 2025 finale</span>
      </div>
      <svg viewBox="0 0 200 160" className="h-full w-full p-4 text-on-surface" aria-label="Sketch of a prosthetic socket with a soft insert">
        <motion.path
          d="M60 20 C60 90 75 130 100 140 C125 130 140 90 140 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4 }}
        />
        <motion.path
          d="M70 24 C70 85 82 120 100 128 C118 120 130 85 130 24"
          fill="none"
          stroke="var(--g-green)"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.4 }}
        />
        <line x1="60" y1="14" x2="140" y2="14" stroke="currentColor" strokeDasharray="3 3" />
        <text x="100" y="10" textAnchor="middle" fontSize="9" fill="currentColor" fontFamily="var(--font-gsc)">Ø socket</text>
        <text x="100" y="156" textAnchor="middle" fontSize="9" fill="var(--g-green)" fontFamily="var(--font-gsc)">soft insert</text>
      </svg>
    </div>
  );
}

const CARDS = [
  { q: "Which nerve innervates the deltoid?", a: "Axillary nerve (C5–C6)" },
  { q: "Name the branches of the brachial plexus.", a: "Roots, trunks, divisions, cords, branches — the full answer comes from your own textbook." },
];

function FlashcardVisual({ className }: { className: string }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = CARDS[i];
  return (
    <div className={`${className} grid aspect-[16/9] place-items-center bg-tint-red p-6`}>
      <div className="relative w-full max-w-[420px]" style={{ perspective: 1000 }}>
        <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 rounded-xl bg-surface/60" aria-hidden />
        <motion.button
          type="button"
          data-cursor={flipped ? "Next" : "Flip"}
          aria-label={flipped ? "Show next card" : "Flip card to see the answer"}
          onClick={() => {
            if (flipped) {
              setFlipped(false);
              setI((x) => (x + 1) % CARDS.length);
            } else setFlipped(true);
          }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={spring.spatialDefault}
          className="relative h-[180px] w-full rounded-xl text-left"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span className="absolute inset-0 flex flex-col justify-between rounded-xl bg-surface p-5 shadow-float" style={{ backfaceVisibility: "hidden" }}>
            <span className="text-[12px] font-medium text-g-red">Question</span>
            <AnimatePresence mode="wait">
              <motion.span key={card.q} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[20px] font-medium leading-snug">
                {card.q}
              </motion.span>
            </AnimatePresence>
            <span className="text-[12px] text-on-surface-variant">Tap to flip</span>
          </span>
          <span
            className="absolute inset-0 flex flex-col justify-between rounded-xl bg-[#202124] p-5 text-white shadow-float"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-[12px] font-medium text-[#f28b82]">Answer</span>
            <span className="text-[20px] font-medium leading-snug">{card.a}</span>
            <span className="text-[12px] text-white/60">Tap for next</span>
          </span>
        </motion.button>
      </div>
    </div>
  );
}
