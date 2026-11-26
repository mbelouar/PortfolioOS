'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CircleNotch, MapPin } from '@phosphor-icons/react';
import { APPS } from '@/components/apps/registry';
import { Logo } from '@/components/ui/BrandIcons';
import { profile, skillCategories } from '@/data/portfolio';
import { useNow } from '@/lib/hooks';

const EASE = [0.22, 1, 0.36, 1] as const;

const BOOT = ['mount /portfolio', ...APPS.slice(0, 5).map((a) => `load ${a.index} ${a.name.toLowerCase()}`), 'start window server'];
const STACK = skillCategories.flatMap((c) => c.skills.map((s) => s.name)).slice(0, 22);

/**
 * Boot / lock screen. The live blueprint wallpaper shows through a dim veil; a huge serif
 * clock with rolling digits sits opposite an identity plate holding the boot log and the
 * call to action. A stack marquee runs along the bottom. Slides away upward on entry.
 */
export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const now = useNow(1000);
  const [unlocking, setUnlocking] = useState(false);

  const unlock = useCallback(() => {
    if (unlocking) return;
    setUnlocking(true);
    window.setTimeout(onUnlock, 500);
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

  const hh = now ? String(now.getHours()).padStart(2, '0') : '--';
  const mm = now ? String(now.getMinutes()).padStart(2, '0') : '--';
  const ss = now ? String(now.getSeconds()).padStart(2, '0') : '--';
  const weekday = now?.toLocaleDateString('en-US', { weekday: 'long' }) ?? '';
  const date = now?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) ?? '';

  return (
    <motion.div
      key="lock"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      transition={{ duration: 0.5 }}
      onClick={unlock}
      className="fixed inset-0 z-[10000] cursor-pointer select-none overflow-hidden"
    >
      {/* Veil: dims the wallpaper and pools warm light behind the clock */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 28% 48%, rgb(var(--accent) / 0.11), transparent 70%), linear-gradient(180deg, rgb(var(--base) / 0.55), rgb(var(--base) / 0.78))',
        }}
      />
      {/* Accent edge that trails the screen as it slides away */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-accent shadow-[0_0_24px_rgb(var(--accent))]" />

      <div className="relative flex h-full flex-col">
        {/* Top rail */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center justify-between border-b border-line px-6 py-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-muted sm:px-10"
        >
          <span className="flex items-center gap-3">
            <Logo className="h-[18px] w-auto text-ink" />
            <span className="text-ink">Portfolio OS</span>
            <span className="hidden text-ink-faint sm:inline">/ {new Date().getFullYear()} edition</span>
          </span>
          <span className="hidden items-center gap-2 md:flex">
            <MapPin size={12} weight="bold" className="text-accent" />
            {profile.location} · 33.57°N 7.59°W
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-ok" />
            System ready
          </span>
        </motion.header>

        {/* Stage */}
        <div className="mx-auto grid w-full max-w-[1280px] flex-1 items-center gap-10 px-6 py-8 sm:px-10 lg:grid-cols-12">
          {/* Clock */}
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted"
            >
              <span className="text-accent">(00)</span> Local time
              <span className="h-px w-12 bg-line-strong" />
              <span className="tabular-nums text-ink-faint" suppressHydrationWarning>
                {ss}s
              </span>
            </motion.p>

            <h1
              className="display mt-3 flex items-baseline leading-[0.8] text-ink tabular-nums"
              style={{ fontSize: 'clamp(120px, 19vw, 300px)' }}
              aria-label={`${hh}:${mm}`}
              suppressHydrationWarning
            >
              <motion.span className="flex overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.1, ease: EASE }}>
                <Digits value={hh} />
              </motion.span>
              <motion.span
                aria-hidden
                className="mx-[0.02em] -translate-y-[0.06em] text-accent"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                :
              </motion.span>
              <motion.span className="flex overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.2, ease: EASE }}>
                <Digits value={mm} />
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
              className="display mt-5 text-[clamp(26px,3vw,40px)] leading-none text-ink-muted"
              suppressHydrationWarning
            >
              <span className="italic text-ink">{weekday}</span>
              {weekday && ', '}
              {date}
            </motion.p>
          </div>

          {/* Identity plate */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative cursor-default rounded-win bg-surface/90 p-6 backdrop-blur-md lg:col-span-5 lg:justify-self-end lg:w-full lg:max-w-[440px] sm:p-7"
            style={{ boxShadow: 'inset 0 0 0 1px rgb(var(--ink) / 0.12), 0 50px 120px -30px rgb(0 0 0 / 0.9)' }}
          >
            {/* Corner registration marks */}
            <span aria-hidden className="absolute -left-px -top-px h-4 w-4 rounded-tl-win border-l-2 border-t-2 border-accent" />
            <span aria-hidden className="absolute -bottom-px -right-px h-4 w-4 rounded-br-win border-b-2 border-r-2 border-accent" />
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <motion.span
                  aria-hidden
                  className="absolute -inset-[5px] rounded-full"
                  style={{ background: 'conic-gradient(from 0deg, rgb(var(--accent)), transparent 40%, rgb(var(--accent)) 100%)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />
                <span aria-hidden className="absolute -inset-[3px] rounded-full bg-surface" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.photo} alt="" className="relative h-[72px] w-[72px] rounded-full object-cover" />
                <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-surface bg-ok" />
              </div>
              <div className="min-w-0">
                <p className="display text-[32px] leading-[0.95] text-ink">
                  {profile.name.split(' ')[0]} <span className="italic">{profile.name.split(' ').slice(1).join(' ')}</span>
                </p>
                <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">{profile.role}</p>
                <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ok">{profile.availability}</p>
              </div>
            </div>

            {/* boot.log */}
            <div className="mt-6 overflow-hidden rounded-card bg-surface-sunken shadow-[inset_0_0_0_1px_rgb(var(--ink)/0.08)]">
              <div className="flex items-center justify-between border-b border-line px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                <span>boot.log</span>
                <span className="text-accent">{APPS.length} apps</span>
              </div>
              <ol className="space-y-1 px-3.5 py-3 font-mono text-[11px] text-ink-faint" aria-hidden>
                {BOOT.map((line, i) => (
                  <motion.li
                    key={line}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-ink-faint/60 tabular-nums">{(0.14 * (i + 1)).toFixed(2)}</span>
                    <span className="text-ink-muted">{line}</span>
                    <span className="ml-auto text-ok">ok</span>
                  </motion.li>
                ))}
              </ol>
              <div className="h-[2px] bg-line">
                <motion.div
                  className="h-full origin-left bg-accent shadow-[0_0_12px_rgb(var(--accent))]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6 + BOOT.length * 0.1, delay: 0.5, ease: [0.65, 0, 0.35, 1] }}
                />
              </div>
            </div>

            <button type="button" onClick={unlock} className="btn-primary group mt-6 w-full !justify-between !px-5 !py-4 text-[14px]">
              <AnimatePresence mode="wait" initial={false}>
                {unlocking ? (
                  <motion.span key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                    <CircleNotch size={16} weight="bold" className="animate-spin" />
                    Starting session
                  </motion.span>
                ) : (
                  <motion.span key="e" exit={{ opacity: 0, y: -8 }}>
                    Enter portfolio
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#170a03]/15 transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight size={15} weight="bold" />
              </span>
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              or press <kbd>any key</kbd>
            </p>
          </motion.section>
        </div>

        {/* Stack marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative overflow-hidden border-t border-line py-3.5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
          aria-hidden
        >
          <div className="flex w-max animate-marquee motion-reduce:animate-none">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {STACK.map((s) => (
                  <span key={`${k}-${s}`} className="flex items-center gap-6 pr-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                    {s}
                    <span className="h-1 w-1 rotate-45 bg-accent" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Each digit rolls up when it changes. */
function Digits({ value }: { value: string }) {
  return (
    <>
      {value.split('').map((d, i) => (
        <span key={i} className="relative inline-block overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={d}
              className="inline-block"
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {d}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </>
  );
}
