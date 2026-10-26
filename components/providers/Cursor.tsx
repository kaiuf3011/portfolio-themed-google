"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Blue dot that trails the pointer. Over [data-cursor] elements it becomes a pill with the label.
 * Fine pointers only; off for touch and reduced motion.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hidden, setHidden] = useState(true);
  const [pressed, setPressed] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 900, damping: 50, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 900, damping: 50, mass: 0.5 });

  useEffect(() => {
    const mq = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      const overText = !!t?.closest("input, textarea, [contenteditable=true]");
      setHidden(overText);
      const host = t?.closest<HTMLElement>("[data-cursor]");
      if (host) setLabel(host.dataset.cursor || null);
      else if (t?.closest("a, button, [role=button], [role=tab], label, summary")) setLabel("");
      else setLabel(null);
    };
    const leave = () => setHidden(true);
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const isPill = !!label;
  const isLink = label === "";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden whitespace-nowrap rounded-full border-2 border-g-blue text-[13px] font-medium text-white"
        animate={{
          width: isPill ? label!.length * 8 + 28 : isLink ? 40 : 14,
          height: isPill ? 32 : isLink ? 40 : 14,
          backgroundColor: isLink ? "rgba(66,133,244,0.12)" : "rgba(66,133,244,1)",
          opacity: hidden ? 0 : 1,
          scale: pressed ? 0.8 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      >
        {isPill && label}
        {isLink && <span className="h-1.5 w-1.5 rounded-full bg-g-blue" />}
      </motion.div>
    </motion.div>
  );
}
