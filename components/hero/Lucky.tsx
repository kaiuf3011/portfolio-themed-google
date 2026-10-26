"use client";

import { animate, motion, useMotionValue, useTransform, useVelocity } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { projects } from "@/content/site";
import { confetti } from "@/lib/confetti";
import { prefersReducedMotion } from "@/lib/motion";

const KEY = "kaiuf:lucky-last";
const ROW = 64;

function pick() {
  let last = "";
  try {
    last = sessionStorage.getItem(KEY) ?? "";
  } catch {}
  const pool = projects.filter((p) => p.slug !== last);
  const p = pool[crypto.getRandomValues(new Uint32Array(1))[0] % pool.length];
  try {
    sessionStorage.setItem(KEY, p.slug);
  } catch {}
  return p;
}

/** Slot-machine roll through project titles, then confetti, then the case study. */
export function Lucky({ origin, onClose }: { origin: { x: number; y: number }; onClose: () => void }) {
  const router = useRouter();
  const [target] = useState(pick);
  const [landed, setLanded] = useState(false);
  const y = useMotionValue(0);
  const velocity = useVelocity(y);
  const blur = useTransform(velocity, (v) => `blur(${Math.min(6, Math.abs(v) / 500)}px)`);

  // Reel: three spins of the list, landing on the target in the last spin.
  const reel = [...projects, ...projects, ...projects, ...projects];
  const stopIndex = projects.length * 3 + projects.findIndex((p) => p.slug === target.slug);

  useEffect(() => {
    router.prefetch(`/projects/${target.slug}`);
    const reduce = prefersReducedMotion();
    const ctl = animate(y, -stopIndex * ROW, {
      duration: reduce ? 0 : 1.25,
      ease: [0.05, 0.7, 0.1, 1],
      onComplete: () => {
        setLanded(true);
        confetti(origin.x, origin.y);
        // Close as we leave: Next keeps this page alive for back navigation, and a lingering
        // overlay would replay its effect and push again.
        setTimeout(() => {
          router.push(`/projects/${target.slug}`);
          onClose();
        }, reduce ? 200 : 750);
      },
    });
    return () => ctl.stop();
  }, [y, stopIndex, origin, router, target.slug, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center bg-[var(--scrim)] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Feeling lucky"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        className="w-full max-w-[560px] rounded-2xl bg-surface p-6 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-center text-[14px] text-on-surface-variant">Feeling lucky…</p>
        <div className="relative overflow-hidden rounded-xl bg-surface-container" style={{ height: ROW }}>
          <motion.ul style={{ y, filter: blur }} aria-hidden>
            {reel.map((p, i) => (
              <li key={i} className="flex items-center justify-center px-4 text-center text-[clamp(18px,3vw,24px)] font-medium" style={{ height: ROW }}>
                {p.name}
              </li>
            ))}
          </motion.ul>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-surface-container to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-surface-container to-transparent" />
        </div>
        <p className="mt-4 min-h-6 text-center text-[15px]" aria-live="assertive">
          {landed ? `You got ${target.name}. Opening it…` : ""}
        </p>
      </motion.div>
    </motion.div>
  );
}
