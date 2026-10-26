"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { relatedSearches, site } from "@/content/site";
import { formatSeconds, interpret, isTab, searchProjects, tabs, type Egg, type Tab } from "@/lib/search";
import { prefersReducedMotion, spring } from "@/lib/motion";
import { SearchBar, type SearchBarHandle } from "@/components/search/SearchBar";
import { Wordmark } from "@/components/hero/Wordmark";
import { Doodle } from "@/components/hero/Doodle";
import { Preloader } from "@/components/hero/Preloader";
import { Lucky } from "@/components/hero/Lucky";
import { AppsLauncher, ContactButton, ResumeLink, SeedPicker, ThemeToggle } from "@/components/chrome/HeaderControls";
import { Footer } from "@/components/chrome/Footer";
import { ResultBlock } from "@/components/results/ResultBlock";
import { KnowledgePanel } from "@/components/results/KnowledgePanel";
import { PeopleAlsoAsk } from "@/components/results/PeopleAlsoAsk";
import { AnswerBox } from "@/components/results/AnswerBox";
import { ImagesStrip, ImagesTab } from "@/components/results/Images";
import { Journey } from "@/components/sections/Journey";
import { KeepBoard } from "@/components/sections/KeepBoard";
import { AskKaiuf } from "@/components/sections/AskKaiuf";
import { CircleRush } from "@/components/eggs/CircleRush";
import { Icon } from "@/components/Icon";
import { useSnackbar } from "@/components/providers/Snackbar";
import { scrollToTop } from "@/components/providers/Providers";

// ---------- URL as the source of truth ----------
const URL_EVENT = "kaiuf:url";
const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  window.addEventListener(URL_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(URL_EVENT, cb);
  };
};

function navigate(q: string | null, tab: Tab, how: "push" | "replace") {
  const params = new URLSearchParams();
  if (q !== null) params.set("q", q);
  if (q !== null && tab !== "all") params.set("tab", tab);
  const url = params.size ? `/?${params}` : "/";
  if (how === "push") window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(URL_EVENT));
}

const INTRO_KEY = "kaiuf:intro-seen";

