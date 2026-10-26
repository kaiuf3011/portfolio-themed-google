"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { DEFAULT_SEED, seedSwatches } from "@/lib/theme";
import { spring } from "@/lib/motion";
import { Icon, type IconName } from "@/components/Icon";
import { originOf, useTheme } from "@/components/providers/Theme";
import { useCompose } from "@/components/providers/Compose";

export function IconButton({
  icon,
  label,
  onClick,
  className = "",
  size = 22,
  ...rest
}: { icon: IconName; label: string; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; className?: string; size?: number } & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      transition={spring.spatialFast}
      onClick={onClick}
      className={`state grid h-11 w-11 shrink-0 place-items-center rounded-full text-on-surface-variant ${className}`}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </motion.button>
  );
}

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title="Toggle theme"
      whileTap={{ scale: 0.9 }}
      onClick={() => toggleMode(originOf(ref.current))}
      className="state grid h-11 w-11 place-items-center overflow-hidden rounded-full text-on-surface-variant"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={mode}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={spring.spatialFast}
          className="grid place-items-center"
        >
          <Icon name={mode === "dark" ? "sun" : "moon"} size={22} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/** Material You–style wallpaper-colour picker. */
export function SeedPicker() {
  const { seed, setSeed } = useTheme();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useDismiss(wrap, open, () => setOpen(false));

  return (
    <div ref={wrap} className="relative">
      <motion.button
        type="button"
        aria-label="Change colour theme"
        aria-expanded={open}
        title="Colour theme"
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((o) => !o)}
        className="state grid h-11 w-11 place-items-center rounded-full"
      >
        <span className="relative grid h-6 w-6 grid-cols-2 overflow-hidden rounded-full ring-2 ring-surface" style={{ outline: `2px solid ${seed}`, outlineOffset: 1 }}>
          <span className="bg-g-blue" />
          <span className="bg-g-red" />
          <span className="bg-g-green" />
          <span className="bg-g-yellow" />
        </span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Colour theme"
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.12 } }}
            transition={spring.spatialDefault}
            style={{ originX: 0, originY: 0 }}
            className="absolute left-0 top-12 z-50 w-[248px] rounded-xl bg-surface-container p-4 shadow-float"
          >
            <p className="mb-1 text-[14px] font-medium">Colour theme</p>
            <p className="mb-3 text-[13px] text-on-surface-variant">Pick a seed. The whole site re-tints around it.</p>
            <div className="flex items-center gap-2">
              {seedSwatches.map((c) => (
                <Swatch key={c} color={c} selected={seed.toLowerCase() === c} onPick={(el) => setSeed(c, originOf(el))} />
              ))}
              <label className="state relative grid h-10 w-10 cursor-pointer place-items-center overflow-hidden rounded-full border border-outline" title="Custom colour">
                <Icon name="palette" size={20} className="text-on-surface-variant" />
                <input
                  type="color"
                  aria-label="Custom colour"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  defaultValue={seed}
                  onChange={(e) => setSeed(e.target.value, originOf(e.target))}
                />
              </label>
            </div>
            {seed.toLowerCase() !== DEFAULT_SEED && (
              <button className="mt-3 text-[13px] font-medium text-primary underline-offset-4 hover:underline" onClick={(e) => setSeed(DEFAULT_SEED, originOf(e.currentTarget))}>
                Reset to default
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Swatch({ color, selected, onPick }: { color: string; selected: boolean; onPick: (el: HTMLElement) => void }) {
  return (
    <motion.button
      type="button"
      aria-label={`Seed ${color}`}
      aria-pressed={selected}
      whileTap={{ scale: 0.85 }}
      onClick={(e) => onPick(e.currentTarget)}
      className="grid h-10 w-10 place-items-center"
      animate={{ borderRadius: selected ? 12 : 20 }}
      transition={spring.spatialFast}
      style={{ background: color }}
    >
      {selected && <Icon name="check" size={18} className="text-white" />}
    </motion.button>
  );
}

function useDismiss(ref: React.RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, close]);
}

type AppItem = { label: string; icon: IconName; color: string; href?: string; tab?: string; action?: "compose"; external?: boolean };

const APPS: AppItem[] = [
  { label: "Projects", icon: "folder", color: "var(--g-red)", tab: "projects" },
  { label: "Images", icon: "image", color: "var(--g-green)", tab: "images" },
  { label: "Journey", icon: "pin", color: "var(--g-blue)", tab: "journey" },
  { label: "Skills", icon: "note", color: "var(--g-yellow)", tab: "skills" },
  { label: "Ask Kaiuf", icon: "sparkle", color: "#9b72cb", tab: "ask" },
  { label: "Mail", icon: "mail", color: "var(--g-red)", action: "compose" },
  { label: "Resume", icon: "doc", color: "var(--g-blue)", href: site.resume, external: true },
  { label: "GitHub", icon: "github", color: "var(--on-surface)", href: site.github, external: true },
  { label: "LinkedIn", icon: "linkedin", color: "#0a66c2", href: site.linkedin, external: true },
];

