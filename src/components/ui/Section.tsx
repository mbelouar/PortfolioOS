'use client';

import React, { createContext, useContext, useId, type RefObject } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

/** The scrolling element of the window an app is rendered in (for scroll-triggered reveals). */
export const ScrollRootContext = createContext<RefObject<HTMLElement | null> | null>(null);

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
  y = 18,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
  y?: number;
}) {
  const root = useContext(ScrollRootContext);
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, root: root ?? undefined }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/** Editorial page header: index number, serif title, mono rule. */
export function AppHeader({
  eyebrow,
  title,
  subtitle,
  index,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  index?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-10">
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="mb-5 flex origin-left items-center gap-3 border-b border-line pb-3"
      >
        {index && <span className="label-num">{index}</span>}
        <span className="eyebrow">{eyebrow}</span>
      </motion.div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="display overflow-hidden text-[44px] leading-[0.95] text-ink sm:text-[64px]">
            <motion.span
              className="inline-block"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
            >
              {title}
            </motion.span>
          </h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        {children && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
            {children}
          </motion.div>
        )}
      </div>
    </header>
  );
}

export function SectionTitle({ children, aside, index }: { children: React.ReactNode; aside?: React.ReactNode; index?: string }) {
  return (
    <div className="mb-4 mt-12 flex items-center gap-3">
      {index && <span className="label-num">{index}</span>}
      <h2 className="eyebrow !text-ink-muted">{children}</h2>
      <span aria-hidden className="h-px flex-1 bg-line" />
      {aside}
    </div>
  );
}

/** Tab strip with a sliding accent underline. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <div role="tablist" className="inline-flex gap-1 border-b border-line">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={`press relative whitespace-nowrap px-3 pb-2.5 pt-1.5 text-[13px] transition-colors duration-200 ${
              on ? 'text-ink' : 'text-ink-faint hover:text-ink-muted'
            }`}
          >
            {o.label}
            {o.count !== undefined && <span className="ml-1.5 font-mono text-[10px] text-ink-faint">{o.count}</span>}
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-x-2 -bottom-px h-[2px] bg-accent"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Empty / no-results state drawn as a blueprint placeholder. */
export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="blueprint-frame flex flex-col items-center gap-3 rounded-card px-6 py-14 text-center"
    >
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden className="text-ink-faint">
        <rect x="8.5" y="8.5" width="39" height="39" rx="3" stroke="currentColor" strokeDasharray="3 3" />
        <path d="M28 2v12M28 42v12M2 28h12M42 28h12" stroke="rgb(var(--accent))" strokeWidth="1.5" />
        <circle cx="28" cy="28" r="5" stroke="rgb(var(--accent))" strokeWidth="1.5" />
      </svg>
      <p className="display text-2xl text-ink">{title}</p>
      {body && <p className="max-w-xs text-[13px] text-ink-muted">{body}</p>}
      {action}
    </motion.div>
  );
}
