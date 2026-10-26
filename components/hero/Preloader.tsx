"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { MorphShape } from "@/components/Shape";
import type { ShapeName } from "@/lib/shapes";
import { spring } from "@/lib/motion";

const DOTS = ["var(--g-blue)", "var(--g-red)", "var(--g-yellow)", "var(--g-green)"];
const MORPHS: [ShapeName, string][] = [
  ["cookie", "var(--g-blue)"],
  ["burst", "var(--g-red)"],
  ["sunny", "var(--g-yellow)"],
  ["circle", "var(--g-green)"],
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Four dots → one morphing shape → a pill that stretches into the real hero search bar. */
export function Preloader({ targetId, onReveal, onFinish }: { targetId: string; onReveal: () => void; onFinish: () => void }) {
  const [phase, setPhase] = useState<"dots" | "merge" | "morph" | "stretch" | "fade">("dots");
  const [morph, setMorph] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // The preloader's own first frame replaces the CSS boot cover.
    document.documentElement.classList.remove("booting", "booting-blank");
    let cancelled = false;
    (async () => {
      await Promise.race([Promise.all([document.fonts?.ready, sleep(900)]), sleep(1800)]);
      if (cancelled) return;
      setPhase("merge");
      await sleep(260);
      setPhase("morph");
      for (let i = 1; i < MORPHS.length; i++) {
        await sleep(170);
        if (cancelled) return;
        setMorph(i);
      }
      await sleep(200);
      const el = document.getElementById(targetId);
      setRect(el?.getBoundingClientRect() ?? null);
      setPhase("stretch");
      await sleep(520);
      if (cancelled) return;
      setPhase("fade");
      onReveal();
    })();
    return () => {
      cancelled = true;
    };
  }, [targetId, onReveal]);

  const cx = typeof window !== "undefined" ? innerWidth / 2 : 0;
  const cy = typeof window !== "undefined" ? innerHeight / 2 : 0;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[60]"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
      onAnimationComplete={() => phase === "fade" && onFinish()}
      style={{ pointerEvents: phase === "fade" ? "none" : "auto" }}
    >
      <motion.div
        className="absolute inset-0 bg-surface"
        animate={{ opacity: phase === "stretch" || phase === "fade" ? 0 : 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
      />

      {(phase === "dots" || phase === "merge") && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="dot-wave flex gap-3">
            {DOTS.map((c, i) => (
              <motion.span
                key={i}
                className="h-4 w-4"
                style={{ background: c }}
                animate={phase === "merge" ? { x: (1.5 - i) * 28, scale: 1.6, opacity: i === 0 ? 1 : 0 } : { x: 0 }}
                transition={spring.spatialDefault}
              />
            ))}
          </div>
        </div>
      )}

      {phase === "morph" && (
        <div className="absolute inset-0 grid place-items-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1, color: MORPHS[morph][1] }}
            transition={spring.spatialFast}
            className="h-14 w-14"
          >
            <MorphShape name={MORPHS[morph][0]} className="h-full w-full" />
          </motion.div>
        </div>
      )}

      {(phase === "stretch" || phase === "fade") && (
        <motion.div
          className="fixed overflow-hidden"
          initial={{ left: cx - 28, top: cy - 28, width: 56, height: 56, borderRadius: 28 }}
          animate={
            rect
              ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: rect.height / 2 }
              : { opacity: 0 }
          }
          transition={spring.spatialDefault}
        >
          <div className="absolute inset-0 rounded-[inherit] border border-outline bg-surface shadow-search" />
          <motion.div className="absolute inset-0 bg-g-green" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.3, delay: 0.08 }} />
        </motion.div>
      )}
    </motion.div>
  );
}
