"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { lerpRadii, pathFromRadii, radii, shapePath, type ShapeName } from "@/lib/shapes";
import { spring } from "@/lib/motion";

/** Static expressive shape. */
export function Shape({ name, className, rotate = 0 }: { name: ShapeName; className?: string; rotate?: number }) {
  return (
    <svg viewBox="0 0 1 1" className={className} aria-hidden>
      <path d={shapePath(name, 1, rotate)} fill="currentColor" />
    </svg>
  );
}

/** Shape that springs from its previous shape to `name` whenever `name` changes. */
export function useMorphPath(name: ShapeName, size = 1, transition = spring.spatialDefault) {
  const from = useRef(radii(name));
  const to = useRef(radii(name));
  const t = useMotionValue(1);
  const rot = useMotionValue(0);

  useEffect(() => {
    if (to.current === radii(name)) return;
    // Start from wherever we currently are.
    from.current = lerpRadii(from.current, to.current, Math.min(1, Math.max(0, t.get())));
    to.current = radii(name);
    t.set(0);
    const a = animate(t, 1, transition);
    const r = animate(rot, rot.get() + Math.PI / 4, transition);
    return () => {
      a.stop();
      r.stop();
    };
  }, [name, t, rot, transition]);

  return useTransform([t, rot], ([v, r]: number[]) => pathFromRadii(lerpRadii(from.current, to.current, v), size, r));
}

export function MorphShape({ name, className }: { name: ShapeName; className?: string }) {
  const d = useMorphPath(name);
  return (
    <svg viewBox="0 0 1 1" className={className} aria-hidden>
      <motion.path d={d} fill="currentColor" />
    </svg>
  );
}

/** Image clipped to a morphing shape (knowledge panel portrait, thumbnails). */
export function ShapeMask({ name, children, className }: { name: ShapeName; children: React.ReactNode; className?: string }) {
  const id = useId().replace(/:/g, "");
  const d = useMorphPath(name);
  return (
    <div className={className} style={{ clipPath: `url(#clip-${id})` }}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <clipPath id={`clip-${id}`} clipPathUnits="objectBoundingBox">
          <motion.path d={d} />
        </clipPath>
      </svg>
      {children}
    </div>
  );
}
