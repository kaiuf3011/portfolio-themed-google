// Every easter egg on the site, plus the collector that remembers which ones a visitor found.

export type EggId =
  | "barrel"
  | "askew"
  | "upside"
  | "circle"
  | "scatter"
  | "gravity"
  | "snap"
  | "party"
  | "cat"
  | "matrix"
  | "lights"
  | "coin"
  | "die"
  | "tictactoe"
  | "spinner"
  | "breathe"
  | "sudo"
  | "cooked"
  | "recursion"
  | "anagram"
  | "konami"
  | "poke"
  | "nap"
  | "console";

/** Eggs that do something to the page. */
export type Effect = "barrel" | "askew" | "upside" | "circle" | "scatter" | "gravity" | "snap" | "party" | "cat" | "matrix" | "lights-on" | "lights-off";
/** Eggs that render inside the answer box. */
export type ToyAnswer = "coin" | "die" | "tictactoe" | "spinner" | "breathe" | "sudo" | "cooked" | "eggs";

export const EGGS: { id: EggId; name: string; hint: string }[] = [
  { id: "barrel", name: "Barrel roll", hint: "Z or R twice" },
  { id: "askew", name: "Askew", hint: "Something's a little off" },
  { id: "upside", name: "Upside down", hint: "Australia mode" },
  { id: "gravity", name: "Gravity", hint: "What goes up…" },
  { id: "snap", name: "The snap", hint: "Perfectly balanced" },
  { id: "circle", name: "Circle rush", hint: "A rush, but round" },
  { id: "scatter", name: "Say it thrice", hint: "Say my name. Three times." },
  { id: "party", name: "Party mode", hint: "Throw one" },
  { id: "cat", name: "Cat walk", hint: "Meow?" },
  { id: "matrix", name: "The Matrix", hint: "Follow the white rabbit" },
  { id: "lights", name: "Light switch", hint: "Ask for the lights" },
  { id: "coin", name: "Coin flip", hint: "Heads or tails" },
  { id: "die", name: "Dice roll", hint: "Feeling dicey" },
  { id: "tictactoe", name: "Tic-tac-toe", hint: "X's and O's" },
  { id: "spinner", name: "Fidget spinner", hint: "2017 called" },
  { id: "breathe", name: "Breathe", hint: "Inhale…" },
  { id: "sudo", name: "Root access", hint: "Ask nicely, as root" },
  { id: "cooked", name: "Vibe check", hint: "Is he cooked?" },
  { id: "recursion", name: "Recursion", hint: "To understand it, see: it" },
  { id: "anagram", name: "Anagram", hint: "Rearrange the letters" },
  { id: "konami", name: "Konami code", hint: "↑ ↑ ↓ ↓ ← → ← → B A" },
  { id: "poke", name: "Doodle poke", hint: "Bother the little guy" },
  { id: "nap", name: "Nap time", hint: "Leave him alone for a while" },
  { id: "console", name: "Under the hood", hint: "Developers, open your tools" },
];

export type QueryEgg = { id?: EggId; effect?: Effect; toy?: ToyAnswer; didYouMean?: string };

const RULES: [RegExp, QueryEgg][] = [
  [/do a barrel roll|z or r twice/, { id: "barrel", effect: "barrel" }],
  [/^(askew|tilt)$/, { id: "askew", effect: "askew" }],
  [/upside ?down|australia|flip the (page|site)/, { id: "upside", effect: "upside" }],
  [/gravity|fall down/, { id: "gravity", effect: "gravity" }],
  [/thanos|snap|infinity gauntlet/, { id: "snap", effect: "snap" }],
  [/circle rush|zerg rush/, { id: "circle", effect: "circle" }],
  [/^(kaiuf\s*){3,}$/, { id: "scatter", effect: "scatter" }],
  [/party|celebrate|confetti|let'?s go+/, { id: "party", effect: "party" }],
  [/^(cat|cats|meow|kitty)$|\bmeow\b/, { id: "cat", effect: "cat" }],
  [/matrix|red pill|blue pill|white rabbit/, { id: "matrix", effect: "matrix" }],
  [/dark mode|lights? off|turn off the lights/, { id: "lights", effect: "lights-off" }],
  [/light mode|lights? on|turn on the lights/, { id: "lights", effect: "lights-on" }],
  [/flip a coin|coin ?flip|heads or tails/, { id: "coin", toy: "coin" }],
  [/roll a (die|dice)|\bdice\b|roll the die/, { id: "die", toy: "die" }],
  [/tic ?tac ?toe|noughts and crosses/, { id: "tictactoe", toy: "tictactoe" }],
  [/fidget|spinner/, { id: "spinner", toy: "spinner" }],
  [/breath|breathe|calm down|i'?m stressed|relax/, { id: "breathe", toy: "breathe" }],
  [/^sudo\b/, { id: "sudo", toy: "sudo" }],
  [/cooked|rizz|no cap|vibe check|aura|slay|goated|\bmid\b|delulu/, { id: "cooked", toy: "cooked" }],
  [/^recursion$/, { id: "recursion", didYouMean: "recursion" }],
  [/^anagram$/, { id: "anagram", didYouMean: "nag a ram" }],
  [/^nag a ram$/, { didYouMean: "anagram" }],
  [/easter ?eggs?|secrets?|^eggs?$/, { toy: "eggs" }],
];

function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

export function detectEgg(raw: string): QueryEgg {
  const q = raw.trim().toLowerCase();
  const hit = RULES.find(([re]) => re.test(q));
  if (hit) return hit[1];
  // Gentle spelling help for the one word this search engine cares about.
  const words = q.split(/\s+/);
  const typo = words.findIndex((w) => w !== "kaiuf" && w.length >= 4 && w.length <= 7 && lev(w, "kaiuf") <= 2);
  if (typo >= 0 && /^k/.test(words[typo])) return { didYouMean: words.map((w, i) => (i === typo ? "kaiuf" : w)).join(" ") };
  return {};
}

// ---------- Collector ----------
const KEY = "kaiuf:eggs";
export const EGG_EVENT = "kaiuf:egg";

export function foundEggs(): Set<EggId> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

/** Marks an egg as found. Fires `kaiuf:egg` with `{ id, isNew, count }` so the UI can celebrate. */
export function discover(id: EggId) {
  if (typeof window === "undefined") return;
  const found = foundEggs();
  const isNew = !found.has(id);
  if (isNew) {
    found.add(id);
    try {
      localStorage.setItem(KEY, JSON.stringify([...found]));
    } catch {}
  }
  window.dispatchEvent(new CustomEvent(EGG_EVENT, { detail: { id, isNew, count: found.size } }));
}
