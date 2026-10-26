import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { resume } from "@/content/resume";
import { site } from "@/content/site";
import { Icon, type IconName } from "@/components/Icon";
import { Shape } from "@/components/Shape";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Kaiuf M — Resume",
  description: "Kaiuf M's resume, as a search results page.",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-themed-google.vercel.app";
const bare = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

// The paper is always printed light, so it uses Google's light palette directly.
const C = {
  ink: "#202124",
  muted: "#5f6368",
  link: "#1a0dab",
  url: "#188038",
  line: "#dadce0",
  soft: "#f1f3f4",
  blue: "#4285f4",
};

const LETTERS: [string, string][] = [
  ["K", "#4285f4"],
  ["a", "#ea4335"],
  ["i", "#fbbc04"],
  ["u", "#34a853"],
  ["f", "#ea4335"],
];

function Contact({ icon, children, href }: { icon: IconName; children: React.ReactNode; href?: string }) {
  const body = (
    <>
      <Icon name={icon} size={11} style={{ color: C.muted }} />
      {children}
    </>
  );
  const cls = "inline-flex items-center gap-1 rounded-full border px-2 py-[2px]";
  return href ? (
    <a href={href} className={cls} style={{ borderColor: C.line }}>
      {body}
    </a>
  ) : (
    <span className={cls} style={{ borderColor: C.line }}>
      {body}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-[2mm] text-[12.5px] font-medium" style={{ color: C.ink }}>
      {children}
    </h2>
  );
}

