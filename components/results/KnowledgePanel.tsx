"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { about, photos, site, type Photo } from "@/content/site";
import type { ShapeName } from "@/lib/shapes";
import { spring } from "@/lib/motion";
import { MorphShape } from "@/components/Shape";
import { Icon } from "@/components/Icon";
import { useCompose } from "@/components/providers/Compose";
import { Lightbox } from "@/components/results/Images";

const VISIT_SHAPES: ShapeName[] = ["cookie", "sunny", "clover", "softBurst", "gem", "burst"];
const STICKER_COLORS = ["var(--g-blue)", "var(--g-red)", "var(--g-yellow)", "var(--g-green)"];

export const portrait: Photo = { ...site.portrait, caption: site.fullName, tag: "Portrait" };
const side = [photos[0], photos[3]];

/** Morphs to a new shape on every visit; lives on the photo's corner so it never crops the face. */
function useVisitShape() {
  const [visit, setVisit] = useState(0);
  useEffect(() => {
    let n = 0;
    try {
      n = Number(localStorage.getItem("kaiuf:visit") ?? 0) + 1;
      localStorage.setItem("kaiuf:visit", String(n));
    } catch {}
    const t = setTimeout(() => setVisit(n), 350);
    return () => clearTimeout(t);
  }, []);
  return { shape: visit ? VISIT_SHAPES[visit % VISIT_SHAPES.length] : ("circle" as ShapeName), color: STICKER_COLORS[visit % 4] };
}

function Tile({ photo, prefix, className, sizes, priority, onOpen }: { photo: Photo; prefix: string; className: string; sizes: string; priority?: boolean; onOpen: (p: Photo) => void }) {
  return (
    <button type="button" onClick={() => onOpen(photo)} data-cursor="View" aria-label={`View photo: ${photo.caption}`} className={`group relative overflow-hidden ${className}`}>
      <motion.span layoutId={`${prefix}-${photo.src}`} transition={spring.spatialDefault} className="absolute inset-0 block overflow-hidden">
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover object-[50%_38%] transition-transform duration-500 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-105" />
      </motion.span>
    </button>
  );
}

