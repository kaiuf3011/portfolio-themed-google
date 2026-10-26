"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { journey, type Milestone } from "@/content/site";
import { spring } from "@/lib/motion";
import { Icon, type IconName } from "@/components/Icon";

const VB = { w: 1200, h: 600 };
const POINTS: [number, number][] = [
  [90, 500],
  [270, 380],
  [430, 470],
  [570, 290],
  [700, 410],
  [880, 260],
  [1110, 110],
];

const KIND: Record<Milestone["kind"], { color: string; icon: IconName; label: string }> = {
  experience: { color: "var(--g-yellow)", icon: "note", label: "Experience" },
  project: { color: "var(--g-red)", icon: "folder", label: "Project" },
  win: { color: "var(--g-green)", icon: "lucky", label: "Win" },
};

function routePath(pts: [number, number][]) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}
const ROUTE = routePath(POINTS);
const left = (x: number) => `${(x / VB.w) * 100}%`;
const top = (y: number) => `${(y / VB.h) * 100}%`;

export function Journey() {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="headline-m">The route so far</h2>
        <a href="#journey-end" className="text-[14px] font-medium text-primary underline-offset-4 hover:underline">
          Skip route
        </a>
      </div>
      <div className="hidden lg:block">
        <MapRoute />
      </div>
      <div className="lg:hidden">
        <VerticalRoute />
      </div>
      <div id="journey-end" className="scroll-mt-40" />
    </div>
  );
}

