'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, MotionConfig, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { IconContext } from '@phosphor-icons/react';
import { useRipples } from '@/components/ui/Ripple';
import { APP_MAP } from '@/components/apps/registry';
import { useCoarsePointer, useIsMac, useIsMobile, useViewport } from '@/lib/hooks';
import Backdrop from './Backdrop';
import DesktopHome from './DesktopHome';
import Dock from './Dock';
import LockScreen from './LockScreen';
import MenuBar from './MenuBar';
import { OSProvider, useOS, type AppId } from './OSContext';
import ShortcutsSheet from './ShortcutsSheet';
import Spotlight from './Spotlight';
import Toasts from './Toasts';
import Window from './Window';

const SESSION_KEY = 'portfolio-os:unlocked';
const noopSubscribe = () => () => {};
const readUnlocked = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
};
const APP_ORDER: AppId[] = ['about', 'projects', 'skills', 'experience', 'community', 'journal', 'certifications', 'contact', 'terminal', 'resume'];

export default function Desktop() {
  // Whether this tab was already unlocked (null during SSR/hydration, so the lock screen never flashes on reload).
  const storedUnlocked = useSyncExternalStore(noopSubscribe, readUnlocked, () => null);
  const [override, setLocked] = useState<boolean | null>(null);
  const locked = override ?? (storedUnlocked === null ? null : !storedUnlocked);

  const lock = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    setLocked(true);
  }, []);

  const unlock = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {}
    setLocked(false);
  }, []);

  useRipples();

  return (
    <MotionConfig reducedMotion="user">
      <IconContext.Provider value={{ weight: 'regular', size: 16, mirrored: false }}>
        <OSProvider onLock={lock}>
          <Wallpaper locked={locked !== false} />
          {locked === false && <Shell />}
          <AnimatePresence>{locked && <LockScreen onUnlock={unlock} />}</AnimatePresence>
        </OSProvider>
      </IconContext.Provider>
    </MotionConfig>
  );
}

function Wallpaper({ locked }: { locked: boolean }) {
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const x = useTransform(sx, (v) => v * -18);
  const y = useTransform(sy, (v) => v * -12);

  useEffect(() => {
    if (coarse || reduced) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [coarse, reduced, mx, my]);

  return (
    <div aria-hidden className="fixed inset-0 overflow-hidden bg-base">
      <motion.div className="absolute -inset-8" style={{ x, y }}>
        <Backdrop />
      </motion.div>
      {!locked && <RegistrationMarks />}
    </div>
  );
}

/** Print-style crop marks and coordinates framing the desktop. */
function RegistrationMarks() {
  const mark = 'absolute h-5 w-5 border-ink/25';
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      <span className={`${mark} left-[calc(var(--rail-w)+16px)] top-[calc(var(--bar-h)+16px)] border-l border-t`} />
      <span className={`${mark} right-4 top-[calc(var(--bar-h)+16px)] border-r border-t`} />
      <span className={`${mark} bottom-4 left-[calc(var(--rail-w)+16px)] border-b border-l`} />
      <span className={`${mark} bottom-4 right-4 border-b border-r`} />
      <span className="absolute right-11 top-[calc(var(--bar-h)+18px)] font-mono text-[10px] tracking-[0.2em] text-ink/30">33.57°N 7.59°W</span>
    </div>
  );
}

function Shell() {
  const os = useOS();
  const viewport = useViewport();
  const mobile = useIsMobile();
  const mac = useIsMac();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Welcome notification (once per session).
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem('portfolio-os:welcomed') === '1';
      sessionStorage.setItem('portfolio-os:welcomed', '1');
    } catch {}
    // The mobile home screen is self-explanatory; a toast there would cover the hero.
    if (seen || window.matchMedia('(max-width: 767px)').matches) return;
    const t = window.setTimeout(
      () =>
        os.notify({
          title: 'Welcome aboard',
          body: `Press ${mac ? '⌘K' : 'Ctrl+K'} to search anything, or pick an app from the launcher.`,
        }),
      900,
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest('input, textarea, [contenteditable="true"]');

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        os.setSpotlightOpen(!os.spotlightOpen);
        return;
      }
      if (e.altKey && !e.metaKey && !e.ctrlKey) {
        const digit = /^Digit([0-9])$/.exec(e.code);
        if (digit) {
          e.preventDefault();
          // ⌥1…⌥9 open apps 1–9, ⌥0 opens the 10th.
          const n = Number(digit[1]);
          os.open(APP_ORDER[n === 0 ? 9 : n - 1]);
          return;
        }
        if (e.code === 'KeyW' && os.focusedId) {
          e.preventDefault();
          os.close(os.focusedId);
          return;
        }
        if (e.code === 'KeyM' && os.focusedId) {
          e.preventDefault();
          os.minimize(os.focusedId);
          return;
        }
        if (e.code === 'KeyL') {
          e.preventDefault();
          os.lock();
          return;
        }
      }
      if (e.key === '?' && !typing) {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
      }
      if (e.key === 'Escape') setShortcutsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [os]);

  return (
    <>
      <MenuBar onShowShortcuts={() => setShortcutsOpen(true)} />
      <DesktopHome mobile={mobile} />

      {viewport && (
        <AnimatePresence>
          {os.windows.map((w) => (
            <Window
              key={w.id}
              win={w}
              def={APP_MAP[w.id]}
              focused={os.focusedId === w.id}
              viewport={viewport}
              mobile={mobile}
            />
          ))}
        </AnimatePresence>
      )}

      <Dock mobile={mobile} />
      <Toasts />
      <Spotlight />
      <ShortcutsSheet open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  );
}
