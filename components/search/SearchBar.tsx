"use client";

import { AnimatePresence, motion } from "motion/react";
import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { heroQueries } from "@/content/site";
import { suggest } from "@/lib/search";
import { prefersReducedMotion, spring } from "@/lib/motion";
import { Icon } from "@/components/Icon";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (q: string) => void;
  variant: "hero" | "docked";
  autoType?: boolean;
  /** Fires on every (real or auto-typed) keystroke, used for live filtering and the doodle. */
  onType?: (v: string) => void;
};

export type SearchBarHandle = { focus: () => void };

type SpeechRec = {
  start: () => void;
  stop: () => void;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
  lang: string;
  interimResults: boolean;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The hero types itself once per page load, not every time you come back to it.
let autoTypedThisLoad = false;

export const SearchBar = forwardRef<SearchBarHandle, Props>(function SearchBar({ value, onChange, onSubmit, variant, autoType, onType }, ref) {
  const hero = variant === "hero";
  const H = hero ? 52 : 46;
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const [ghost, setGhost] = useState("");
  const [interrupted, setInterrupted] = useState(true);
  const started = useRef(false);
  const [listening, setListening] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [speech, setSpeech] = useState<(() => SpeechRec) | null>(null);

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (Ctor) setSpeech(() => () => new Ctor());
  }, []);

  useEffect(() => {
    if (autoType && !started.current && !autoTypedThisLoad) {
      started.current = true;
      autoTypedThisLoad = true;
        setInterrupted(false);
    }
  }, [autoType]);

  // Self-typing loop. Decorative only: it never touches the real input value.
  useEffect(() => {
    if (interrupted || prefersReducedMotion()) return;
    let cancelled = false;
    (async () => {
      await sleep(900);
      for (const q of heroQueries) {
        for (let i = 1; i <= q.length; i++) {
          if (cancelled) return;
          setGhost(q.slice(0, i));
          window.dispatchEvent(new CustomEvent("kaiuf:keystroke"));
          await sleep(55 + Math.random() * 70 + (Math.random() < 0.08 ? 260 : 0));
        }
        await sleep(1400);
        for (let i = q.length; i >= 0; i--) {
          if (cancelled) return;
          setGhost(q.slice(0, i));
          await sleep(18);
        }
        await sleep(220);
      }
      if (!cancelled) setInterrupted(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [interrupted]);

  const stopAuto = () => {
    if (!interrupted) {
      setInterrupted(true);
      setGhost("");
    }
  };

  const showingGhost = !interrupted && !value && ghost.length > 0;
  const basis = showingGhost ? ghost : value;
  // While self-typing, the list is decorative: shorter, and clicks pass through to the buttons below.
  const items = focused ? suggest(basis, hero ? 6 : 7) : showingGhost ? suggest(basis, 3) : [];
  const decorative = showingGhost && !focused;
  const open = items.length > 0 && (focused || showingGhost);
  const ROW = 44;
  const panelH = open ? H + 8 + items.length * ROW + 10 : H;

  const submit = (q: string) => {
    setActive(-1);
    inputRef.current?.blur();
    setFocused(false);
    onSubmit(q);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit(active >= 0 ? items[active] : value);
    } else if (e.key === "Escape") {
      if (value) onChange("");
      inputRef.current?.blur();
      setFocused(false);
    }
  };

  const listen = () => {
    if (!speech) return;
    stopAuto();
    const rec = speech();
    rec.lang = "en-IN";
    rec.interimResults = true;
    let last = "";
    rec.onresult = (e) => {
      last = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      onChange(last);
    };
    rec.onend = () => {
      setListening(false);
      if (last) submit(last);
    };
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  return (
    <motion.div
      layoutId="searchbar"
      transition={spring.spatialSlow}
      className="relative w-full"
      style={{ height: H, borderRadius: H / 2, zIndex: open && !decorative ? 40 : 1 }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Surface: grows to hold suggestions, Google-style */}
      <motion.div
        aria-hidden
        style={{ pointerEvents: "none" }}
        className={`absolute inset-x-0 top-0 overflow-hidden border bg-surface dark:bg-surface-container-high ${
          open || focused ? "border-transparent" : "border-outline dark:border-transparent"
        } ${hero ? "" : "dark:bg-surface-container-high"}`}
        initial={false}
        animate={{
          height: panelH,
          borderRadius: open ? 24 : H / 2,
          boxShadow: open || focused || hovered ? "var(--shadow-search)" : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ height: spring.spatialDefault, borderRadius: spring.spatialDefault, boxShadow: spring.effectsDefault }}
      />
      <div className="relative flex h-full items-center gap-1 pl-4 pr-2">
        <Icon name="search" size={20} className="shrink-0 text-on-surface-variant" />
        <div className="relative h-full min-w-0 flex-1">
          <input
            ref={inputRef}
            role="combobox"
            aria-label="Search Kaiuf"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            value={value}
            placeholder={showingGhost ? "" : "Search Kaiuf"}
            onFocus={() => {
              stopAuto();
              setFocused(true);
            }}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onPointerDown={stopAuto}
            onKeyDown={onKeyDown}
            onChange={(e) => {
              stopAuto();
              setActive(-1);
              onChange(e.target.value);
              onType?.(e.target.value);
              window.dispatchEvent(new CustomEvent("kaiuf:keystroke"));
            }}
            className="h-full w-full bg-transparent px-3 text-[16px] text-on-surface outline-none placeholder:text-on-surface-variant"
          />
          {showingGhost && (
            <span aria-hidden className="pointer-events-none absolute inset-y-0 left-3 flex items-center whitespace-nowrap text-[16px] text-on-surface">
              {ghost}
              <span className="ml-px inline-block h-5 w-[2px] animate-pulse bg-g-blue" />
            </span>
          )}
        </div>
        <AnimatePresence>
          {value && (
            <motion.button
              type="button"
              aria-label="Clear search"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={spring.spatialFast}
              onClick={() => {
                onChange("");
                onType?.("");
                inputRef.current?.focus();
              }}
              className="state grid h-10 w-10 shrink-0 place-items-center rounded-full text-on-surface-variant"
            >
              <Icon name="close" size={20} />
            </motion.button>
          )}
        </AnimatePresence>
        {value && <span className="h-6 w-px bg-outline" aria-hidden />}
        {speech && (
          <button
            type="button"
            aria-label={listening ? "Listening…" : "Search by voice"}
            onClick={listen}
            className={`state grid h-10 w-10 shrink-0 place-items-center rounded-full ${listening ? "text-g-red" : "text-g-blue"}`}
          >
            <span className={`grid place-items-center rounded-full ${listening ? "pulse-dot" : ""}`}>
              <Icon name="mic" size={22} />
            </span>
          </button>
        )}
        <button
          type="button"
          aria-label="Search"
          onClick={() => submit(value)}
          className={`state grid h-10 w-10 shrink-0 place-items-center rounded-full text-g-blue ${hero ? "hidden" : ""}`}
        >
          <Icon name="search" size={22} />
        </button>
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label="Suggestions"
        className="absolute inset-x-0 overflow-hidden"
        aria-hidden={decorative || undefined}
        style={{ top: H, pointerEvents: open && !decorative ? "auto" : "none" }}
      >
        {open && <li aria-hidden className="mx-4 mb-1 border-t border-outline" />}
        <AnimatePresence initial={false}>
          {open &&
            items.map((s, i) => {
              const typed = basis.trim().toLowerCase();
              const starts = typed && s.startsWith(typed);
              return (
                <motion.li
                  key={s}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0, transition: { ...spring.spatialDefault, delay: i * 0.03 } }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => submit(s)}
                  onPointerEnter={() => setActive(i)}
                  className="relative flex cursor-pointer items-center gap-3 px-4 text-[16px]"
                  style={{ height: ROW }}
                >
                  {i === active && (
                    <motion.span
                      layoutId={`suggest-hl-${variant}`}
                      className="absolute inset-0 bg-on-surface/[0.06]"
                      transition={spring.spatialFast}
                    />
                  )}
                  <Icon name="search" size={18} className="relative shrink-0 text-on-surface-variant" />
                  <span className="relative truncate">
                    {starts ? (
                      <>
                        {s.slice(0, typed.length)}
                        <b className="font-semibold">{s.slice(typed.length)}</b>
                      </>
                    ) : (
                      s
                    )}
                  </span>
                </motion.li>
              );
            })}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
});
