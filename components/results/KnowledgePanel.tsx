"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { about, site } from "@/content/site";
import type { ShapeName } from "@/lib/shapes";
import { ShapeMask } from "@/components/Shape";
import { Icon } from "@/components/Icon";
import { useCompose } from "@/components/providers/Compose";

const VISIT_SHAPES: ShapeName[] = ["cookie", "sunny", "clover", "softBurst", "gem"];

export function KnowledgePanel({ compact = false }: { compact?: boolean }) {
  const compose = useCompose();
  const [shape, setShape] = useState<ShapeName>("circle");

  useEffect(() => {
    // A new shape every visit (morphs in from a circle).
    let n = 0;
    try {
      n = Number(localStorage.getItem("kaiuf:visit") ?? 0) + 1;
      localStorage.setItem("kaiuf:visit", String(n));
    } catch {}
    const t = setTimeout(() => setShape(VISIT_SHAPES[n % VISIT_SHAPES.length]), 350);
    return () => clearTimeout(t);
  }, []);

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
      <section aria-label="About Kaiuf" className="mb-6 flex items-center gap-4 rounded-xl border border-outline p-4">
        <ShapeMask name={shape} className="relative h-20 w-20 shrink-0">
          <Image src={site.portrait.src} alt={site.portrait.alt} fill sizes="80px" className="object-cover" />
        </ShapeMask>
        <div className="min-w-0">
          <h2 className="text-[22px] font-medium leading-tight">{site.fullName}</h2>
          <p className="text-[14px] text-on-surface-variant">{site.descriptor}</p>
          {site.status && (
            <p className="mt-1 flex items-center gap-2 text-[13px]">
              <span className="pulse-dot h-2 w-2 rounded-full bg-g-green" />
              {site.status}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <aside aria-label="About Kaiuf" className="sticky top-[150px] overflow-hidden rounded-xl border border-outline">
      <div className="flex items-end gap-4 p-5 pb-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[28px] font-medium leading-tight" style={{ fontVariationSettings: '"ROND" 40' }}>
            {site.fullName}
          </h2>
          <p className="text-[14px] text-on-surface-variant">{site.descriptor}</p>
        </div>
        <ShapeMask name={shape} className="relative h-[112px] w-[112px] shrink-0">
          <Image src={site.portrait.src} alt={site.portrait.alt} fill sizes="112px" className="object-cover" priority />
        </ShapeMask>
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
    </aside>
  );
}
