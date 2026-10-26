import { about, experience, journey, peopleAlsoAsk, projects, site, skills } from "@/content/site";
import { tokenize } from "@/lib/search";

export type Chunk = { id: string; title: string; text: string };

// Everything the Ask Kaiuf assistant is allowed to know, as small retrievable chunks.
export const chunks: Chunk[] = [
  { id: "who", title: "Who is Kaiuf", text: `${about.who} ${about.definition}` },
  {
    id: "education",
    title: "Education",
    text: `${about.education.degree} at ${about.education.school}. CGPA ${about.education.cgpa}.${about.education.expected ? ` Expected graduation ${about.education.expected}.` : ""}`,
  },
  {
    id: "contact",
    title: "Contact and availability",
    text: `Reach Kaiuf through the compose window on this site or at ${site.email}. GitHub: ${site.github}. Resume: ${site.resume}. Based in ${site.basedIn}.${site.status ? ` Status: ${site.status}.` : ""}`,
  },
  { id: "stats", title: "Numbers", text: about.stats.map((s) => `${s.value} ${s.label}`).join(", ") + "." },
  { id: "manifesto", title: "How Kaiuf works", text: about.manifesto.map(([a, b]) => `${a} ${b}`).join(" ") },
  ...projects.map((p) => ({
    id: `project-${p.slug}`,
    title: `Project: ${p.name}`,
    text: [
      `${p.name} (${p.category}, ${p.status}${p.badge ? `, ${p.badge}` : ""}). ${p.snippet}`,
      `Stack: ${p.tags.join(", ")}.`,
      ...p.sections.map((s) => `${s.heading}: ${s.body.join(" ")}${s.flow ? ` Steps: ${s.flow.join(" → ")}.` : ""}`),
    ].join(" "),
  })),
  ...journey.map((m) => ({ id: `journey-${m.id}`, title: `Milestone: ${m.title}`, text: `${m.when}: ${m.title}. ${m.detail}` })),
  ...skills.map((s) => ({ id: `skills-${s.id}`, title: `Skills: ${s.title}`, text: `${s.title}: ${s.items.join(", ")}.` })),
  ...experience.map((e, i) => ({ id: `exp-${i}`, title: `${e.category}: ${e.title}`, text: `${e.title}. ${e.detail}` })),
  ...peopleAlsoAsk.map((f, i) => ({ id: `faq-${i}`, title: f.q, text: `${f.q} ${f.a}` })),
];

export function knowledgeText() {
  return chunks.map((c) => `<chunk id="${c.id}" title="${c.title}">\n${c.text}\n</chunk>`).join("\n");
}

/** Keyword retrieval used when no model is configured. */
export function retrieve(question: string, k = 2) {
  const q = new Set(tokenize(question).filter((t) => t.length > 2 && !["kaiuf", "what", "does", "has", "his", "the", "and", "who", "how"].includes(t)));
  if (q.size === 0) return [];
  return chunks
    .map((c) => {
      const words = new Set(tokenize(`${c.title} ${c.text}`));
      let score = 0;
      for (const t of q) if ([...words].some((w) => w === t || w.startsWith(t))) score++;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((x) => x.c);
}
