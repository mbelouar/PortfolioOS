'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, MagnifyingGlass } from '@phosphor-icons/react';
import { APPS, APP_MAP } from '@/components/apps/registry';
import { profile } from '@/data/portfolio';
import { Logo } from '@/components/ui/BrandIcons';
import { useIsMac, useIsMobile, useNow } from '@/lib/hooks';
import { useOS } from './OSContext';
import { MENU_H } from './Window';

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  checked?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface Menu {
  id: string;
  label: React.ReactNode;
  bold?: boolean;
  items: MenuItem[];
}

export default function MenuBar({ onShowShortcuts }: { onShowShortcuts: () => void }) {
  const os = useOS();
  const now = useNow(1000);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const mod = useIsMac() ? '⌘' : 'Ctrl+';
  const alt = mod === '⌘' ? '⌥' : 'Alt+';

  const focused = os.focusedId ? APP_MAP[os.focusedId] : null;
  const mobile = useIsMobile();

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(null);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  const menus: Menu[] = [
    {
      id: 'brand',
      label: (
        <span className="flex items-center gap-2">
          <Logo className="h-[16px] w-auto text-ink" />
          <span className="hidden font-mono text-[11px] tracking-[0.14em] text-ink lg:inline">M.BELOUARRAQ</span>
        </span>
      ),
      items: [
        { label: 'About This Portfolio', action: () => os.open('about') },
        { divider: true, label: '' },
        { label: 'Search…', shortcut: `${mod}K`, action: () => os.setSpotlightOpen(true) },
        { label: 'Keyboard Shortcuts', shortcut: '?', action: onShowShortcuts },
        { divider: true, label: '' },
        { label: 'Résumé — English', action: () => window.open(profile.cv.en.file, '_blank', 'noopener') },
        { label: 'CV — Français', action: () => window.open(profile.cv.fr.file, '_blank', 'noopener') },
        { divider: true, label: '' },
        { label: 'Lock Screen', shortcut: `${alt}L`, action: os.lock },
      ],
    },
    {
      id: 'app',
      bold: true,
      label: focused?.name ?? 'Portfolio',
      items: focused
        ? [
            { label: `About ${focused.name}`, disabled: true },
            { divider: true, label: '' },
            { label: `Hide ${focused.name}`, shortcut: `${alt}M`, action: () => os.minimize(focused.id) },
            { label: `Quit ${focused.name}`, shortcut: `${alt}W`, action: () => os.close(focused.id) },
          ]
        : [{ label: 'Open About Me', action: () => os.open('about') }],
    },
    {
      id: 'go',
      label: 'Go',
      items: APPS.map((a, i) => ({ label: a.name, shortcut: `${alt}${(i + 1) % 10}`, action: () => os.open(a.id) })),
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { label: 'Minimize', shortcut: `${alt}M`, disabled: !focused, action: () => focused && os.minimize(focused.id) },
        { label: 'Zoom', disabled: !focused, action: () => focused && os.toggleMaximize(focused.id) },
        { label: 'Close', shortcut: `${alt}W`, disabled: !focused, action: () => focused && os.close(focused.id) },
        { divider: true, label: '' },
        { label: 'Minimize All', disabled: !os.windows.length, action: os.minimizeAll },
        { label: 'Close All', disabled: !os.windows.length, action: os.closeAll },
        ...(os.windows.length ? [{ divider: true, label: '' } as MenuItem] : []),
        ...os.windows.map((w) => ({
          label: APP_MAP[w.id].name,
          checked: w.id === os.focusedId,
          action: () => os.open(w.id),
        })),
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Keyboard Shortcuts', shortcut: '?', action: onShowShortcuts },
        { label: 'Open Terminal', action: () => os.open('terminal') },
        { divider: true, label: '' },
        { label: 'Contact Mohammed', action: () => os.open('contact') },
      ],
    },
  ];

  return (
    <motion.header
      ref={barRef}
      initial={{ y: -MENU_H }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-[9500] flex items-center justify-between border-b border-line bg-surface/95 pl-3 pr-2 text-[13px] text-ink/90 backdrop-blur-md"
      style={{ height: MENU_H }}
    >
      <nav className="flex items-center gap-0.5" aria-label="Menu bar">
        {menus.map((m, i) => (
          <div key={m.id} className={`relative ${i > 1 ? 'hidden sm:block' : ''} ${i === 0 ? 'mr-2' : ''}`}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={openMenu === m.id}
              onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
              onPointerEnter={() => openMenu && openMenu !== m.id && setOpenMenu(m.id)}
              className={`press relative flex h-7 items-center rounded-ctl px-2.5 transition-colors duration-150 ${
                openMenu === m.id ? 'bg-white/[0.08] text-ink' : 'text-ink-muted hover:bg-white/[0.05] hover:text-ink'
              } ${m.bold ? 'font-medium !text-ink' : ''}`}
            >
              {m.label}
              {openMenu === m.id && <motion.span layoutId="menu-underline" className="absolute inset-x-2 -bottom-[7px] h-[2px] bg-accent" />}
            </button>
            <AnimatePresence>
              {openMenu === m.id && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -6, clipPath: 'inset(0 0 100% 0)' }}
                  animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-[34px] min-w-[240px] rounded-card bg-surface-raised p-1.5 shadow-popover"
                >
                  {m.items.map((it, j) =>
                    it.divider ? (
                      <div key={j} className="mx-2 my-1.5 h-px bg-line" />
                    ) : (
                      <motion.button
                        key={j}
                        role="menuitem"
                        disabled={it.disabled}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.02 * j }}
                        onClick={() => {
                          setOpenMenu(null);
                          it.action?.();
                        }}
                        className="group flex w-full items-center gap-2 rounded-ctl px-2 py-[6px] text-left text-[13px] text-ink/90 transition-colors hover:bg-accent hover:text-[#170a03] disabled:pointer-events-none disabled:text-ink/30"
                      >
                        <span className="flex w-3 justify-center">{it.checked && <Check size={12} weight="bold" />}</span>
                        <span className="flex-1">{it.label}</span>
                        {it.shortcut && <span className="font-mono text-[10.5px] text-ink-faint group-hover:text-[#170a03]/70">{it.shortcut}</span>}
                      </motion.button>
                    ),
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2 text-ink-muted">
        <button
          type="button"
          onClick={() => os.setSpotlightOpen(true)}
          aria-label="Search"
          className="press ripple-host flex h-7 items-center gap-2 rounded-ctl px-2.5 text-ink-muted shadow-[inset_0_0_0_1px_rgb(var(--ink)/0.12)] transition-[color,box-shadow] hover:text-ink hover:shadow-[inset_0_0_0_1px_rgb(var(--ink)/0.3)] sm:w-56"
        >
          <MagnifyingGlass size={14} weight="bold" />
          <span className="hidden text-[12px] sm:inline">Search portfolio</span>
          <kbd className="ml-auto hidden sm:inline-flex">{mod === '⌘' ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
        {!mobile && (
          <span className="hidden items-center gap-2 border-l border-line pl-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint md:flex">
            <span className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-ok" />
            Available
          </span>
        )}
        <span className="border-l border-line pl-3 pr-1 font-mono text-[11.5px] tabular-nums text-ink" suppressHydrationWarning>
          {now
            ? (
                <>
                  <span className="hidden text-ink-faint sm:inline">
                    {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}&nbsp;&nbsp;
                  </span>
                  {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </>
              )
            : null}
        </span>
      </div>
    </motion.header>
  );
}