export function AppsLauncher({ onTab }: { onTab: (tab: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const compose = useCompose();
  useDismiss(wrap, open, () => setOpen(false));

  return (
    <div ref={wrap} className="relative">
      <IconButton icon="apps" label="Kaiuf apps" aria-expanded={open} onClick={() => setOpen((o) => !o)} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
            transition={spring.spatialDefault}
            style={{ originX: 1, originY: 0 }}
            className="absolute right-0 top-12 z-50 w-[300px] rounded-xl bg-surface-container p-3 shadow-float"
          >
            <ul className="grid grid-cols-3 gap-1">
              {APPS.map((a, i) => {
                const inner = (
                  <>
                    <motion.span
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ ...spring.spatialFast, delay: i * 0.025 }}
                      className="grid h-12 w-12 place-items-center rounded-full bg-surface"
                      style={{ color: a.color }}
                    >
                      <Icon name={a.icon} size={26} />
                    </motion.span>
                    <span className="text-[13px]">{a.label}</span>
                  </>
                );
                const cls = "state flex flex-col items-center gap-1.5 rounded-lg px-1 py-3 text-on-surface";
                return (
                  <li key={a.label}>
                    {a.href ? (
                      <a href={a.href} target={a.external ? "_blank" : undefined} rel="noreferrer" className={cls} onClick={() => setOpen(false)}>
                        {inner}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className={`${cls} w-full`}
                        onClick={(e) => {
                          setOpen(false);
                          if (a.action === "compose") compose.open({ origin: e.currentTarget });
                          else if (a.tab) onTab(a.tab);
                        }}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContactButton({ label = "Contact" }: { label?: string }) {
  const compose = useCompose();
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      transition={spring.spatialFast}
      onClick={(e) => compose.open({ origin: e.currentTarget })}
      className="state soft ml-1 inline-flex h-10 shrink-0 items-center rounded-full bg-primary px-5 text-[14px] font-medium text-on-primary"
    >
      {label}
    </motion.button>
  );
}

export function ResumeLink() {
  return (
    <Link href={site.resume} target="_blank" className="state soft hidden h-10 items-center rounded-full px-3 text-[14px] text-on-surface sm:inline-flex">
      Resume
    </Link>
  );
}

/** Google-account-style avatar: the photo, big enough to actually see, one tap away. */
export function AccountButton() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const compose = useCompose();
  useDismiss(wrap, open, () => setOpen(false));

  return (
    <div ref={wrap} className="relative">
      <motion.button
        type="button"
        aria-label="About Kaiuf"
        aria-expanded={open}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        transition={spring.spatialFast}
        onClick={() => setOpen((o) => !o)}
        className="ml-1 grid h-11 w-11 place-items-center rounded-full p-[3px]"
        style={{ background: "conic-gradient(var(--g-blue) 0 25%, var(--g-red) 0 50%, var(--g-yellow) 0 75%, var(--g-green) 0)" }}
      >
        <span className="relative block h-full w-full overflow-hidden rounded-full border-2 border-surface">
          <Image src={site.portrait.src} alt="" fill sizes="44px" className="object-cover object-top" />
        </span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="About Kaiuf"
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
            transition={spring.spatialDefault}
            style={{ originX: 1, originY: 0 }}
            className="absolute right-0 top-14 z-50 w-[300px] rounded-2xl bg-surface-container p-5 text-center shadow-float"
          >
            <p className="text-[13px] text-on-surface-variant">kaiuf › about</p>
            <motion.div
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...spring.spatialDefault, delay: 0.05 }}
              className="relative mx-auto mt-3 h-36 w-36 overflow-hidden rounded-full p-1"
              style={{ background: "conic-gradient(var(--g-blue) 0 25%, var(--g-red) 0 50%, var(--g-yellow) 0 75%, var(--g-green) 0)" }}
            >
              <span className="relative block h-full w-full overflow-hidden rounded-full border-4 border-surface-container">
                <Image src={site.portrait.src} alt={site.portrait.alt} fill sizes="144px" className="object-cover object-top" />
              </span>
            </motion.div>
            <p className="mt-3 text-[22px] font-medium">Hi, I&apos;m Kaiuf!</p>
            <p className="text-[14px] text-on-surface-variant">{site.descriptor}</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  setOpen(false);
                  compose.open({ origin: e.currentTarget });
                }}
                className="state soft h-10 rounded-full bg-primary px-5 text-[14px] font-medium text-on-primary"
              >
                Say hi
              </button>
              <a href={site.resume} target="_blank" rel="noreferrer" className="state soft inline-flex h-10 items-center rounded-full border border-outline px-5 text-[14px] font-medium text-primary">
                Resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
