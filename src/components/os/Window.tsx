'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useAnimate, useDragControls, useIsPresent, useMotionValue, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, CornersIn, CornersOut, Minus, X } from '@phosphor-icons/react';
import { APPS, type AppDef } from '@/components/apps/registry';
import { ScrollRootContext } from '@/components/ui/Section';
import { useOS, type WinState } from './OSContext';

/** Height of the top status bar. */
export const MENU_H = 40;
/** Width of the launcher rail on wide screens. */
export const RAIL_W = 72;
const MOBILE_TAB_SPACE = 76;
const MIN_W = 400;
const MIN_H = 300;
const SPRING = { type: 'spring', stiffness: 420, damping: 40, mass: 0.9 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

interface Geometry {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface WindowProps {
  win: WinState;
  def: AppDef;
  focused: boolean;
  viewport: { w: number; h: number };
  mobile: boolean;
}

function initialGeometry(def: AppDef, slot: number, vp: { w: number; h: number }): Geometry {
  const left = RAIL_W + 24;
  const w = Math.min(def.size.w, vp.w - left - 24);
  const h = Math.min(def.size.h, vp.h - MENU_H - 48);
  const cascade = (slot % 6) * 28;
  const x = Math.round(Math.min(Math.max(left, left + (vp.w - left - w) / 2 - 60 + cascade), vp.w - w - 16));
  const y = Math.round(Math.max(MENU_H + 20, MENU_H + (vp.h - MENU_H - h) / 2 - 10 + cascade));
  return { x, y, w, h };
}

function clampGeometry(g: Geometry, vp: { w: number; h: number }): Geometry {
  const w = Math.min(Math.max(g.w, MIN_W), vp.w - RAIL_W - 16);
  const h = Math.min(Math.max(g.h, MIN_H), vp.h - MENU_H - 16);
  const x = Math.min(Math.max(g.x, -w + 120), vp.w - 120);
  const y = Math.min(Math.max(g.y, MENU_H), vp.h - 60);
  return { x, y, w, h };
}

export default function Window({ win, def, focused, viewport, mobile }: WindowProps) {
  const { close, focus, minimize, toggleMaximize, open } = useOS();
  const dragControls = useDragControls();
  const present = useIsPresent();
  const [scope, animateInner] = useAnimate<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  // Bare apps (terminal, PDF viewer) scroll themselves, so only track the shared container.
  const { scrollYProgress } = useScroll(def.bare ? {} : { container: scrollRef });
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40 });

  const [initial] = useState(() => initialGeometry(def, win.slot, viewport));
  const saved = useRef<Geometry>(initial);
  const x = useMotionValue(initial.x);
  const y = useMotionValue(initial.y);
  const w = useMotionValue(initial.w);
  const h = useMotionValue(initial.h);
  const zoomed = win.maximized || mobile;
  const wasZoomed = useRef(zoomed);

  // Zoom / restore / viewport changes: spring the frame to its target geometry.
  useEffect(() => {
    if (zoomed && !wasZoomed.current && !mobile) {
      saved.current = { x: x.get(), y: y.get(), w: w.get(), h: h.get() };
    }
    wasZoomed.current = zoomed;
    const target: Geometry = mobile
      ? { x: 0, y: MENU_H, w: viewport.w, h: viewport.h - MENU_H - MOBILE_TAB_SPACE }
      : zoomed
        ? { x: RAIL_W, y: MENU_H, w: viewport.w - RAIL_W, h: viewport.h - MENU_H }
        : clampGeometry(saved.current, viewport);
    const controls = [animate(x, target.x, SPRING), animate(y, target.y, SPRING), animate(w, target.w, SPRING), animate(h, target.h, SPRING)];
    return () => controls.forEach((c) => c.stop());
  }, [zoomed, mobile, viewport, x, y, w, h]);

  // Open (page transition in), minimise into the launcher tile, restore.
  const firstRun = useRef(true);
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    if (firstRun.current) {
      firstRun.current = false;
      if (mobile) {
        animateInner(el, { opacity: [0, 1], y: [60, 0] }, { duration: 0.5, ease: EASE });
      } else {
        animateInner(el, { opacity: [0, 1], scale: [0.94, 1], y: [18, 0] }, { type: 'spring', stiffness: 380, damping: 32 });
      }
      return;
    }
    if (win.minimized) {
      const icon = document.querySelector(`[data-dock-id="${win.id}"]`)?.getBoundingClientRect();
      const frame = el.getBoundingClientRect();
      const dx = icon ? icon.left + icon.width / 2 - (frame.left + frame.width / 2) : 0;
      const dy = icon ? icon.top + icon.height / 2 - (frame.top + frame.height / 2) : viewport.h;
      animateInner(el, { x: dx, y: dy, scale: 0.06, opacity: 0 }, { duration: 0.45, ease: [0.6, 0, 0.4, 1] });
    } else {
      animateInner(el, { x: 0, y: 0, scale: 1, opacity: 1 }, { duration: 0.45, ease: EASE });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.minimized]);

  const onTitlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (!zoomed) dragControls.start(e);
  };

  const onDragEnd = () => {
    saved.current = { x: x.get(), y: y.get(), w: w.get(), h: h.get() };
  };

  const startResize = (e: React.PointerEvent, dir: 'r' | 'b' | 'rb') => {
    e.preventDefault();
    e.stopPropagation();
    const start = { px: e.clientX, py: e.clientY, w: w.get(), h: h.get() };
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = dir === 'r' ? 'ew-resize' : dir === 'b' ? 'ns-resize' : 'nwse-resize';
    const move = (ev: PointerEvent) => {
      if (dir !== 'b') w.set(Math.min(Math.max(MIN_W, start.w + ev.clientX - start.px), viewport.w - x.get() - 4));
      if (dir !== 'r') h.set(Math.min(Math.max(MIN_H, start.h + ev.clientY - start.py), viewport.h - y.get() - 4));
    };
    const up = () => {
      document.body.style.cursor = prevCursor;
      saved.current = { x: x.get(), y: y.get(), w: w.get(), h: h.get() };
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const Content = def.component;
  const Icon = def.icon;
  const nextApp = APPS[(APPS.findIndex((a) => a.id === def.id) + 1) % APPS.length];

  return (
    <motion.section
      role="dialog"
      aria-label={def.name}
      aria-hidden={win.minimized || undefined}
      drag={!zoomed}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.06}
      dragConstraints={{ left: -w.get() + 120, right: viewport.w - 120, top: MENU_H, bottom: viewport.h - 60 }}
      onDragEnd={onDragEnd}
      onPointerDownCapture={() => focus(win.id)}
      exit={mobile ? { opacity: 0, y: 40, transition: { duration: 0.25, ease: EASE } } : { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.2, ease: EASE } }}
      className="fixed left-0 top-0 will-change-transform"
      style={{ x, y, width: w, height: h, zIndex: win.z, pointerEvents: win.minimized || !present ? 'none' : 'auto' }}
    >
      <div
        ref={scope}
        className={`relative flex h-full flex-col overflow-hidden bg-surface transition-[border-radius,box-shadow] duration-500 ${
          zoomed ? 'rounded-none' : 'rounded-win'
        } ${focused ? 'shadow-window' : 'shadow-window-inactive'}`}
        style={{ transformOrigin: '50% 50%' }}
      >
        {/* Hairline frame; lights up in the accent when focused */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-30 rounded-[inherit] transition-shadow duration-500 ${
            focused ? 'shadow-[inset_0_0_0_1px_rgb(var(--ink)/0.16)]' : 'shadow-[inset_0_0_0_1px_rgb(var(--ink)/0.08)]'
          }`}
        />

        {/* Title bar: index + name on the left, square controls on the right. Condenses on scroll. */}
        <div
          onPointerDown={onTitlePointerDown}
          onDoubleClick={(e) => {
            if (!mobile && !(e.target as HTMLElement).closest('button')) toggleMaximize(win.id);
          }}
          className={`relative z-20 flex h-11 shrink-0 select-none items-center gap-3 px-3 transition-[background-color,border-color] duration-300 ${
            zoomed ? '' : 'cursor-grab active:cursor-grabbing'
          } ${scrolled ? 'border-b border-line-strong bg-surface-raised' : 'border-b border-line bg-surface'}`}
        >
          <span className={`flex h-6 w-6 items-center justify-center rounded-[5px] transition-colors ${focused ? 'bg-accent text-[#170a03]' : 'bg-white/[0.06] text-ink-faint'}`}>
            <Icon size={14} weight="bold" />
          </span>
          <span className={`font-mono text-[11px] tracking-[0.12em] transition-colors ${focused ? 'text-ink-muted' : 'text-ink-faint'}`}>
            {def.index} / {def.name.toUpperCase()}
          </span>
          <AnimatePresence>
            {scrolled && !def.bare && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="display hidden truncate text-[17px] leading-none text-ink sm:block"
              >
                {def.title}
              </motion.span>
            )}
          </AnimatePresence>

          <div className="ml-auto flex items-center gap-1">
            <ChromeButton label={`Minimize ${def.name}`} onClick={() => minimize(win.id)}>
              <Minus size={14} weight="bold" />
            </ChromeButton>
            {!mobile && (
              <ChromeButton label={win.maximized ? `Restore ${def.name}` : `Zoom ${def.name}`} onClick={() => toggleMaximize(win.id)}>
                {win.maximized ? <CornersIn size={14} weight="bold" /> : <CornersOut size={14} weight="bold" />}
              </ChromeButton>
            )}
            <ChromeButton label={`Close ${def.name}`} onClick={() => close(win.id)} danger>
              <X size={14} weight="bold" />
            </ChromeButton>
          </div>

          {/* Reading progress */}
          {!def.bare && (
            <motion.span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-accent" style={{ scaleX: progress }} />
          )}
        </div>

        {def.bare ? (
          <div className="min-h-0 flex-1">
            <Content params={win.params} paramsKey={win.paramsKey} />
          </div>
        ) : (
          <div
            ref={scrollRef}
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 48)}
            className="scrollbar-mac smooth-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <ScrollRootContext.Provider value={scrollRef}>
              <div className="px-5 pb-6 pt-8 sm:px-10 sm:pt-10">
                <Content params={win.params} paramsKey={win.paramsKey} />
              </div>
              {/* Footer: page end + jump to the next app */}
              <footer className="mt-6 border-t border-line px-5 py-5 sm:px-10">
                <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
                    End of {def.index} · {def.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => open(nextApp.id)}
                    className="press ripple-host group flex items-center gap-3 rounded-ctl px-3 py-2 text-left hover:bg-white/[0.04]"
                  >
                    <span className="text-right">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Next · {nextApp.index}</span>
                      <span className="display block text-xl leading-tight text-ink">{nextApp.name}</span>
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-muted transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-[#170a03]">
                      <ArrowRight size={16} weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </button>
                </div>
              </footer>
            </ScrollRootContext.Provider>
          </div>
        )}
      </div>

      {!zoomed && (
        <>
          <div onPointerDown={(e) => startResize(e, 'r')} className="absolute -right-1 bottom-4 top-11 w-2 cursor-ew-resize" />
          <div onPointerDown={(e) => startResize(e, 'b')} className="absolute -bottom-1 left-4 right-4 h-2 cursor-ns-resize" />
          <div onPointerDown={(e) => startResize(e, 'rb')} className="absolute -bottom-1.5 -right-1.5 h-5 w-5 cursor-nwse-resize" />
        </>
      )}
    </motion.section>
  );
}

function ChromeButton({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`press flex h-7 w-7 items-center justify-center rounded-[5px] text-ink-faint transition-colors hover:text-ink ${
        danger ? 'hover:bg-bad hover:!text-[#1a0503]' : 'hover:bg-white/[0.08]'
      }`}
    >
      {children}
    </button>
  );
}
