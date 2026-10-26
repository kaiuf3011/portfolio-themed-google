import type { Transition } from "motion/react";

// Material 3 Expressive springs (mass 1). damping = 2 * ratio * sqrt(stiffness).
// Spatial springs may overshoot; effects springs never do.
export const spring = {
  spatialFast: { type: "spring", stiffness: 800, damping: 34, mass: 1 },
  spatialDefault: { type: "spring", stiffness: 380, damping: 31, mass: 1 },
  spatialSlow: { type: "spring", stiffness: 200, damping: 23, mass: 1 },
  effectsFast: { type: "spring", stiffness: 3800, damping: 123, mass: 1 },
  effectsDefault: { type: "spring", stiffness: 1600, damping: 80, mass: 1 },
  effectsSlow: { type: "spring", stiffness: 800, damping: 57, mass: 1 },
} satisfies Record<string, Transition>;

export const ease = {
  emphasized: [0.2, 0, 0, 1],
  decelerate: [0.05, 0.7, 0.1, 1],
  accelerate: [0.3, 0, 0.8, 0.15],
} as const;

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
