"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { photos, type Photo } from "@/content/site";
import { spring } from "@/lib/motion";
import { Icon } from "@/components/Icon";

/** Inline "Images" row inside All results. */
export function ImagesStrip({ onMore }: { onMore: () => void }) {
  return (
    <section aria-label="Images" className="my-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[20px] font-normal">Images</h2>
        <button type="button" onClick={onMore} className="state rounded-full px-3 py-1.5 text-[14px] font-medium text-primary">
          View all
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {photos.slice(0, 5).map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={onMore}
            data-cursor="View"
            className="group relative h-[140px] shrink-0 overflow-hidden rounded-lg"
            style={{ width: Math.round((140 * p.width) / p.height) }}
          >
            <Image src={p.src} alt={p.alt} fill sizes="260px" className="object-cover transition-transform duration-500 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-105" priority={i < 2} />
          </button>
        ))}
      </div>
    </section>
  );
}

const TAGS = ["All", ...Array.from(new Set(photos.map((p) => p.tag)))];

export function ImagesTab() {
  const [tag, setTag] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = tag === "All" ? photos : photos.filter((p) => p.tag === tag);

  const step = useCallback(
    (d: number) => setOpen((o) => (o === null ? o : (o + d + list.length) % list.length)),
    [list.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <LayoutGroup>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter images">
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(t)}
            className={`state relative h-8 rounded-sm border px-3 text-[14px] font-medium transition-[border-radius] duration-300 ${
              tag === t ? "rounded-full border-transparent text-on-primary-container" : "border-outline text-on-surface-variant"
            }`}
          >
            {tag === t && <motion.span layoutId="img-chip" className="absolute inset-0 -z-10 rounded-full bg-primary-container" transition={spring.spatialFast} />}
            {t}
          </button>
        ))}
      </div>

      <motion.div layout className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.button
              key={p.src}
              layout
              type="button"
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={spring.spatialDefault}
              data-cursor="View"
              className="group mb-3 block w-full break-inside-avoid text-left"
            >
              <motion.span layoutId={`photo-${p.src}`} className="relative block overflow-hidden rounded-lg" style={{ aspectRatio: `${p.width}/${p.height}` }} transition={spring.spatialDefault}>
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 840px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </motion.span>
              <span className="mt-1.5 block truncate text-[13px] text-on-surface">{p.caption}</span>
              <span className="block text-[12px] text-on-surface-variant">kaiuf › images</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>{open !== null && list[open] && <Lightbox photo={list[open]} onClose={() => setOpen(null)} onStep={step} />}</AnimatePresence>
    </LayoutGroup>
  );
}

function Lightbox({ photo, onClose, onStep }: { photo: Photo; onClose: () => void; onStep: (d: number) => void }) {
  return (
    <motion.div className="fixed inset-0 z-[65] flex items-center justify-center p-4 sm:p-10" role="dialog" aria-modal="true" aria-label={photo.caption}>
      <motion.button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        data-cursor="Close"
      />
      <figure className="relative flex max-h-full w-full max-w-5xl flex-col items-center">
        <motion.div
          layoutId={`photo-${photo.src}`}
          transition={spring.spatialDefault}
          className="relative w-full overflow-hidden rounded-lg"
          style={{ aspectRatio: `${photo.width}/${photo.height}`, maxHeight: "78vh", maxWidth: `calc(78vh * ${photo.width / photo.height})` }}
        >
          <Image src={photo.src} alt={photo.alt} fill sizes="90vw" className="object-cover" />
        </motion.div>
        <motion.figcaption initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.15 } }} exit={{ opacity: 0 }} className="mt-3 text-center text-[15px] text-white">
          {photo.caption}
        </motion.figcaption>
      </figure>
      {[-1, 1].map((d) => (
        <motion.button
          key={d}
          type="button"
          aria-label={d < 0 ? "Previous image" : "Next image"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onStep(d)}
          className={`absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur ${d < 0 ? "left-3" : "right-3"}`}
        >
          <Icon name={d < 0 ? "arrowBack" : "arrowForward"} />
        </motion.button>
      ))}
    </motion.div>
  );
}
