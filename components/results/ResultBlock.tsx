"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ViewTransition } from "react";
import type { Project } from "@/content/site";
import { highlight } from "@/lib/search";
import { spring } from "@/lib/motion";
import { ProjectThumb } from "@/components/projects/Visuals";
import { Shape } from "@/components/Shape";

const dot: Record<Project["color"], string> = {
  blue: "text-g-blue",
  red: "text-g-red",
  yellow: "text-g-yellow",
  green: "text-g-green",
};

export function ResultBlock({ project, terms, index }: { project: Project; terms: string[]; index: number }) {
  const href = `/projects/${project.slug}`;
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { ...spring.spatialDefault, delay: 0.06 + index * 0.03 } }}
      data-result
      className="group relative -mx-4 flex gap-5 rounded-xl px-4 py-4 transition-colors duration-200 hover:bg-surface-container"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-outline bg-surface">
            <Shape name="cookie" className={`h-4 w-4 ${dot[project.color]}`} />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-[14px] text-on-surface">Kaiuf</span>
            <span className="block truncate text-[12px] text-result-url">
              kaiuf › projects › {project.slug}
            </span>
          </span>
        </div>
        <Link href={href} className="block outline-offset-4" data-cursor="Open" transitionTypes={["to-case"]}>
          <ViewTransition name={`title-${project.slug}`} share="morph" default="none">
            <h3 className="soft-in-group inline text-[20px] font-normal leading-[1.3] text-link sm:text-[22px]">
              <span className="draw-underline">{project.title}</span>
            </h3>
          </ViewTransition>
          <span className="absolute inset-0" aria-hidden />
        </Link>
        <p className="mt-1 max-w-[62ch] text-[14px] leading-[1.58] text-on-surface-variant">
          {project.badge && <span className="text-on-surface-variant">{project.badge} — </span>}
          {highlight(project.snippet, terms).map((part, i) =>
            part.hit ? (
              <b key={i} className="font-semibold text-on-surface">
                {part.text}
              </b>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </p>
        <div className="relative mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-primary-container px-2.5 py-0.5 text-[12px] font-medium text-on-primary-container">{project.status}</span>
          {project.tags.map((t) => (
            <span key={t} className="rounded-full border border-outline px-2.5 py-0.5 text-[12px] text-on-surface-variant">
              {t}
            </span>
          ))}
        </div>
      </div>
      <ViewTransition name={`visual-${project.slug}`} share="morph" default="none">
        <ProjectThumb project={project} className="mt-8 hidden transition-transform duration-300 ease-[cubic-bezier(.2,0,0,1)] group-hover:-translate-y-0.5 group-hover:rotate-[8deg] sm:block" />
      </ViewTransition>
    </motion.article>
  );
}