export function SearchApp() {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => null);
  const params = useMemo(() => new URLSearchParams(search ?? ""), [search]);
  const q = search === null ? null : params.get("q");
  const tabParam = params.get("tab");
  const tab: Tab = isTab(tabParam) ? tabParam : "all";
  const mode = q === null ? "hero" : "results";

  const [input, setInput] = useState(q ?? "");
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    // Back/forward navigation: mirror the URL into the input.
    setSyncedQ(q);
    setInput(q ?? "");
  }

  const [intro, setIntro] = useState<"pending" | "running" | "done">("pending");
  const [drop, setDrop] = useState(false);
  const [lucky, setLucky] = useState<{ x: number; y: number } | null>(null);
  const [rush, setRush] = useState(false);
  const bar = useRef<SearchBarHandle>(null);
  const snackbar = useSnackbar();

  // Decide whether the preloader plays (first hero visit per session, motion allowed).
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {}
    const play = !seen && !prefersReducedMotion() && new URLSearchParams(location.search).get("q") === null;
    /* eslint-disable react-hooks/set-state-in-effect */
    setIntro(play ? "running" : "done");
    if (!play) setDrop(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    if (!play) document.documentElement.classList.remove("booting", "booting-blank");
  }, []);

  const finishIntro = useCallback(() => setIntro("done"), []);
  const revealIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}
    setDrop(true);
  }, []);

  // "/" focuses search, like the real thing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !t.closest("input, textarea, [contenteditable=true], [role=application]")) {
        e.preventDefault();
        bar.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runEgg = useCallback(
    (egg: Egg) => {
      if (prefersReducedMotion()) {
        snackbar.show({ message: "Reduced motion is on, so imagine that just happened. It was great." });
        return;
      }
      if (egg === "barrel") {
        document.getElementById("app")?.animate([{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 1100, easing: "cubic-bezier(0.2, 0, 0, 1)" });
      } else if (egg === "askew") {
        document.documentElement.classList.toggle("askew");
      } else if (egg === "scatter") {
        window.dispatchEvent(new CustomEvent("kaiuf:scatter"));
      } else if (egg === "circle") {
        setTimeout(() => setRush(true), 500);
      }
    },
    [snackbar],
  );

  const submit = useCallback(
    (raw: string) => {
      const query = raw.trim();
      const it = interpret(query);
      if (it.egg) runEgg(it.egg);
      const nextTab: Tab = it.tab ?? (tab === "projects" && mode === "results" && !it.answer ? "projects" : "all");
      setInput(query);
      navigate(query, nextTab, mode === "hero" || query !== q ? "push" : "replace");
      scrollToTop();
    },
    [mode, q, tab, runEgg],
  );

  const goTab = useCallback(
    (t: string) => {
      if (!isTab(t)) return;
      navigate(q ?? input ?? "", t, mode === "hero" ? "push" : "replace");
      scrollToTop();
    },
    [q, input, mode],
  );

  const closeLucky = useCallback(() => setLucky(null), []);

  const goHome = () => {
    navigate(null, "all", "push");
    setInput("");
  };

  return (
    <LayoutGroup>
      {intro === "running" && <Preloader targetId="hero-search" onReveal={revealIntro} onFinish={finishIntro} />}
      {mode === "hero" ? (
        <Hero
          input={input}
          setInput={setInput}
          submit={submit}
          barRef={bar}
          autoType={drop}
          drop={drop}
          onTab={goTab}
          onLucky={(el) => {
            const r = el.getBoundingClientRect();
            setLucky({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
          }}
        />
      ) : (
        <Results q={q ?? ""} input={input} setInput={setInput} tab={tab} submit={submit} goTab={goTab} goHome={goHome} barRef={bar} />
      )}
      <AnimatePresence>{lucky && <Lucky origin={lucky} onClose={closeLucky} />}</AnimatePresence>
      {rush && <CircleRush onDone={() => setRush(false)} />}
    </LayoutGroup>
  );
}

// ---------- Hero ----------
function Hero({
  input,
  setInput,
  submit,
  barRef,
  autoType,
  drop,
  onTab,
  onLucky,
}: {
  input: string;
  setInput: (v: string) => void;
  submit: (q: string) => void;
  barRef: React.RefObject<SearchBarHandle | null>;
  autoType: boolean;
  drop: boolean;
  onTab: (t: string) => void;
  onLucky: (el: HTMLElement) => void;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center gap-1 px-2 py-2 sm:px-4">
        <SeedPicker />
        <div className="ml-auto flex items-center gap-1">
          <ResumeLink />
          <ThemeToggle />
          <AppsLauncher onTab={onTab} />
          <ContactButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-[12vh] sm:pt-[16vh]">
        <h1 className="sr-only">Kaiuf M — search the work of an AI/ML engineer and creative technologist</h1>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={drop ? { opacity: 1, y: 0 } : {}} transition={{ ...spring.spatialDefault, delay: 0.25 }} className="mb-1">
          <Doodle />
        </motion.div>
        <motion.div layoutId="wordmark" transition={spring.spatialSlow} className="mb-7">
          <span className={drop ? "" : "opacity-0"}>
            <Wordmark drop={drop} />
          </span>
        </motion.div>

        <div id="hero-search" className="w-full max-w-[584px]">
          <SearchBar ref={barRef} variant="hero" value={input} onChange={setInput} onSubmit={submit} autoType={autoType} />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={drop ? { opacity: 1 } : {}} transition={{ delay: 0.35, duration: 0.3 }} className="mt-7 flex flex-wrap justify-center gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            transition={spring.spatialFast}
            onClick={() => submit(input || "kaiuf projects")}
            className="state soft h-10 rounded-sm bg-surface-container px-5 text-[14px] text-on-surface hover:shadow-[0_1px_1px_rgba(0,0,0,.1)] dark:bg-surface-container-high"
          >
            Search Kaiuf
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scaleY: 0.9, scaleX: 1.04 }}
            transition={spring.spatialFast}
            onClick={(e) => onLucky(e.currentTarget)}
            className="state soft h-10 rounded-sm bg-surface-container px-5 text-[14px] text-on-surface transition-colors hover:text-g-red dark:bg-surface-container-high"
          >
            I&apos;m feeling lucky
          </motion.button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={drop ? { opacity: 1 } : {}} transition={{ delay: 0.5, duration: 0.4 }} className="mt-8 max-w-[52ch] text-center text-[14px] text-on-surface-variant">
          CSE (AI &amp; ML) student who builds RAG assistants, AR experiences and games.{" "}
          <span className="hidden whitespace-nowrap [@media(pointer:fine)]:inline">
            Press <kbd className="rounded-xs border border-outline px-1.5 font-mono text-[12px]">/</kbd> to search.
          </span>
        </motion.p>
      </main>
      <Footer onBackToSearch={() => barRef.current?.focus()} />
    </div>
  );
}

