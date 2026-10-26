"use client";

import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import Lenis from "lenis";
import { ThemeProvider } from "@/components/providers/Theme";
import { SnackbarProvider } from "@/components/providers/Snackbar";
import { ComposeProvider } from "@/components/providers/Compose";
import { Cursor } from "@/components/providers/Cursor";
import { confetti } from "@/lib/confetti";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, autoRaf: true, anchors: true });
    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
  return null;
}

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function Konami() {
  useEffect(() => {
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        confetti(innerWidth / 2, innerHeight / 2);
        setTimeout(() => confetti(innerWidth / 4, innerHeight * 0.7), 150);
        setTimeout(() => confetti((innerWidth * 3) / 4, innerHeight * 0.7), 300);
        window.dispatchEvent(new CustomEvent("kaiuf:dance"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

export function scrollToTop() {
  if (window.__lenis) window.__lenis.scrollTo(0, { duration: 0.8 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <SnackbarProvider>
          <ComposeProvider>
            {children}
            <SmoothScroll />
            <Konami />
            <Cursor />
          </ComposeProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
