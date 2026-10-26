"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_SEED, SEED_CSS_KEY, SEED_KEY, THEME_KEY, seedCss } from "@/lib/theme";
import { prefersReducedMotion } from "@/lib/motion";

type Mode = "light" | "dark";
type Origin = { x: number; y: number };

type Ctx = {
  mode: Mode;
  seed: string;
  toggleMode: (origin?: Origin) => void;
  setSeed: (seed: string, origin?: Origin) => void;
};

const ThemeCtx = createContext<Ctx | null>(null);
export const useTheme = () => useContext(ThemeCtx)!;

export function originOf(el: Element | null): Origin | undefined {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Circular reveal from `origin` using the View Transitions API; plain swap when unsupported. */
function reveal(apply: () => void, origin?: Origin) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
  if (!doc.startViewTransition || prefersReducedMotion()) {
    apply();
    return;
  }
  const { x, y } = origin ?? { x: innerWidth - 40, y: 32 };
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const root = document.documentElement;
  root.classList.add("theme-reveal");
  const vt = doc.startViewTransition(apply);
  vt.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.2, 0, 0, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
  vt.finished.finally(() => root.classList.remove("theme-reveal"));
}

function writeSeedStyle(css: string) {
  let el = document.getElementById("seed-style");
  if (!css) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("style");
    el.id = "seed-style";
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");
  const [seed, setSeedState] = useState(DEFAULT_SEED);

  useEffect(() => {
    // The inline head script already applied these; mirror them into state.
    /* eslint-disable react-hooks/set-state-in-effect */
    setMode(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    try {
      setSeedState(localStorage.getItem(SEED_KEY) ?? DEFAULT_SEED);
    } catch {}
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const toggleMode = useCallback((origin?: Origin) => {
    const next: Mode = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    reveal(() => {
      document.documentElement.dataset.theme = next;
    }, origin);
    setMode(next);
    store(THEME_KEY, next);
  }, []);

  const setSeed = useCallback((next: string, origin?: Origin) => {
    const css = seedCss(next);
    reveal(() => writeSeedStyle(css), origin);
    setSeedState(next);
    store(SEED_KEY, next === DEFAULT_SEED ? null : next);
    store(SEED_CSS_KEY, css || null);
  }, []);

  return <ThemeCtx.Provider value={{ mode, seed, toggleMode, setSeed }}>{children}</ThemeCtx.Provider>;
}
