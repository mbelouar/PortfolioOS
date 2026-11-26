'use client';

import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import { Keyboard, X } from '@phosphor-icons/react';
import { useIsMac } from '@/lib/hooks';

export default function ShortcutsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mac = useIsMac();
  const mod = mac ? '⌘' : 'Ctrl';
  const alt = mac ? '⌥' : 'Alt';

  const groups: { title: string; items: [string[], string][] }[] = [
    {
      title: 'Navigation',
      items: [
        [[mod, 'K'], 'Spotlight search'],
        [[alt, '1–0'], 'Open an app'],
        [['?'], 'Show this sheet'],
        [['esc'], 'Close menus & overlays'],
      ],
    },
    {
      title: 'Windows',
      items: [
        [[alt, 'W'], 'Close focused window'],
        [[alt, 'M'], 'Minimize focused window'],
        [['Double-click title'], 'Zoom / restore'],
        [[alt, 'L'], 'Lock screen'],
      ],
    },
    {
      title: 'Terminal',
      items: [
        [['Tab'], 'Autocomplete'],
        [['↑', '↓'], 'Command history'],
        [['Ctrl', 'L'], 'Clear screen'],
      ],
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <Overlay onClose={onClose}>
          <motion.div
            role="dialog"
            aria-label="Keyboard shortcuts"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 460, damping: 34 }}
            className="relative w-full max-w-[600px] rounded-win bg-surface p-7 shadow-popover"
          >
            <button onClick={onClose} aria-label="Close" className="btn-icon absolute right-5 top-5 !h-8 !w-8">
              <X size={14} weight="bold" />
            </button>
            <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-accent"><Keyboard size={14} /> Reference</p>
            <h2 className="display mt-2 text-[40px] leading-none">Keyboard shortcuts</h2>
            <p className="mt-2 text-sm text-ink-muted">Get around without lifting your hands.</p>
            <div className="mt-7 grid gap-7 sm:grid-cols-2">
              {groups.map((g) => (
                <div key={g.title} className={g.title === 'Terminal' ? 'sm:col-span-2' : ''}>
                  <p className="eyebrow mb-3 border-b border-line pb-2">{g.title}</p>
                  <ul className="space-y-2">
                    {g.items.map(([keys, label]) => (
                      <li key={label} className="flex items-center justify-between gap-3 text-[13px]">
                        <span className="text-ink-muted">{label}</span>
                        <span className="flex gap-1">
                          {keys.map((k) => (
                            <kbd key={k}>
                              {k}
                            </kbd>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const present = useIsPresent();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9800] flex items-center justify-center bg-base/75 p-4"
      style={{ pointerEvents: present ? 'auto' : 'none' }}
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </motion.div>
  );
}
