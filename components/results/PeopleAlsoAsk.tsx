"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useId, useState } from "react";
import { peopleAlsoAsk } from "@/content/site";
import { spring } from "@/lib/motion";
import { Icon } from "@/components/Icon";
import { useCompose } from "@/components/providers/Compose";

export function PeopleAlsoAsk({ onTab }: { onTab: (tab: "skills") => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const compose = useCompose();
  const id = useId();

  return (
    <section aria-labelledby={`${id}-h`} className="my-6">
      <h2 id={`${id}-h`} className="mb-2 text-[20px] font-normal">
        People also ask
      </h2>
      <div className="divide-y divide-outline border-y border-outline">
        {peopleAlsoAsk.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <h3>
                <button
                  type="button"
                  id={`${id}-b${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${id}-p${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="state flex min-h-12 w-full items-center gap-3 rounded-sm py-3 text-left text-[16px]"
                >
                  <span className="flex-1">{f.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={spring.spatialFast} className="grid h-8 w-8 place-items-center text-on-surface-variant">
                    <Icon name="chevronDown" size={22} />
                  </motion.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`${id}-p${i}`}
                    role="region"
                    aria-labelledby={`${id}-b${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: spring.spatialDefault, opacity: spring.effectsDefault }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 text-[14px] leading-[1.6] text-on-surface-variant">
                      <p className="text-on-surface">{f.a}</p>
                      {f.action === "compose" && (
                        <button type="button" onClick={(e) => compose.open({ origin: e.currentTarget })} className="mt-3 text-[14px] font-medium text-primary underline-offset-4 hover:underline">
                          Open compose
                        </button>
                      )}
                      {f.action === "rgu" && (
                        <Link href="/projects/rgu-ai-assistant" className="mt-3 inline-block text-[14px] font-medium text-primary underline-offset-4 hover:underline">
                          Read the case study
                        </Link>
                      )}
                      {f.action === "skills" && (
                        <button type="button" onClick={() => onTab("skills")} className="mt-3 text-[14px] font-medium text-primary underline-offset-4 hover:underline">
                          See all skills
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
