"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { Icon } from "./Icon";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

function Header({ id, title, subtitle, onClose }: { id: string; title: ReactNode; subtitle?: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
      <div>
        <h2 id={id} className="font-display text-[22px] font-extrabold">{title}</h2>
        {subtitle && <div className="mt-0.5 text-sm text-muted">{subtitle}</div>}
      </div>
      <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-xl bg-paper transition hover:bg-line">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

/** Centered dialog with a blurred scrim and spring entrance. */
export function Modal({ open, onClose, title, subtitle, children, footer, className }: OverlayProps) {
  const id = useId();
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={cn("my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)]", className)}
          >
            <Header id={id} title={title} subtitle={subtitle} onClose={onClose} />
            <div className="px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper-2 px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Right-side sliding panel used for forms. */
export function Drawer({ open, onClose, title, subtitle, children, footer }: OverlayProps) {
  const id = useId();
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex justify-end bg-ink/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="flex h-full w-full max-w-lg flex-col bg-white"
          >
            <Header id={id} title={title} subtitle={subtitle} onClose={onClose} />
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