export default function ResumePage() {
  return (
    <div className="min-h-svh bg-surface-container py-6 print:min-h-0 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center gap-2 px-4 sm:px-0">
        <Link href="/" className="state inline-flex h-10 items-center gap-2 rounded-full px-3 text-[14px] text-on-surface">
          <Icon name="arrowBack" size={18} /> Back to search
        </Link>
        <span className="ml-auto" />
        <PrintButton />
        <a href={site.resumePdf} download className="state soft inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-medium text-on-primary">
          <Icon name="doc" size={18} /> Download PDF
        </a>
      </div>

      <div className="mx-auto max-w-full overflow-x-auto px-4 sm:px-0 print:overflow-visible print:p-0">
        <article
          className="resume-paper relative mx-auto flex h-[297mm] w-[210mm] print:h-[296mm] flex-col overflow-hidden bg-white shadow-float print:shadow-none"
          style={{ color: C.ink, fontSize: "9.2px", lineHeight: 1.45 }}
        >
          {/* Header: wordmark + search bar, like the homepage */}
          <header className="px-[11mm] pt-[9mm]">
            <div className="flex items-center gap-[6mm]">
              <h1 className="flex items-baseline whitespace-nowrap leading-none" style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.03em", fontVariationSettings: '"ROND" 100' }}>
                {LETTERS.map(([ch, color]) => (
                  <span key={ch} style={{ color }}>
                    {ch}
                  </span>
                ))}
                <span className="ml-[0.25em]" style={{ color: C.muted }}>
                  M
                </span>
              </h1>
              <div className="flex h-[30px] flex-1 items-center gap-2 rounded-full border px-3 text-[11px]" style={{ borderColor: "#c4c7c5" }}>
                <Icon name="search" size={13} style={{ color: C.muted }} />
                <span className="flex-1 truncate">kaiuf m — engineer by curiosity, builder by instinct</span>
                <Icon name="mic" size={13} style={{ color: C.blue }} />
              </div>
            </div>
            <p className="mt-[2.5mm] text-[11px]" style={{ color: C.muted }}>
              {resume.headline}
            </p>
            <div className="mt-[2.5mm] flex flex-wrap gap-[1.5mm] text-[8.6px]">
              <Contact icon="mail" href={`mailto:${site.email}`}>
                {site.email}
              </Contact>
              {resume.phone && <Contact icon="note">{resume.phone}</Contact>}
              <Contact icon="search" href={SITE_URL}>
                {bare(SITE_URL)}
              </Contact>
              <Contact icon="github" href={site.github}>
                {bare(site.github)}
              </Contact>
              <Contact icon="linkedin" href={site.linkedin}>
                {bare(site.linkedin)}
              </Contact>
              <Contact icon="pin">{site.basedIn}</Contact>
            </div>
            {/* Tabs row */}
            <div className="mt-[3mm] flex items-end gap-[5mm] border-b text-[9.5px]" style={{ borderColor: C.line, color: C.muted }}>
              {["All", "Projects", "Education", "Achievements", "Skills"].map((t, i) => (
                <span key={t} className="relative pb-[1.8mm]" style={i === 0 ? { color: "#1a73e8", fontWeight: 500 } : undefined}>
                  {t}
                  {i === 0 && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-t-full" style={{ background: "#1a73e8" }} />}
                </span>
              ))}
              <span className="ml-auto pb-[1.8mm] text-[8.4px]">About 6 projects (CGPA 9.04)</span>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-[1fr_62mm] gap-[6mm] px-[11mm] pt-[4mm]">
            {/* Results column */}
            <main className="min-w-0">
              <section className="mb-[3.5mm] rounded-[12px] border px-[4mm] py-[3mm]" style={{ borderColor: C.line }}>
                <p className="text-[8.6px]" style={{ color: C.muted }}>
                  Who is Kaiuf?
                </p>
                <p className="mt-[1mm] text-[9.8px] leading-[1.5]">{resume.summary}</p>
              </section>

              <SectionTitle>Projects</SectionTitle>
              <div className="space-y-[2.6mm]">
                {resume.projects.map((p) => (
                  <section key={p.slug} className="break-inside-avoid">
                    <p className="text-[7.8px]" style={{ color: C.url }}>
                      kaiuf › projects › {p.slug}
                    </p>
                    <h3 className="flex flex-wrap items-baseline gap-x-2 text-[11.2px] leading-tight" style={{ color: C.link }}>
                      <a href={`${SITE_URL}/projects/${p.slug}`}>{p.title}</a>
                      <span className="rounded-full px-[1.6mm] py-[0.2mm] text-[7.6px] font-medium" style={{ background: "#d3e3fd", color: "#041e49" }}>
                        {p.status}
                      </span>
                    </h3>
                    <ul className="mt-[0.6mm] list-disc space-y-[0.4mm] pl-[3.5mm]" style={{ color: "#3c4043" }}>
                      {p.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <div className="mt-[0.8mm] flex flex-wrap gap-[1mm]">
                      {p.stack.map((s) => (
                        <span key={s} className="rounded-full border px-[1.5mm] text-[7.4px]" style={{ borderColor: C.line, color: C.muted }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-[3.5mm]">
                <SectionTitle>Education</SectionTitle>
                <p className="text-[7.8px]" style={{ color: C.url }}>
                  kaiuf › education
                </p>
                <h3 className="text-[11.2px] leading-tight" style={{ color: C.link }}>
                  {resume.education.degree}
                </h3>
                <p style={{ color: "#3c4043" }}>
                  {resume.education.school} · {resume.education.detail}
                </p>
              </div>
            </main>

            {/* Knowledge panel column */}
            <aside className="flex min-w-0 flex-col gap-[3.5mm]">
              <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: C.line }}>
                <div className="relative h-[46mm] w-full">
                  <Image src={site.portrait.src} alt={site.portrait.alt} fill sizes="240px" className="object-cover object-[50%_30%]" priority />
                  <span className="absolute bottom-[2mm] left-[2mm] h-[7mm] w-[7mm]" style={{ color: "#4285f4" }}>
                    <Shape name="cookie" className="h-full w-full" />
                  </span>
                </div>
                <div className="px-[3mm] py-[2.5mm]">
                  <p className="text-[14px] font-medium leading-tight">{site.fullName}</p>
                  <p className="text-[8.4px]" style={{ color: C.muted }}>
                    {site.descriptor}
                  </p>
                  <dl className="mt-[1.5mm] space-y-[0.6mm] text-[8.4px]">
                    {[
                      ["Studying", "B.E. CSE (AI & ML), Rathinam Global University"],
                      ["Based in", site.basedIn],
                      ["Known for", "RAG systems, hackathon prototypes"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="inline font-medium">{k}: </dt>
                        <dd className="inline" style={{ color: C.muted }}>
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <section>
                <SectionTitle>Achievements</SectionTitle>
                <ul className="space-y-[1.6mm]">
                  {resume.achievements.map((a) => (
                    <li key={a.title} className="flex gap-[2mm]">
                      <span className="mt-[0.4mm] grid h-[4.2mm] w-[4.2mm] shrink-0 place-items-center rounded-full" style={{ background: a.color, color: "#202124" }}>
                        <Icon name="lucky" size={9} />
                      </span>
                      <span>
                        <span className="block font-medium">{a.title}</span>
                        <span className="block text-[8.2px]" style={{ color: C.muted }}>
                          {a.detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <SectionTitle>Leadership & community</SectionTitle>
                <ul className="space-y-[1.2mm]">
                  {resume.leadership.map((l) => (
                    <li key={l.title}>
                      <span className="block font-medium">{l.title}</span>
                      <span className="block text-[8.2px]" style={{ color: C.muted }}>
                        {l.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="mt-auto rounded-[12px] px-[3mm] py-[2.5mm]" style={{ background: C.soft }}>
                <p className="mb-[1.5mm] text-[9px] font-medium">Try searching on the site</p>
                <div className="flex flex-wrap gap-[1.2mm]">
                  {["kaiuf hackathon wins", "sudo hire kaiuf", "tic tac toe", "do a barrel roll"].map((q) => (
                    <a key={q} href={`${SITE_URL}/?q=${encodeURIComponent(q)}`} className="inline-flex items-center gap-1 rounded-full bg-white px-[2mm] py-[0.4mm] text-[8px]">
                      <Icon name="search" size={9} style={{ color: C.muted }} />
                      {q}
                    </a>
                  ))}
                </div>
              </section>
            </aside>
          </div>

          {/* Skills as Keep notes, full width */}
          <section className="px-[11mm] pb-[3mm] pt-[3mm]">
            <SectionTitle>Skills</SectionTitle>
            <div className="grid grid-cols-3 gap-[2.2mm]">
              {resume.skills.map((s, i) => (
                <div
                  key={s.area}
                  className="rounded-[8px] border px-[2.6mm] py-[1.8mm]"
                  style={{ background: s.tint, borderColor: "rgba(0,0,0,.06)", transform: `rotate(${[-0.6, 0.5, -0.3, 0.6, -0.5, 0.4][i]}deg)` }}
                >
                  <p className="text-[9px] font-medium">{s.area}</p>
                  <p className="text-[8.2px]" style={{ color: "#3c4043" }}>
                    {s.items}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <footer className="mt-auto flex items-center gap-3 px-[11mm] py-[2.6mm] text-[8px]" style={{ background: C.soft, color: C.muted }}>
            <span>{site.basedIn}</span>
            <span className="ml-auto">
              Full portfolio and case studies at <a href={SITE_URL} style={{ color: C.link }}>{bare(SITE_URL)}</a>. Try searching &ldquo;do a barrel roll&rdquo;.
            </span>
          </footer>
        </article>
      </div>
    </div>
  );
}
