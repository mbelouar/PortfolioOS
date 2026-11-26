'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CircleNotch } from '@phosphor-icons/react';
import { APPS } from '@/components/apps/registry';
import { Logo } from '@/components/ui/BrandIcons';
import { profile } from '@/data/portfolio';
import { useNow } from '@/lib/hooks';

const EASE = [0.22, 1, 0.36, 1] as const;

const BOOT = [
  'mounting /portfolio',
  ...APPS.slice(0, 6).map((a) => `loading ${a.index} ${a.name.toLowerCase()}`),
  'starting window server',
  'ready',
];

/**
 * Boot screen: the live blueprint wallpaper shows through a dim layer, with a serif clock,
 * a boot log that types itself out and one clear call to action. Slides away upward on entry.
 */
export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const now = useNow(1000);
  const [unlocking, setUnlocking] = useState(false);

  const unlock = useCallback(() => {
    if (unlocking) return;
    setUnlocking(true);
    window.setTimeout(onUnlock, 450);
  }, [unlocking, onUnlock]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key) || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      unlock();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unlock]);

  const time = now ? now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--';

  return (
    <motion.div
      key="lock"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: '-100%', transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] } }}
      transition={{ duration: 0.4 }}
      onClick={unlock}
      className="fixed inset-0 z-[10000] cursor-pointer select-none overflow-hidden bg-base/70"
    >
      {/* Bottom edge highlight visible while it slides away */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-accent" />

      <div className="relative mx-auto flex h-full max-w-[1200px] flex-col justify-between px-6 py-8 sm:px-12 sm:py-12">
        {/* Top row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-muted"
        >
          <span className="flex items-center gap-2.5">
            <Logo className="h-4 w-auto text-ink" />
            Portfolio OS
          </span>
          <span suppressHydrationWarning>
            {now?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) ?? ''}
          </span>
        </motion.div>

        {/* Clock + identity */}
        <div className="grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent"
            >
              Local time
            </motion.p>
            <h1 className="display overflow-hidden text-[30vw] leading-[0.82] text-ink tabular-nums md:text-[15vw]" suppressHydrationWarning>
              <motion.span className="inline-block" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.1, ease: EASE }}>
                {time}
              </motion.span>
            </h1>
          </div>

          {/* Boot log */}
          <ol className="hidden space-y-1 font-mono text-[11px] text-ink-faint md:block" aria-hidden>
            {BOOT.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.09 }}
                className="flex items-center gap-3"
              >
                <span className="text-ink-faint/60">[{(0.12 * (i + 1)).toFixed(2)}]</span>
                <span className={i === BOOT.length - 1 ? 'text-ok' : ''}>{line}</span>
                <span className="ml-auto text-ok">ok</span>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          className="flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.photo} alt="" className="h-14 w-14 rounded-full object-cover grayscale-[30%] ring-1 ring-line-strong" />
            <div>
              <p className="display text-[26px] leading-none text-ink">{profile.name}</p>
              <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{profile.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint sm:inline">Press any key</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                unlock();
              }}
              className="btn-primary group !px-5 !py-3"
            >
              {unlocking ? (
                <>
                  <CircleNotch size={16} weight="bold" className="animate-spin" />
                  Starting
                </>
              ) : (
                <>
                  Enter portfolio
                  <ArrowRight size={16} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
