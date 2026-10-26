"use client";

import { animate, motion, useAnimationControls } from "motion/react";
import { useEffect } from "react";
import { spring } from "@/lib/motion";

const LETTERS = [
  { ch: "K", color: "var(--g-blue)" },
  { ch: "a", color: "var(--g-red)" },
  { ch: "i", color: "var(--g-yellow)" },
  { ch: "u", color: "var(--g-green)" },
  { ch: "f", color: "var(--g-red)" },
];

/**
 * The four-colour wordmark. `drop` replays the staggered letter drop (after the preloader).
 * Listens for `kaiuf:scatter` to fling its letters and reassemble.
 */
export function Wordmark({ size = "display", drop = false }: { size?: "display" | "small"; drop?: boolean }) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (drop) {
      controls.set({ y: -48, opacity: 0, rotate: 0, x: 0 });
      controls.start((i: number) => ({ y: 0, opacity: 1, transition: { ...spring.spatialFast, delay: i * 0.04 } }));
    }
  }, [drop, controls]);

  useEffect(() => {
    const scatter = async () => {
      await controls.start(() => ({
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 400,
        rotate: (Math.random() - 0.5) * 360,
        transition: spring.spatialSlow,
      }));
      controls.start((i: number) => ({ x: 0, y: 0, rotate: 0, transition: { ...spring.spatialDefault, delay: i * 0.05 } }));
    };
    const dance = () => {
      LETTERS.forEach((_, i) => {
        const el = document.querySelector<HTMLElement>(`[data-letter="${i}"]`);
        if (el) animate(el, { y: [0, -24, 0, -12, 0] }, { duration: 0.9, delay: i * 0.07 });
      });
    };
    window.addEventListener("kaiuf:scatter", scatter);
    window.addEventListener("kaiuf:dance", dance);
    return () => {
      window.removeEventListener("kaiuf:scatter", scatter);
      window.removeEventListener("kaiuf:dance", dance);
    };
  }, [controls]);

  const display = size === "display";
  return (
    <span
      aria-label="Kaiuf"
      role="img"
      className="inline-flex select-none leading-none"
      style={{
        fontSize: display ? "clamp(64px, 10vw, 132px)" : 28,
        fontWeight: 600,
        letterSpacing: display ? "-0.035em" : "-0.02em",
        fontVariationSettings: '"ROND" 100',
      }}
    >
      {LETTERS.map((l, i) => (
        <motion.span key={i} data-letter={display ? i : undefined} custom={i} animate={controls} style={{ color: l.color, display: "inline-block" }} aria-hidden>
          {l.ch}
        </motion.span>
      ))}
    </span>
  );
}