export function KnowledgePanel({ compact = false }: { compact?: boolean }) {
  const compose = useCompose();
  const { shape, color } = useVisitShape();
  const [open, setOpen] = useState<Photo | null>(null);

  const sticker = (size: string) => (
    <motion.span className={`pointer-events-none absolute z-10 ${size}`} animate={{ color }} transition={spring.effectsSlow} aria-hidden>
      <MorphShape name={shape} className="h-full w-full drop-shadow-[0_2px_4px_rgba(0,0,0,.25)]" />
    </motion.span>
  );

  // The compact and full panels are both mounted (one hidden by CSS), so their shared-layout ids must differ.
  const prefix = compact ? "kp-compact" : "kp";
  const lightbox = <AnimatePresence>{open && <Lightbox photo={open} onClose={() => setOpen(null)} layoutPrefix={prefix} />}</AnimatePresence>;

  const facts = [
    { label: "Studying", value: `${about.education.degree}, ${about.education.school}` },
    { label: "Builds", value: "RAG assistants, AR/VR experiences, Unity games" },
    { label: "Based in", value: site.basedIn },
    { label: "Known for", value: "SIH 2026 Best Performing Team, SIH 2025 national finalist" },
  ];

  const socials = [
    { icon: "github" as const, label: "GitHub", href: site.github },
    { icon: "linkedin" as const, label: "LinkedIn", href: site.linkedin },
    { icon: "doc" as const, label: "Resume", href: site.resume },
  ];

  if (compact) {
    return (
      <section data-fx aria-label="About Kaiuf" className="mb-6 overflow-hidden rounded-xl border border-outline">
        <div className="relative grid h-[260px] grid-cols-[1.25fr_1fr] gap-1 sm:h-[300px]">
          <Tile prefix={prefix} photo={portrait} className="h-full" sizes="60vw" priority onOpen={setOpen} />
          <div className="grid grid-rows-2 gap-1">
            {side.map((p) => (
              <Tile prefix={prefix} key={p.src} photo={p} className="h-full" sizes="40vw" onOpen={setOpen} />
            ))}
          </div>
          {sticker("bottom-2 left-2 h-9 w-9")}
        </div>
        <div className="p-4">
          <h2 className="text-[24px] font-medium leading-tight">{site.fullName}</h2>
          <p className="text-[14px] text-on-surface-variant">{site.descriptor}</p>
          {site.status && (
            <p className="mt-2 flex items-center gap-2 text-[13px]">
              <span className="pulse-dot h-2 w-2 rounded-full bg-g-green" />
              {site.status}
            </p>
          )}
        </div>
        {lightbox}
      </section>
    );
  }

  return (
    <aside data-fx aria-label="About Kaiuf" className="sticky top-[150px] overflow-hidden rounded-xl border border-outline">
      <div className="relative grid h-[300px] grid-cols-[1.45fr_1fr] gap-1">
        <Tile prefix={prefix} photo={portrait} className="h-full" sizes="260px" priority onOpen={setOpen} />
        <div className="grid grid-rows-2 gap-1">
          {side.map((p) => (
            <Tile prefix={prefix} key={p.src} photo={p} className="h-full" sizes="160px" onOpen={setOpen} />
          ))}
        </div>
        {sticker("bottom-3 left-3 h-11 w-11")}
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur">
          <Icon name="image" size={14} className="-mt-0.5 mr-1 inline" />
          Tap to enlarge
        </span>
      </div>
      <div className="px-5 pb-4 pt-4">
        <h2 className="text-[28px] font-medium leading-tight" style={{ fontVariationSettings: '"ROND" 40' }}>
          {site.fullName}
        </h2>
        <p className="text-[14px] text-on-surface-variant">{site.descriptor}</p>
      </div>
      <div className="border-t border-outline px-5 py-4 text-[14px] leading-[1.6]">
        <p>{about.who}</p>
        <p className="mt-1 text-[12px] text-result-url">kaiuf › about</p>
      </div>
      <dl className="border-t border-outline px-5 py-4 text-[14px]">
        {facts.map((f) => (
          <div key={f.label} className="py-1">
            <dt className="inline font-medium">{f.label}: </dt>
            <dd className="inline text-on-surface-variant">{f.value}</dd>
          </div>
        ))}
        {site.status && (
          <div className="flex items-center gap-2 py-1">
            <dt className="font-medium">Status:</dt>
            <dd className="flex items-center gap-2 text-on-surface-variant">
              <span className="pulse-dot h-2 w-2 rounded-full bg-g-green" />
              {site.status}
            </dd>
          </div>
        )}
      </dl>
      <div className="grid grid-cols-4 border-t border-outline px-2 py-3">
        {about.stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-[20px] font-medium">{s.value}</div>
            <div className="text-[12px] text-on-surface-variant">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-outline px-5 py-4">
        <p className="mb-3 text-[14px] font-medium">Profiles</p>
        <div className="flex gap-3">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="group flex w-16 flex-col items-center gap-1.5 text-[12px]">
              <span className="state grid h-12 w-12 place-items-center rounded-full bg-surface-container-high text-on-surface">
                <Icon name={s.icon} size={22} />
              </span>
              {s.label}
            </a>
          ))}
          <button type="button" onClick={(e) => compose.open({ origin: e.currentTarget })} className="group flex w-16 flex-col items-center gap-1.5 text-[12px]">
            <span className="state grid h-12 w-12 place-items-center rounded-full bg-primary-container text-on-primary-container">
              <Icon name="mail" size={22} />
            </span>
            Write
          </button>
        </div>
      </div>
      {lightbox}
    </aside>
  );
}
