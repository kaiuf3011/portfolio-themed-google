"use client";

import { MotionConfig } from "motion/react";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/components/providers/Theme";
import { SnackbarProvider } from "@/components/providers/Snackbar";
import { ComposeProvider, useCompose } from "@/components/providers/Compose";
import { useSnackbar } from "@/components/providers/Snackbar";
import { EGGS, EGG_EVENT, discover, foundEggs, type EggId } from "@/lib/eggs";
import { Cursor } from "@/components/providers/Cursor";
import { confetti } from "@/lib/confetti";

declare global {
  interface Window {
    __lenis?: Lenis;
    kaiuf?: Record<string, () => string>;
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
        discover("konami");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

/** Celebrates each newly found secret with a snackbar. */
function EggToaster() {
  const snackbar = useSnackbar();
  const router = useRouter();
  useEffect(() => {
    const onEgg = (e: Event) => {
      const { id, isNew, count } = (e as CustomEvent<{ id: EggId; isNew: boolean; count: number }>).detail;
      if (!isNew) return;
      const name = EGGS.find((x) => x.id === id)?.name ?? "Something";
      const all = count === EGGS.length;
      setTimeout(
        () =>
          snackbar.show({
            message: all ? `All ${EGGS.length} secrets found. Legend behaviour.` : `Secret found: ${name} (${count} of ${EGGS.length})`,
            actionLabel: "See all",
            onAction: () => {
              // On the search page, search in place; elsewhere, go there.
              if (location.pathname === "/") window.dispatchEvent(new CustomEvent("kaiuf:search", { detail: "easter eggs" }));
              else router.push("/?q=easter+eggs");
            },
            duration: 4500,
          }),
        900,
      );
    };
    window.addEventListener(EGG_EVENT, onEgg);
    return () => window.removeEventListener(EGG_EVENT, onEgg);
  }, [snackbar, router]);
  return null;
}

/** A hello for anyone who opens dev tools, plus a tiny console API. */
function ConsoleEgg() {
  const compose = useCompose();
  const greeted = useRef(false);
  useEffect(() => {
    if (!greeted.current) {
      greeted.current = true;
      const c = (color: string) => `color:${color};font:600 28px system-ui`;
      console.log("%cK%ca%ci%cu%cf", c("#4285f4"), c("#ea4335"), c("#fbbc04"), c("#34a853"), c("#ea4335"));
      console.log("%cLooking under the hood? Respect. Try kaiuf.hire(), kaiuf.secrets() or kaiuf.stack().", "font:14px system-ui");
    }
    window.kaiuf = {
      hire: () => {
        discover("console");
        compose.open({ subject: "Internship" });
        return "Compose window opened. Say hi.";
      },
      secrets: () => {
        discover("console");
        const found = foundEggs();
        return EGGS.map((e) => `${found.has(e.id) ? "✓" : "·"} ${found.has(e.id) ? e.name : `??? (${e.hint})`}`).join("\n");
      },
      stack: () => {
        discover("console");
        return "Next.js 16, React 19, motion, Lenis, Material color utilities, Google Sans Flex. Shapes are hand-rolled radial functions.";
      },
    };
  }, [compose]);
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
            <EggToaster />
            <ConsoleEgg />
            <Cursor />
          </ComposeProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
