'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { useOS } from './OSContext';
import { Logo } from '@/components/ui/BrandIcons';

export default function Toasts() {
  const { toasts, dismissToast } = useOS();
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-3 top-[52px] z-[9700] flex w-[min(360px,calc(100vw-24px))] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="group pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-card bg-surface-raised p-3.5 shadow-popover"
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-accent" />
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ctl text-ink shadow-[inset_0_0_0_1px_rgb(var(--ink)/0.14)]">
              {t.icon ?? <Logo className="h-4 w-auto" />}
            </span>
            <div className="min-w-0 flex-1 pr-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink">{t.title}</p>
              {t.body && <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{t.body}</p>}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="press absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-ctl text-ink-faint opacity-0 transition-opacity hover:bg-white/10 hover:text-ink group-hover:opacity-100 focus:opacity-100"
            >
              <X size={12} weight="bold" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