// ---------- Results ----------
function Results({
  q,
  input,
  setInput,
  tab,
  submit,
  goTab,
  goHome,
  barRef,
}: {
  q: string;
  input: string;
  setInput: (v: string) => void;
  tab: Tab;
  submit: (q: string) => void;
  goTab: (t: string) => void;
  goHome: () => void;
  barRef: React.RefObject<SearchBarHandle | null>;
}) {
  // Committed query drives answers; the live input drives project filtering.
  const committed = useMemo(() => interpret(q), [q]);
  const live = useMemo(() => interpret(input), [input]);
  const { hits, seconds } = useMemo(() => searchProjects(live.filterTerms), [live.filterTerms]);
  const generic = live.filterTerms.length === 0;

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b border-outline bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 px-4 pt-4 lg:grid-cols-[150px_minmax(0,692px)_1fr] lg:px-8 lg:pt-5">
          <button type="button" onClick={goHome} aria-label="Kaiuf home" className="col-start-1 row-start-1 justify-self-start rounded-md">
            <motion.span layoutId="wordmark" transition={spring.spatialSlow} className="block">
              <Wordmark size="small" />
            </motion.span>
          </button>
          <div className="col-span-3 col-start-1 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
            <SearchBar ref={barRef} variant="docked" value={input} onChange={setInput} onSubmit={submit} />
          </div>
          <div className="col-start-3 row-start-1 flex items-center justify-self-end">
            <span className="hidden sm:block">
              <SeedPicker />
            </span>
            <ThemeToggle />
            <AppsLauncher onTab={goTab} />
            <span className="hidden sm:block">
              <ContactButton />
            </span>
          </div>
        </div>
        <nav aria-label="Result types" className="mx-auto max-w-[1400px] px-4 lg:grid lg:grid-cols-[150px_minmax(0,692px)_1fr] lg:gap-x-4 lg:px-8">
          <div role="tablist" className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:col-start-2">
            {tabs.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => goTab(t.id)}
                  onKeyDown={(e) => {
                    const i = tabs.findIndex((x) => x.id === tab);
                    if (e.key === "ArrowRight") goTab(tabs[(i + 1) % tabs.length].id);
                    if (e.key === "ArrowLeft") goTab(tabs[(i - 1 + tabs.length) % tabs.length].id);
                  }}
                  tabIndex={active ? 0 : -1}
                  className={`state soft relative shrink-0 rounded-t-md px-3 pb-3 pt-3 text-[14px] ${active ? "font-medium text-primary" : "text-on-surface-variant"}`}
                >
                  {t.id === "ask" && <Icon name="sparkle" size={14} className="-mt-0.5 mr-1 inline text-[#9b72cb]" />}
                  {t.label}
                  {active && <motion.span layoutId="tab-underline" className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-primary" transition={spring.spatialFast} />}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-20 pt-5 lg:px-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.21, ease: [0.05, 0.7, 0.1, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.09 } }}
            style={{ originY: 0 }}
          >
            {tab === "all" || tab === "projects" ? (
              <div className="lg:grid lg:grid-cols-[150px_minmax(0,692px)_minmax(0,400px)] lg:gap-x-4 xl:gap-x-[72px]">
                <div className="lg:col-start-2">
                  <div className="lg:hidden">{tab === "all" && <KnowledgePanel compact />}</div>
                  <p className="mb-3 text-[14px] text-on-surface-variant" aria-live="polite">
                    About {hits.length} {hits.length === 1 ? "result" : "results"} ({formatSeconds(seconds)})
                  </p>
                  {tab === "all" && committed.answer && input === q && <AnswerBox kind={committed.answer} />}
                  {tab === "all" && !committed.answer && generic && <FeaturedSnippet />}

                  {hits.length === 0 && !committed.answer && <Empty query={input} onSuggest={submit} />}

                  <AnimatePresence mode="popLayout" initial={true}>
                    {hits.map((h, i) => (
                      <motion.div key={h.project.slug} layout="position" exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }} transition={spring.spatialDefault}>
                        <ResultBlock project={h.project} terms={live.filterTerms} index={i} />
                        {tab === "all" && i === 1 && <ImagesStrip onMore={() => goTab("images")} />}
                        {tab === "all" && i === Math.min(2, hits.length - 1) && <PeopleAlsoAsk onTab={goTab} />}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {tab === "all" && hits.length === 0 && <PeopleAlsoAsk onTab={goTab} />}

                  <Related onPick={submit} />
                </div>
                <div className="hidden lg:col-start-3 lg:block">{tab === "all" && <KnowledgePanel />}</div>
              </div>
            ) : tab === "images" ? (
              <ImagesTab />
            ) : tab === "journey" ? (
              <Journey />
            ) : tab === "skills" ? (
              <KeepBoard />
            ) : (
              <AskKaiuf />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer onBackToSearch={() => barRef.current?.focus()} />
    </div>
  );
}

function FeaturedSnippet() {
  return (
    <section aria-label="Who is Kaiuf?" className="mb-6 rounded-xl border border-outline p-5">
      <p className="text-[14px] text-on-surface-variant">Who is Kaiuf?</p>
      <p className="mt-2 text-[18px] leading-[1.55]">
        An <b className="font-semibold">engineer by curiosity and a builder by instinct</b>, who turns ambitious ideas into working prototypes, and isn&apos;t afraid to break them to find out why.
      </p>
      <p className="mt-3 text-[14px] text-on-surface-variant">
        <span className="font-mono">\ kai·uf \</span> <i>proper noun.</i> Syn: build, <b className="font-semibold text-on-surface">break</b>, rebuild.
      </p>
    </section>
  );
}

function Empty({ query, onSuggest }: { query: string; onSuggest: (q: string) => void }) {
  return (
    <div className="mb-6 py-6">
      <p className="text-[16px]">
        No results for &lsquo;<b>{query}</b>&rsquo;.
      </p>
      <p className="mt-2 text-[14px] text-on-surface-variant">
        Try{" "}
        {["projects", "ai", "contact"].map((s, i) => (
          <span key={s}>
            <button type="button" onClick={() => onSuggest(s === "contact" ? "contact kaiuf" : `kaiuf ${s}`)} className="font-medium text-link underline-offset-4 hover:underline">
              {s}
            </button>
            {i < 2 ? (i === 1 ? " or " : ", ") : "."}
          </span>
        ))}
      </p>
    </div>
  );
}

function Related({ onPick }: { onPick: (q: string) => void }) {
  return (
    <section aria-label="Related searches" className="mt-8">
      <h2 className="mb-3 text-[20px] font-normal">Related searches</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {relatedSearches.map((r) => (
          <button key={r} type="button" onClick={() => onPick(r)} className="state soft flex h-12 items-center gap-3 rounded-full bg-surface-container-high px-4 text-left text-[14px]">
            <Icon name="search" size={18} className="text-on-surface-variant" />
            <span className="truncate">
              {r.split(" ").map((w, i) => (i === 0 ? <span key={i}>{w} </span> : <b key={i} className="font-semibold">{w} </b>))}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-6 text-[12px] text-on-surface-variant">Results are hand-picked from {site.fullName}&apos;s work. No ads, no SEO spam.</p>
    </section>
  );
}
