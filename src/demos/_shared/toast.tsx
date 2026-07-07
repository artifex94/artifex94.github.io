import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

// Lightweight toast for the demos — no external dependency. A module-level
// pub/sub lets any demo call showToast() without a provider; each demo mounts
// one <DemoToaster/> (like it mounts <DemoBadge/>).

interface ToastItem {
  id: number;
  message: string;
}

let nextId = 1;
const listeners = new Set<(items: ToastItem[]) => void>();
let items: ToastItem[] = [];

const emit = () => listeners.forEach((l) => l(items));

// Imperative helper co-located with its <DemoToaster/>. HMR-only lint rule
// doesn't apply to a demo utility shared by six pages.
// eslint-disable-next-line react-refresh/only-export-components
export const showToast = (message: string) => {
  const id = nextId++;
  items = [...items, { id, message }];
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 2600);
};

export const DemoToaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>(items);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-lg border border-white/10 bg-neutral-900/95 px-4 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur"
            role="status"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
};
