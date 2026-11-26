'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Power, type Icon } from '@phosphor-icons/react';
import { APPS, type AppDef } from '@/components/apps/registry';
import AppIcon from '@/components/ui/AppIcon';
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons';
import { profile } from '@/data/portfolio';
import { useOS } from './OSContext';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Launcher: a vertical rail on the left edge on wide screens, a bottom tab strip on phones.
 * Running apps get an accent notch; the focused one lights up.
 */
export default function Dock({ mobile }: { mobile: boolean }) {
  const { windows, open, focus, focusedId, launchTick, lock } = useOS();

  const onActivate = (app: AppDef) => {
    const w = windows.find((x) => x.id === app.id);
    if (w && !w.minimized && focusedId !== app.id) focus(app.id);
    else open(app.id);
  };

  if (mobile) {
    const apps = APPS.filter((a) => a.id !== 'terminal');
    return (
      <motion.nav
        aria-label="Apps"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        className="fixed inset-x-0 bottom-0 z-[9000] border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      >
        <div className="scrollbar-none flex h-[76px] items-stretch gap-1 overflow-x-auto px-2">
          {apps.map((app) => {
            const running = windows.some((w) => w.id === app.id && !w.minimized);
            return (
              <button
                key={app.id}
                data-dock-id={app.id}
                onClick={() => onActivate(app)}
                className="press ripple-host relative flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-ctl text-ink"
              >
                <AppIcon icon={app.icon} size={36} active={running} />
                <span className={`max-w-[64px] truncate text-[10px] ${running ? 'text-accent' : 'text-ink-faint'}`}>{app.name}</span>
              </button>
            );
          })}
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav
      aria-label="Launcher"
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
      className="fixed bottom-0 left-0 top-[var(--bar-h)] z-[9000] flex w-[var(--rail-w)] flex-col items-center border-r border-line bg-surface/90 py-3 backdrop-blur-md"
    >
      <div className="scrollbar-none flex flex-1 flex-col items-center gap-1.5 overflow-y-auto">
        {APPS.map((app, i) => (
          <RailItem
            key={app.id}
            id={app.id}
            label={app.name}
            index={app.index}
            icon={app.icon}
            delay={0.25 + i * 0.035}
            running={windows.some((w) => w.id === app.id)}
            active={focusedId === app.id && windows.some((w) => w.id === app.id && !w.minimized)}
            bounceKey={launchTick?.id === app.id ? launchTick.n : 0}
            onClick={() => onActivate(app)}
          />
        ))}
      </div>
      <span aria-hidden className="my-2 h-px w-8 bg-line" />
      <div className="flex flex-col items-center gap-1.5">
        <RailItem id="github" label="GitHub" index="↗" icon={GithubIcon as unknown as Icon} href={profile.github} delay={0.7} />
        <RailItem id="linkedin" label="LinkedIn" index="↗" icon={LinkedinIcon as unknown as Icon} href={profile.linkedin} delay={0.74} />
        <RailItem id="lock" label="Lock screen" index="⌥L" icon={Power} onClick={lock} delay={0.78} />
      </div>
    </motion.nav>
  );
}

interface RailItemProps {
  id: string;
  label: string;
  index: string;
  icon: Icon;
  delay: number;
  running?: boolean;
  active?: boolean;
  bounceKey?: number;
  href?: string;
  onClick?: () => void;
}

function RailItem({ id, label, index, icon, delay, running, active, bounceKey = 0, href, onClick }: RailItemProps) {
  const [hover, setHover] = useState(false);
  const pop = useAnimationControls();

  useEffect(() => {
    if (bounceKey > 0) pop.start({ x: [0, 6, -2, 0], transition: { duration: 0.6, ease: 'easeOut' } });
  }, [bounceKey, pop]);

  const Tag = href ? motion.a : motion.button;
  const linkProps = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : { type: 'button' as const, onClick };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {/* Running notch */}
      <span
        aria-hidden
        className={`absolute -left-[14px] top-1/2 w-[3px] -translate-y-1/2 rounded-r-full bg-accent transition-all duration-300 ${
          active ? 'h-6 opacity-100' : running ? 'h-2 opacity-80' : 'h-0 opacity-0'
        }`}
      />
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(linkProps as any)}
        data-dock-id={id}
        aria-label={label}
        animate={pop}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        className="ripple-host flex rounded-[9px]"
      >
        <AppIcon icon={icon} size={44} active={active} />
      </Tag>
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="pointer-events-none absolute left-[56px] top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-ctl bg-surface-raised px-2.5 py-1.5 text-[12px] text-ink shadow-popover"
          >
            <span className="font-mono text-[10px] text-accent">{index}</span>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
