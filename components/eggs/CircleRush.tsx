"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const COLORS = ["var(--g-blue)", "var(--g-red)", "var(--g-yellow)", "var(--g-green)"];

type Dot = { id: number; from: [number, number]; to: [number, number]; size: number; color: string; delay: number };

/** Four-colour circles swarm in, gobble the result blocks, then pop away. */
export function CircleRush({ onDone }: { onDone: () => void }) {
  const [dots] = useState<Dot[]>(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-result]"))
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.bottom > 0 && r.top < innerHeight);
    const pts: [number, number][] = targets.length
      ? targets.map((r) => [r.left + r.width / 2, r.top + r.height / 2])
      : [[innerWidth / 2, innerHeight / 2]];
    return Array.from({ length: 16 }, (_, i) => {
      const edge = i % 4;
      const from: [number, number] =
        edge === 0 ? [-60, Math.random() * innerHeight] : edge === 1 ? [innerWidth + 60, Math.random() * innerHeight] : edge === 2 ? [Math.random() * innerWidth, -60] : [Math.random() * innerWidth, innerHeight + 60];
      const t = pts[i % pts.length];
      return { id: i, from, to: [t[0] + (Math.random() - 0.5) * 120, t[1] + (Math.random() - 0.5) * 40], size: 28 + Math.random() * 30, color: COLORS[i % 4], delay: Math.random() * 0.3 };
    });
  });

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-result]"));
    const eat = setTimeout(() => {
      els.forEach((el, i) => el.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(0.2)", opacity: 0 }], { duration: 260, delay: i * 40, fill: "forwards", easing: "cubic-bezier(0.3,0,0.8,0.15)" }));
    }, 650);
    const restore = setTimeout(() => {
      els.forEach((el, i) => el.animate([{ transform: "scale(0.6)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 420, delay: i * 50, fill: "forwards", easing: "cubic-bezier(0.05,0.7,0.1,1)" }));
    }, 1900);
    const done = setTimeout(onDone, 2500);
    return () => {
      clearTimeout(eat);
      clearTimeout(restore);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[85]">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute left-0 top-0 rounded-full"
          style={{ width: d.size, height: d.size, background: d.color, marginLeft: -d.size / 2, marginTop: -d.size / 2 }}
          initial={{ x: d.from[0], y: d.from[1], scale: 1 }}
          animate={{ x: [d.from[0], d.to[0], d.to[0]], y: [d.from[1], d.to[1], d.to[1] - 20], scale: [1, 1.3, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 2, delay: d.delay, times: [0, 0.4, 1], ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
