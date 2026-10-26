"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { spring } from "@/lib/motion";
import { Icon } from "@/components/Icon";

type Snack = { id: number; message: string; actionLabel?: string; onAction?: () => void; duration?: number };
type Ctx = { show: (s: Omit<Snack, "id">) => void; dismiss: () => void };

const SnackCtx = createContext<Ctx | null>(null);
export const useSnackbar = () => useContext(SnackCtx)!;

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snack, setSnack] = useState<Snack | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const dismiss = useCallback(() => setSnack(null), []);
  const show = useCallback((s: Omit<Snack, "id">) => setSnack({ ...s, id: ++seq.current }), []);

  useEffect(() => {
    if (!snack) return;
    timer.current = setTimeout(dismiss, snack.duration ?? 5000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [snack, dismiss]);

  return (
    <SnackCtx.Provider value={{ show, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[80] flex sm:right-auto" role="status" aria-live="polite">
        <AnimatePresence>
          {snack && (
            <motion.div
              key={snack.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => Math.abs(info.offset.x) > 80 && dismiss()}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0, transition: { duration: 0.15 } }}
              transition={spring.spatialDefault}
              className="pointer-events-auto flex min-h-12 w-full max-w-[560px] items-center gap-2 rounded-sm bg-[#303134] py-1.5 pl-4 pr-2 text-[14px] text-[#e8eaed] shadow-float sm:w-auto sm:min-w-[344px]"
            >
              <span className="flex-1 py-1.5">{snack.message}</span>
              {snack.actionLabel && (
                <button
                  className="state rounded-full px-3 py-2 text-[14px] font-medium text-[#8ab4f8]"
                  onClick={() => {
                    snack.onAction?.();
                    dismiss();
                  }}
                >
                  {snack.actionLabel}
                </button>
              )}
              <button aria-label="Dismiss" className="state grid h-9 w-9 place-items-center rounded-full" onClick={dismiss}>
                <Icon name="close" size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SnackCtx.Provider>
  );
}