function MapRoute() {
  const section = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const reduce = useReducedMotion();
  // Progress from the live rect (offsets measured once go stale after the tab animates in).
  const { scrollY } = useScroll();
  const raw = useMotionValue(0);
  const measure = useCallback(() => {
    const r = section.current?.getBoundingClientRect();
    if (!r) return;
    // The map is sticky at top 150px; finish the route before it un-sticks.
    const stickyH = Math.max(460, innerHeight - 180);
    raw.set(Math.min(1, Math.max(0, (150 - r.top) / (r.height - stickyH))));
  }, [raw]);
  useMotionValueEvent(scrollY, "change", measure);
  useEffect(() => {
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [measure]);
  const smooth = useSpring(raw, { stiffness: 220, damping: 40 });
  const progress = useTransform(smooth, (v) => (reduce ? 1 : v));
  const [stops, setStops] = useState<number[]>([]);
  const [reached, setReached] = useState(reduce ? journey.length : 0);
  const hx = useMotionValue(POINTS[0][0]);
  const hy = useMotionValue(POINTS[0][1]);

  useEffect(() => {
    const p = path.current;
    if (!p) return;
    const len = p.getTotalLength();
    const samples = Array.from({ length: 400 }, (_, i) => {
      const pt = p.getPointAtLength((i / 399) * len);
      return { t: i / 399, x: pt.x, y: pt.y };
    });
    setStops(POINTS.map(([x, y]) => samples.reduce((best, s) => (Math.hypot(s.x - x, s.y - y) < Math.hypot(best.x - x, best.y - y) ? s : best)).t));
  }, []);

  useMotionValueEvent(progress, "change", (v) => {
    const p = path.current;
    if (p) {
      const pt = p.getPointAtLength(v * p.getTotalLength());
      hx.set(pt.x);
      hy.set(pt.y);
    }
    if (stops.length) setReached(stops.filter((s) => v >= s - 0.005).length);
  });

  const headLeft = useTransform(hx, (x) => left(x));
  const headTop = useTransform(hy, (y) => top(y));

  return (
    <div ref={section} className="relative" style={{ height: "260vh" }}>
      <div className="sticky top-[150px] h-[calc(100svh-180px)] min-h-[460px] overflow-hidden rounded-xl border border-outline bg-[#e8eef4] dark:bg-[#1b2026]">
        {/* Map base */}
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0,560 C200,520 260,600 420,600 L0,600Z" fill="#aecbfa" className="dark:opacity-30" />
          <path d="M980,0 C1020,80 1120,110 1200,90 L1200,0Z" fill="#aecbfa" className="dark:opacity-30" />
          <ellipse cx="640" cy="140" rx="120" ry="70" fill="#ceead6" className="dark:opacity-25" />
          <ellipse cx="240" cy="170" rx="90" ry="55" fill="#ceead6" className="dark:opacity-25" />
          {[120, 250, 360, 520].map((y) => (
            <line key={`h${y}`} x1="0" x2="1200" y1={y} y2={y} stroke="var(--surface)" strokeWidth="6" vectorEffect="non-scaling-stroke" opacity=".7" />
          ))}
          {[160, 340, 680, 860, 1040].map((x) => (
            <line key={`v${x}`} x1={x} x2={x} y1="0" y2="600" stroke="var(--surface)" strokeWidth="6" vectorEffect="non-scaling-stroke" opacity=".7" />
          ))}
          <path d={ROUTE} fill="none" stroke="#1967d2" strokeOpacity=".18" strokeWidth="12" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <motion.path
            ref={path}
            d={ROUTE}
            fill="none"
            stroke="var(--g-blue)"
            strokeWidth="8"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: progress }}
          />
        </svg>

        {/* You are here */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2"
          style={{ left: headLeft, top: headTop }}
        >
          <span className="pulse-dot absolute inset-0 rounded-full border-[3px] border-white bg-g-blue shadow-search" />
        </motion.div>

        {/* Pins + cards */}
        {journey.map((m, i) => {
          const [x, y] = POINTS[i];
          const isReached = i < reached;
          const current = i === reached - 1;
          const above = y > 300;
          const k = KIND[m.kind];
          const align = i === 0 ? "-10%" : i === journey.length - 1 ? "-90%" : "-50%";
          return (
            <div key={m.id} className="absolute" style={{ left: left(x), top: top(y), zIndex: current ? 15 : 10 }}>
              <AnimatePresence>
                {isReached && (
                  <motion.div
                    initial={{ y: -40, opacity: 0, scale: 0.6 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -20, opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 500, damping: 16 }}
                    className="absolute -translate-x-1/2 -translate-y-full"
                    style={{ color: k.color }}
                  >
                    <svg width="34" height="44" viewBox="0 0 34 44" aria-hidden>
                      <path d="M17 1C8.2 1 1 8 1 16.7 1 28.5 17 43 17 43s16-14.5 16-26.3C33 8 25.8 1 17 1Z" fill="currentColor" stroke="#00000022" />
                      <circle cx="17" cy="16.5" r="6" fill="#fff" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {isReached && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={spring.spatialDefault}
                    className="absolute"
                    style={{
                      x: align,
                      [above ? "bottom" : "top"]: above ? 54 : 14,
                      originY: above ? 1 : 0,
                    }}
                  >
                    {current ? (
                      <motion.div layout className="w-[250px] overflow-hidden rounded-lg bg-surface shadow-float">
                        {m.photo && (
                          <div className="relative h-[110px] w-full">
                            <Image src={m.photo} alt="" fill sizes="250px" className="object-cover" />
                          </div>
                        )}
                        <div className="p-3">
                          <p className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: k.color === "var(--g-yellow)" ? "var(--on-surface-variant)" : k.color }}>
                            <Icon name={k.icon} size={14} /> {m.when}
                          </p>
                          <p className="mt-0.5 text-[16px] font-medium leading-snug">{m.title}</p>
                          <p className="mt-1 text-[13px] leading-snug text-on-surface-variant">{m.detail}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.span layout className="block whitespace-nowrap rounded-full bg-surface px-3 py-1 text-[12px] font-medium shadow-search">
                        {m.title}
                      </motion.span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Directions panel */}
        <div className="absolute left-4 top-4 z-30 w-[260px] rounded-lg bg-surface p-4 shadow-float">
          <div className="flex items-center gap-2 text-[13px] text-on-surface-variant">
            <Icon name="car" size={18} className="text-g-blue" /> Route
          </div>
          <div className="mt-2 space-y-1.5 text-[14px]">
            <p className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-on-surface-variant" /> Day one, B.E. CSE
            </p>
            <p className="flex items-center gap-2">
              <span className="text-g-red">
                <Icon name="pin" size={12} />
              </span>
              Next stop: your team?
            </p>
          </div>
          <p className="mt-3 text-[13px] text-on-surface-variant">
            <span className="font-medium text-result-url">Ongoing</span> · 10+ hackathons · {Math.min(reached, journey.length)}/{journey.length} stops
          </p>
        </div>
      </div>
    </div>
  );
}

function VerticalRoute() {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 220, damping: 40 });

  return (
    <ol ref={list} className="relative ml-3 space-y-6 pl-8">
      <span className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-g-blue/20" aria-hidden />
      <motion.span className="absolute bottom-0 left-0 top-0 w-1 origin-top rounded-full bg-g-blue" style={{ scaleY }} aria-hidden />
      {journey.map((m) => {
        const k = KIND[m.kind];
        return (
          <motion.li
            key={m.id}
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={spring.spatialDefault}
            className="relative"
          >
            <span className="absolute -left-[42px] top-1 grid h-6 w-6 place-items-center rounded-full border-[3px] border-surface" style={{ background: k.color }} aria-hidden />
            <p className="text-[12px] font-medium text-on-surface-variant">
              {k.label} · {m.when}
            </p>
            <p className="text-[18px] font-medium leading-snug">{m.title}</p>
            <p className="text-[14px] text-on-surface-variant">{m.detail}</p>
            {m.photo && (
              <div className="relative mt-2 h-40 w-full max-w-sm overflow-hidden rounded-lg">
                <Image src={m.photo} alt="" fill sizes="(max-width: 840px) 90vw, 380px" className="object-cover" />
              </div>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}
