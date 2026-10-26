import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { projects } from "@/content/site";
import { CaseHeader, CaseToc, NextResult } from "@/components/projects/CaseChrome";
import { ProjectVisual } from "@/components/projects/Visuals";
import { Footer } from "@/components/chrome/Footer";

// Every slug is prerendered by generateStaticParams, so reading params here never blocks in production.
export const instant = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: `${p.name} — Kaiuf M`, description: p.snippet } : {};
}

export default async function CaseStudy({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <div className="flex min-h-svh flex-col">
      <CaseHeader />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-20 pt-8 lg:px-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16">
          <article>
            <p className="text-[14px] text-result-url">kaiuf › projects › {project.slug}</p>
            <ViewTransition name={`title-${project.slug}`} share="morph" default="none">
              <h1 className="headline-l mt-2 max-w-[18ch]">{project.name}</h1>
            </ViewTransition>
            <ViewTransition enter="page" default="none">
              <p className="mt-4 max-w-[60ch] text-[20px] leading-[1.5] text-on-surface-variant">{project.outcome}</p>
            </ViewTransition>

            <ViewTransition enter="page" default="none">
              <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-outline bg-outline sm:grid-cols-3">
                {project.facts.map((f) => (
                  <div key={f.label} className="bg-surface p-4">
                    <dt className="text-[12px] font-medium text-on-surface-variant">{f.label}</dt>
                    <dd className="mt-1 text-[15px]">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </ViewTransition>

            <ViewTransition name={`visual-${project.slug}`} share="morph" default="none">
              <div className="mt-8">
                <ProjectVisual project={project} />
              </div>
            </ViewTransition>

            <ViewTransition enter="page" default="none">
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((t) => (
                  <span key={t} className="rounded-full border border-outline px-3 py-1 text-[13px] text-on-surface-variant">
                    {t}
                  </span>
                ))}
                {project.badge && <span className="rounded-full bg-tint-yellow px-3 py-1 text-[13px] font-medium">{project.badge}</span>}
              </div>
            </ViewTransition>

            <ViewTransition enter="page" default="none">
              <div>
                {project.sections.map((s) => (
                  <section key={s.id} id={s.id} className="mt-14 scroll-mt-28">
                    <h2 className="headline-m">{s.heading}</h2>
                    {s.body.map((para, i) => (
                      <p key={i} className="mt-4 max-w-[68ch] text-[18px] leading-[1.6]">
                        {para}
                      </p>
                    ))}
                    {s.flow && (
                      <ol className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
                        {s.flow.map((step, i) => (
                          <li key={step} className="flex items-center gap-2 sm:contents">
                            <span className={`flex min-h-12 flex-1 items-center gap-3 rounded-lg px-4 py-3 text-[15px] sm:flex-initial ${i === 2 && project.slug === "rgu-ai-assistant" ? "bg-primary-container font-medium text-on-primary-container" : "bg-surface-container-high"}`}>
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface font-mono text-[12px]">{i + 1}</span>
                              {step}
                            </span>
                            {i < s.flow!.length - 1 && (
                              <span aria-hidden className="hidden self-center text-on-surface-variant sm:inline">
                                →
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                ))}
              </div>
            </ViewTransition>

            <NextResult project={next} />
          </article>
          <CaseToc sections={project.sections.map((s) => ({ id: s.id, heading: s.heading }))} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
