"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ViewTransition } from "react";
import type { Project } from "@/content/site";
import { spring } from "@/lib/motion";
import { Wordmark } from "@/components/hero/Wordmark";
import { Icon } from "@/components/Icon";
import { ContactButton, ThemeToggle } from "@/components/chrome/HeaderControls";
import { ProjectThumb } from "@/components/projects/Visuals";

export function CaseHeader() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Came from the results page in this tab? Then "back" should restore it exactly.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanGoBack(document.referrer.startsWith(location.origin) || window.history.length > 1);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-outline bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3 lg:px-8">
        <button
          type="button"
          aria-label="Back to results"
          onClick={() => (canGoBack ? router.back() : router.push("/?q=kaiuf+projects&tab=projects"))}
          className="state grid h-11 w-11 place-items-center rounded-full text-on-surface-variant"
        >
          <Icon name="arrowBack" />
        </button>
        <Link href="/" aria-label="Kaiuf home" className="hidden sm:block">
          <Wordmark size="small" />
        </Link>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/?q=${encodeURIComponent(q.trim())}`);
          }}
          className="ml-2 flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-outline px-4 transition-shadow focus-within:shadow-search hover:shadow-search sm:max-w-[520px]"
        >
          <Icon name="search" size={18} className="shrink-0 text-on-surface-variant" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Kaiuf" aria-label="Search Kaiuf" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
        </form>
        <div className="ml-auto flex items-center">
          <ThemeToggle />
          <span className="hidden sm:block">
            <ContactButton />
          </span>
        </div>
      </div>
    </header>
  );
}

export function CaseToc({ sections }: { sections: { id: string; heading: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <div className="sticky top-28 pt-24">
        <p className="mb-3 text-[13px] font-medium text-on-surface-variant">On this page</p>
        <ul className="relative space-y-1 border-l border-outline">
          {sections.map((s) => (
            <li key={s.id} className="relative">
              {active === s.id && <motion.span layoutId="toc-indicator" className="absolute -left-px top-0 h-full w-[3px] rounded-full bg-primary" transition={spring.spatialFast} />}
              <a href={`#${s.id}`} className={`block py-1.5 pl-4 text-[14px] transition-colors ${active === s.id ? "font-medium text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                {s.heading}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function NextResult({ project }: { project: Project }) {
  return (
    <div className="mt-20 border-t border-outline pt-8">
      <p className="mb-3 text-[14px] text-on-surface-variant">Next result</p>
      <Link href={`/projects/${project.slug}`} transitionTypes={["next-case"]} data-cursor="Next" className="group block">
        <motion.div whileHover={{ scale: 1.01 }} transition={spring.spatialDefault} className="flex items-center gap-5 rounded-xl border border-outline p-5 transition-colors hover:bg-surface-container">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-result-url">kaiuf › projects › {project.slug}</p>
            <ViewTransition name={`title-${project.slug}`} share="morph" default="none">
              <p className="soft-in-group mt-1 text-[24px] text-link">
                <span className="draw-underline">{project.title}</span>
              </p>
            </ViewTransition>
            <p className="mt-1 line-clamp-2 text-[14px] text-on-surface-variant">{project.snippet}</p>
          </div>
          <ViewTransition name={`visual-${project.slug}`} share="morph" default="none">
            <ProjectThumb project={project} className="hidden sm:block" />
          </ViewTransition>
        </motion.div>
      </Link>
    </div>
  );
}
