import { argbFromHex, hexFromArgb, themeFromSourceColor } from "@material/material-color-utilities";

export const DEFAULT_SEED = "#4285f4";
export const seedSwatches = ["#4285f4", "#ea4335", "#fbbc04", "#34a853"];

export const THEME_KEY = "kaiuf:theme";
export const SEED_KEY = "kaiuf:seed";
export const SEED_CSS_KEY = "kaiuf:seed-css";

/** Builds CSS overriding surface/primary roles from a seed (HCT tonal palettes). Brand quad is untouched. */
export function seedCss(seed: string) {
  if (seed.toLowerCase() === DEFAULT_SEED) return "";
  const { palettes } = themeFromSourceColor(argbFromHex(seed));
  const p = (tone: number) => hexFromArgb(palettes.primary.tone(tone));
  const n = (tone: number) => hexFromArgb(palettes.neutral.tone(tone));
  const v = (tone: number) => hexFromArgb(palettes.neutralVariant.tone(tone));
  const light = {
    "--surface": n(99),
    "--surface-container": n(96),
    "--surface-container-high": n(94),
    "--surface-container-highest": n(90),
    "--outline": v(80),
    "--on-surface": n(10),
    "--on-surface-variant": v(30),
    "--link": p(30),
    "--primary": p(40),
    "--on-primary": p(100),
    "--primary-container": p(90),
    "--on-primary-container": p(10),
  };
  const dark = {
    "--surface": n(6),
    "--surface-container": n(12),
    "--surface-container-high": n(17),
    "--surface-container-highest": n(22),
    "--outline": v(30),
    "--on-surface": n(90),
    "--on-surface-variant": v(80),
    "--link": p(80),
    "--primary": p(80),
    "--on-primary": p(20),
    "--primary-container": p(30),
    "--on-primary-container": p(90),
  };
  const block = (vars: Record<string, string>) => Object.entries(vars).map(([k, val]) => `${k}:${val}`).join(";");
  return `:root:not([data-theme="dark"]){${block(light)}}[data-theme="dark"]{${block(dark)}}`;
}

// Runs before first paint (inlined in <head>) so there's no theme flash.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t;var c=localStorage.getItem("${SEED_CSS_KEY}");if(c){var s=document.createElement("style");s.id="seed-style";s.textContent=c;document.head.appendChild(s)}}catch(e){document.documentElement.dataset.theme="light"}})();`;
