"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { useCompose } from "@/components/providers/Compose";
import { scrollToTop } from "@/components/providers/Providers";

export function Footer({ onBackToSearch }: { onBackToSearch?: () => void }) {
  const compose = useCompose();
  const [year, setYear] = useState<number | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setYear(new Date().getFullYear()), []);
  const link = "state rounded-full px-2 py-1 hover:text-on-surface";
  return (
    <footer className="mt-auto bg-surface-container text-[14px] text-on-surface-variant">
      <div className="border-b border-outline px-4 py-3 sm:px-8">{site.basedIn}</div>
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-8">
        <nav aria-label="Footer" className="-mx-2 flex flex-wrap gap-x-1 gap-y-1">
          <Link href="/?q=kaiuf+projects&tab=projects" className={link}>
            Projects
          </Link>
          <a href={site.resume} className={link}>
            Resume
          </a>
          <a href={site.github} target="_blank" rel="noreferrer" className={link}>
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noreferrer" className={link}>
            LinkedIn
          </a>
          <button type="button" onClick={(e) => compose.open({ origin: e.currentTarget })} className={link}>
            Contact
          </button>
          <button
            type="button"
            onClick={() => {
              scrollToTop();
              onBackToSearch?.();
            }}
            className={`${link} font-medium text-primary`}
          >
            Back to search
          </button>
        </nav>
        <p className="sm:ml-auto">Made with too much caffeine in Coimbatore. Try asking for a barrel roll.</p>
      </div>
      <p className="px-4 pb-5 text-[12px] sm:px-8">
        © {year ? `${year} ` : ""}{site.fullName}. A love letter to Google design. Not affiliated with Google.
      </p>
    </footer>
  );
}
