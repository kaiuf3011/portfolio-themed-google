"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";

/** A shape-built cat strolls along the bottom of the screen and says meow. */
export function CatWalk({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed bottom-0 left-0 z-[85] text-on-surface"
      initial={{ x: -140 }}
      animate={{ x: typeof window === "undefined" ? 0 : innerWidth + 40 }}
      transition={{ duration: 7, ease: "linear" }}
      onAnimationComplete={onDone}
    >
      <motion.div
        className="absolute -top-9 left-24 whitespace-nowrap rounded-full bg-surface px-3 py-1 text-[13px] font-medium shadow-float"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.8] }}
        transition={{ duration: 2.4, delay: 2.4, times: [0, 0.15, 0.8, 1] }}
      >
        meow
      </motion.div>
      <motion.svg width="120" height="80" viewBox="0 0 120 80" animate={{ y: [0, -2, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>
        <motion.path
          d="M18 44 C4 40 2 22 10 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          animate={{ rotate: [-8, 10, -8] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ originX: "18px", originY: "44px" }}
        />
        <ellipse cx="50" cy="48" rx="34" ry="16" fill="currentColor" />
        <circle cx="88" cy="34" r="15" fill="currentColor" />
        <path d="M77 24 L79 8 L89 21Z M89 21 L99 8 L100 25Z" fill="currentColor" />
        <circle cx="92" cy="32" r="2.4" fill="var(--g-yellow)" />
        <circle cx="99" cy="32" r="2.4" fill="var(--g-yellow)" />
        {[28, 40, 62, 74].map((x, i) => (
          <motion.rect
            key={x}
            x={x}
            y="58"
            width="6"
            height="18"
            rx="3"
            fill="currentColor"
            animate={{ rotate: i % 2 ? [-20, 20, -20] : [20, -20, 20] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ originX: `${x + 3}px`, originY: "58px" }}
          />
        ))}
      </motion.svg>
    </motion.div>
  );
}

/** Brand-colour digital rain for a few seconds. */
export function MatrixRain({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    c.width = innerWidth;
    c.height = innerHeight;
    const ctx = c.getContext("2d")!;
    const size = 16;
    const cols = Math.ceil(innerWidth / size);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    const glyphs = "KAIUF01アイウエオカキクケコ{}<>/=+";
    const colors = ["#4285f4", "#ea4335", "#fbbc04", "#34a853"];
    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const t = now - t0;
      ctx.fillStyle = "rgba(10, 12, 14, 0.18)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `600 ${size}px ui-monospace, monospace`;
      drops.forEach((d, i) => {
        ctx.fillStyle = colors[i % 4];
        ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * size, d * size);
        drops[i] = d * size > c.height && Math.random() > 0.97 ? 0 : d + 1;
      });
      c.style.opacity = String(t > 3200 ? Math.max(0, 1 - (t - 3200) / 600) : 1);
      if (t < 3800) raf = requestAnimationFrame(frame);
      else onDone();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[85]" />;
}
