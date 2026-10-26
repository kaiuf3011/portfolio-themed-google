"use client";

import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { skills, techTicker, type SkillNote } from "@/content/site";
import { spring } from "@/lib/motion";
import { Icon } from "@/components/Icon";

const BG: Record<SkillNote["color"], string> = {
  blue: "var(--tint-blue)",
  red: "var(--tint-red)",
  yellow: "var(--tint-yellow)",
  green: "var(--tint-green)",
  white: "var(--note-white)",
};
const TILT = [-1.5, 1.2, -0.8, 1.5, -1.2, 0.9];
const SNAP = 24;

export function KeepBoard() {
  const board = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [canDrag, setCanDrag] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanDrag(matchMedia("(pointer: fine)").matches);
  }, []);

  const f = filter.trim().toLowerCase();
  const matches = (n: SkillNote) => !f || n.title.toLowerCase().includes(f) || n.items.some((i) => i.toLowerCase().includes(f));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 className="headline-m mr-auto">I work across five territories.</h2>
        <label className="flex h-12 w-full max-w-[360px] items-center gap-2 rounded-lg bg-surface-container-high px-4 sm:w-auto sm:flex-1">
          <Icon name="search" size={20} className="text-on-surface-variant" />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search your notes" aria-label="Filter skills" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
        </label>
        {canDrag && (
          <button type="button" onClick={() => setResetKey((k) => k + 1)} className="state rounded-full px-4 py-2 text-[14px] font-medium text-primary">
            Tidy up
          </button>
        )}
      </div>
      <p className="mb-4 text-[14px] text-on-surface-variant">{canDrag ? "Drag the notes around. They snap to the grid." : "Every note is a territory, and every line is a tool."}</p>

      <div ref={board} className="dotted relative grid grid-cols-1 gap-5 rounded-xl border border-outline p-5 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((n, i) => (
          <Note key={n.id} note={n} tilt={TILT[i % TILT.length]} board={board} dim={!matches(n)} resetKey={resetKey} draggable={canDrag} done={n.id !== "next"} />
        ))}
      </div>

      <div className="mt-8 overflow-hidden" aria-label="Tech I use">
        <motion.div className="flex w-max gap-2" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
          {[...techTicker, ...techTicker].map((t, i) => (
            <span key={i} className="rounded-full border border-outline px-3 py-1 text-[13px] text-on-surface-variant" aria-hidden={i >= techTicker.length}>
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function Note({
  note,
  tilt,
  board,
  dim,
  resetKey,
  draggable,
  done,
}: {
  note: SkillNote;
  tilt: number;
  board: React.RefObject<HTMLDivElement | null>;
  dim: boolean;
  resetKey: number;
  draggable: boolean;
  done: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [checked, setChecked] = useState(() => note.items.map(() => done));
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    if (resetKey === 0) return;
    animate(x, 0, spring.spatialDefault);
    animate(y, 0, spring.spatialDefault);
  }, [resetKey, x, y]);

  return (
    <motion.div
      drag={draggable}
      dragConstraints={board}
      dragElastic={0.15}
      dragMomentum
      onDragStart={() => setLifted(true)}
      onDragEnd={() => {
        setLifted(false);
        // Let momentum settle, then snap to the loose grid.
        setTimeout(() => {
          animate(x, Math.round(x.get() / SNAP) * SNAP, spring.spatialFast);
          animate(y, Math.round(y.get() / SNAP) * SNAP, spring.spatialFast);
        }, 220);
      }}
      data-cursor={draggable ? "Drag" : undefined}
      style={{ x, y, background: BG[note.color], zIndex: lifted ? 20 : 1 }}
      initial={{ rotate: tilt }}
      animate={{ rotate: lifted ? 0 : tilt, opacity: dim ? 0.3 : 1, scale: dim ? 0.97 : 1 }}
      whileHover={{ rotate: 0, y: -2, boxShadow: "var(--shadow-float)" }}
      whileDrag={{ scale: 1.04, rotate: 0, boxShadow: "var(--shadow-float)" }}
      transition={spring.spatialDefault}
      className="relative touch-pan-y select-none rounded-lg border border-outline/60 p-4"
    >
      <h3 className="mb-2 text-[16px] font-medium">{note.title}</h3>
      <ul className="space-y-1">
        {note.items.map((item, i) => (
          <li key={item}>
            <label className="flex cursor-pointer items-center gap-2.5 text-[15px]" onPointerDown={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                className="peer sr-only"
                checked={checked[i]}
                onChange={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
              />
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-xs border-2 border-on-surface-variant peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-g-blue">
                <AnimatePresence initial={false}>
                  {checked[i] && (
                    <motion.svg viewBox="0 0 24 24" className="h-3.5 w-3.5" exit={{ opacity: 0 }}>
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.22 }} />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </span>
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
