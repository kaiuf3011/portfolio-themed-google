"use client";

import { motion, useAnimationControls, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { shapePath } from "@/lib/shapes";
import { spring } from "@/lib/motion";

const BODY = shapePath("cookie", 64);

/** A tiny shape-built character. Eyes follow the cursor; it hops on every keystroke. */
export function Doodle() {
  const ref = useRef<SVGSVGElement>(null);
  const body = useAnimationControls();
  const px = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const py = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const move = (e: PointerEvent) => {
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
      body.start({ y: [0, -10, 0], scaleY: [1, 1.08, 0.94, 1], scaleX: [1, 0.94, 1.06, 1] }, { duration: 0.36, ease: "easeOut" });
    };
    const dance = () => body.start({ rotate: [0, -20, 20, -20, 20, 0], y: [0, -16, 0, -16, 0] }, { duration: 1 });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("kaiuf:keystroke", hop);
    window.addEventListener("kaiuf:dance", dance);
    const blinker = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3800);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("kaiuf:keystroke", hop);
      window.removeEventListener("kaiuf:dance", dance);
      clearInterval(blinker);
    };
  }, [body, px, py]);

  return (
    <motion.svg
      ref={ref}
      width="56"
      height="56"
      viewBox="0 0 64 64"
      aria-hidden
      animate={body}
      initial={{ y: 0 }}
      style={{ originY: 1 }}
      transition={spring.spatialFast}
      className="overflow-visible"
    >
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ originX: "32px", originY: "32px" }}>
        <path d={BODY} fill="var(--g-blue)" />
      </motion.g>
      {[22, 42].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={28} rx={7} ry={blink ? 1 : 8} fill="#fff" style={{ transition: "ry 80ms" }} />
          {!blink && <motion.circle cx={cx} cy={29} r={3.4} fill="#202124" style={{ x: px, y: py }} />}
        </g>
      ))}
      <path d="M26 42 Q32 47 38 42" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
    </motion.svg>
  );
}
