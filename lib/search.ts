import { projects, suggestions, type Project } from "@/content/site";

export type Tab = "all" | "projects" | "images" | "journey" | "skills" | "ask";
export const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "projects", label: "Projects" },
  { id: "images", label: "Images" },
  { id: "journey", label: "Journey" },
  { id: "skills", label: "Skills" },
  { id: "ask", label: "Ask Kaiuf" },
];
export const isTab = (v: unknown): v is Tab => tabs.some((t) => t.id === v);

export type AnswerKind = "hire" | "resume" | "cgpa" | "contact" | "hackathons" | "coin" | "die" | "education";
export type Egg = "barrel" | "askew" | "circle" | "scatter";

const STOP = new Set(
  "kaiuf kaiufs kaiuf's is the a an and or of for to what who how does did do show me his he by in on with that actually anything about i can are was find search".split(" "),
);

function stem(w: string) {
  return w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
}

export function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9#+/.\- ]+/g, " ")
    .split(/[\s/\-.]+/)
    .filter(Boolean)
    .map(stem);
}

export function terms(q: string) {
  return tokenize(q).filter((t) => !STOP.has(t));
}

const TAB_WORDS: [RegExp, Tab][] = [
  [/\b(images?|photos?|pictures?|pics|gallery)\b/, "images"],
  [/\b(journey|timeline|story|route|map)\b/, "journey"],
  [/\b(skills?|stack|tech|tools|languages?)\b/, "skills"],
  [/\b(ask|chat|question)\b/, "ask"],
  [/\b(projects?|builds?|portfolio)\b/, "projects"],
];

const ANSWERS: [RegExp, AnswerKind][] = [
  [/flip a coin|coin ?flip|heads or tails/, "coin"],
  [/roll a (die|dice)|\bdice\b|roll the die/, "die"],
  [/\b(hire|hiring|available|availability|intern|internships?|freelance|job)\b/, "hire"],
  [/\b(resume|cv)\b/, "resume"],
  [/\b(cgpa|gpa|grades?|marks)\b/, "cgpa"],
  [/\b(contact|email|e-mail|reach|message)\b/, "contact"],
  [/\b(hackathons?|wins?|won|awards?|sih|achievements?|trophy)\b/, "hackathons"],
  [/\b(study|studies|college|university|degree|education)\b/, "education"],
];

// Words that route somewhere but shouldn't also filter projects.
const ROUTING_WORDS = new Set(
  "image photo picture pic gallery journey timeline story route map skill stack tech tool language ask chat question project build portfolio hire hiring available availability intern internship freelance job resume cv cgpa gpa grade mark contact email e-mail reach message study studie college university degree education work".split(" ").map(stem),
);

export function interpret(raw: string) {
  const q = raw.trim().toLowerCase();
  let egg: Egg | undefined;
  if (/do a barrel roll|z or r twice/.test(q)) egg = "barrel";
  else if (/^askew$|^tilt$/.test(q)) egg = "askew";
  else if (/circle rush/.test(q)) egg = "circle";
  else if (/^(kaiuf\s*){3,}$/.test(q)) egg = "scatter";

  const tab = TAB_WORDS.find(([re]) => re.test(q))?.[1];
  const answer = ANSWERS.find(([re]) => re.test(q))?.[1];
  // Eggs and toys aren't real searches: show everything underneath them.
  const toy = !!egg || answer === "coin" || answer === "die";
  const filterTerms = toy ? [] : terms(q).filter((t) => !ROUTING_WORDS.has(t));
  return { tab, answer, egg, filterTerms };
}

type Hit = { project: Project; score: number; matched: string[] };

function index(p: Project) {
  return [
    { words: tokenize(p.name), w: 4 },
    { words: p.tags.flatMap(tokenize), w: 3 },
    { words: p.keywords.flatMap(tokenize), w: 2 },
    { words: tokenize(p.category), w: 2 },
    { words: tokenize(p.snippet), w: 1 },
  ];
}
const INDEX = new Map(projects.map((p) => [p.slug, index(p)]));

const matches = (word: string, term: string) => word === term || (term.length >= 3 && word.startsWith(term));

export function searchProjects(filterTerms: string[]) {
  const t0 = performance.now();
  let hits: Hit[];
  if (filterTerms.length === 0) {
    hits = projects.map((project) => ({ project, score: 1, matched: [] }));
  } else {
    hits = projects
      .map((project) => {
        let score = 0;
        const matched = new Set<string>();
        for (const term of filterTerms) {
          for (const { words, w } of INDEX.get(project.slug)!) {
            if (words.some((word) => matches(word, term))) {
              score += w;
              matched.add(term);
            }
          }
        }
        return { project, score, matched: [...matched] };
      })
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score);
  }
  const seconds = (performance.now() - t0) / 1000;
  return { hits, seconds };
}

export function formatSeconds(s: number) {
  if (s < 0.001) return "under 0.001 seconds";
  return `${s < 0.01 ? s.toPrecision(2) : s.toFixed(2)} seconds`;
}

export function suggest(input: string, limit = 6) {
  const q = input.trim().toLowerCase();
  if (!q) return suggestions.slice(0, limit);
  const starts = suggestions.filter((s) => s.startsWith(q) && s !== q);
  const contains = suggestions.filter((s) => !s.startsWith(q) && s.includes(q));
  const tokens = terms(q);
  const fuzzy = suggestions.filter(
    (s) => !s.includes(q) && tokens.length > 0 && tokens.every((t) => terms(s).some((w) => w.startsWith(t))),
  );
  return [...starts, ...contains, ...fuzzy].slice(0, limit);
}

/** Split text into parts, flagging words that match any of the terms (for bolding). */
export function highlight(text: string, highlightTerms: string[]) {
  if (highlightTerms.length === 0) return [{ text, hit: false }];
  return text.split(/(\s+)/).map((chunk) => {
    const w = stem(chunk.toLowerCase().replace(/[^a-z0-9#+]/g, ""));
    return { text: chunk, hit: w.length > 0 && highlightTerms.some((t) => matches(w, t)) };
  });
}
