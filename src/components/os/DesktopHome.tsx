'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight, MapPin, Sparkle } from '@phosphor-icons/react';
import { APPS } from '@/components/apps/registry';
import { certifications, experiences, profile, projects } from '@/data/portfolio';
import { useCoarsePointer, useIsMac, useNow } from '@/lib/hooks';
import { useOS } from './OSContext';

const EASE = [0.22, 1, 0.36, 1] as const;
const enter = (delay: number, y = 24) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE },
});

export default function DesktopHome({ mobile }: { mobile: boolean }) {
  return mobile ? <MobileHome /> : <WideHome />;
}

/** Pointer position as springy -0.5…0.5 values, for layered parallax. */
function usePointerParallax() {
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  useEffect(() => {
    if (coarse || reduced) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [coarse, reduced, mx, my]);
  return { sx, sy };
}

const depth = (px: number) => (n: number) => n * px;

function WideHome() {
  const { open, setSpotlightOpen } = useOS();
  const mac = useIsMac();
  const { sx, sy } = usePointerParallax();
  const nameX = useTransform(sx, depth(22));
  const nameY = useTransform(sy, depth(14));
  const sideX = useTransform(sx, depth(-10));
  const sideY = useTransform(sy, depth(-8));
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const current = experiences[0];

  return (
    <div className="pointer-events-none fixed bottom-0 left-[var(--rail-w)] right-0 top-[var(--bar-h)] flex flex-col">
      <div className="mx-auto grid w-full max-w-[1320px] flex-1 grid-cols-12 items-center gap-10 px-[4vw] pt-6">
        {/* Hero */}
        <motion.div className="pointer-events-auto col-span-12 lg:col-span-7" style={{ x: nameX, y: nameY }}>
          <motion.p {...enter(0.15, 12)} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <span className="text-accent">(00)</span>
            {profile.role}
            <span className="h-px w-10 bg-line-strong" />
            <MapPin size={12} weight="bold" />
            {profile.location}
          </motion.p>

          <h1 className="display mt-6 text-[clamp(64px,8.4vw,136px)] leading-[0.86] text-ink">
            <span className="block overflow-hidden pb-[0.04em]">
              <motion.span className="inline-block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.2, ease: EASE }}>
                Mohammed
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="inline-block italic"
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.32, ease: EASE }}
              >
                Belouarraq<span className="not-italic text-accent">.</span>
              </motion.span>
            </span>
          </h1>

          <motion.p {...enter(0.6)} className="mt-7 max-w-[540px] text-[17px] leading-[1.6] text-ink-muted">
            {profile.tagline}
          </motion.p>

          <motion.div {...enter(0.72)} className="mt-9 flex flex-wrap items-center gap-3">
            <button onClick={() => open('projects')} className="btn-primary group !px-5 !py-3">
              Explore projects
              <ArrowRight size={16} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button onClick={() => open('about')} className="btn-secondary !px-5 !py-3">
              About me
            </button>
            <button
              onClick={() => setSpotlightOpen(true)}
              className="press ml-2 flex items-center gap-2 text-[12px] text-ink-faint transition-colors hover:text-ink"
            >
              <kbd>{mac ? '⌘' : 'Ctrl'}</kbd>
              <kbd>K</kbd>
              to search everything
            </button>
          </motion.div>

          {/* Stats */}
          <motion.dl {...enter(0.85)} className="mt-14 grid max-w-[560px] grid-cols-3 border-t border-line">
            {[
              { n: projects.length, l: 'Projects', app: 'projects' as const },
              { n: certifications.length, l: 'Certifications', app: 'certifications' as const },
              { n: experiences.length, l: 'Roles', app: 'experience' as const },
            ].map((s, i) => (
              <button
                key={s.l}
                onClick={() => open(s.app)}
                className={`press group pt-4 text-left ${i ? 'border-l border-line pl-5' : ''}`}
              >
                <dd className="display text-[48px] leading-none text-ink transition-colors group-hover:text-accent">
                  <Counter to={s.n} />
                </dd>
                <dt className="mt-2 flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
                  {s.l}
                  <ArrowUpRight size={11} weight="bold" className="opacity-0 transition-opacity group-hover:opacity-100" />
                </dt>
              </button>
            ))}
          </motion.dl>
        </motion.div>

        {/* Index of apps + featured */}
        <motion.aside className="pointer-events-auto col-span-12 hidden lg:col-span-5 lg:block" style={{ x: sideX, y: sideY }}>
          <motion.div {...enter(0.4, 12)} className="mb-3 flex items-center justify-between border-b border-line pb-2">
            <span className="eyebrow">Index</span>
            <span className="font-mono text-[10.5px] text-ink-faint">{APPS.length} entries</span>
          </motion.div>
          <ol>
            {APPS.map((a, i) => (
              <motion.li key={a.id} {...enter(0.45 + i * 0.04, 10)}>
                <button
                  onClick={() => open(a.id)}
                  className="press-soft press group relative flex w-full items-center gap-4 overflow-hidden border-b border-line py-[9px] text-left"
                >
                  <span aria-hidden className="absolute inset-0 origin-left scale-x-0 bg-accent/[0.07] transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  <span className="relative w-7 font-mono text-[11px] text-ink-faint transition-colors group-hover:text-accent">{a.index}</span>
                  <span className="display relative text-[22px] leading-none text-ink transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                    {a.name}
                  </span>
                  <span className="relative ml-auto truncate pl-3 text-[12px] text-ink-faint opacity-60 transition-opacity group-hover:opacity-100">{a.blurb}</span>
                  <ArrowUpRight size={14} weight="bold" className="relative shrink-0 -translate-x-1 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </button>
              </motion.li>
            ))}
          </ol>

          <motion.button
            {...enter(0.95, 12)}
            onClick={() => open('projects', { project: featured.id })}
            className="card card-hover ticks press-soft press group mt-6 block w-full p-5 text-left"
          >
            <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent">
              <Sparkle size={12} weight="fill" /> Featured build
            </span>
            <span className="display mt-2 block text-[28px] leading-tight text-ink">{featured.name}</span>
            <span className="mt-1 block text-[13px] text-ink-muted">{featured.subtitle}</span>
            <span className="mt-4 flex flex-wrap gap-1.5">
              {featured.tech.slice(0, 5).map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </span>
          </motion.button>
        </motion.aside>
      </div>

      <HomeFooter current={`${current.role} · ${current.company}`} />
    </div>
  );
}

function HomeFooter({ current }: { current: string }) {
  const now = useNow(15000);
  const local = now?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: profile.timezone });
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.1 }}
      className="pointer-events-auto mx-[4vw] mb-5 mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-line pt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint"
    >
      <span className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-ok" />
        {profile.availability}
      </span>
      <span className="hidden xl:inline">Now · {current}</span>
      <span suppressHydrationWarning>Casablanca {local ?? '--:--'}</span>
      <span>© {new Date().getFullYear()} Mohammed Belouarraq</span>
    </motion.footer>
  );
}

/** Counts up from zero once, on mount. */
function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = String(to).padStart(2, '0');
      return;
    }
    let raf = 0;
    const start = performance.now() + 700;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / 1100));
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * to)).padStart(2, '0');
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, reduced]);
  return <span ref={ref}>00</span>;
}

function MobileHome() {
  const { open } = useOS();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const heroY = useTransform(scrollY, [0, 400], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 320], [1, 0.2]);
  const headerOpacity = useTransform(scrollY, [140, 200], [0, 1]);
  const featured = projects.find((p) => p.featured) ?? projects[0];

  return (
    <div ref={scrollRef} className="scrollbar-none smooth-scroll fixed inset-x-0 bottom-[76px] top-[var(--bar-h)] overflow-y-auto">
      {/* Condensed header that fades in once the hero scrolls away */}
      <motion.div
        style={{ opacity: headerOpacity }}
        className="pointer-events-none sticky top-0 z-10 -mb-11 flex h-11 items-center justify-between border-b border-line bg-surface/95 px-5 backdrop-blur-md"
      >
        <span className="display text-[19px] text-ink">
          M. Belouarraq<span className="text-accent">.</span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Index</span>
      </motion.div>

      <motion.section style={{ y: heroY, opacity: heroOpacity }} className="px-5 pb-10 pt-10">
        <motion.p {...enter(0.05, 8)} className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-muted">
          <span className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-ok" />
          {profile.availability}
        </motion.p>
        <h1 className="display mt-5 text-[64px] leading-[0.88] text-ink">
          <span className="block overflow-hidden">
            <motion.span className="inline-block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.1, ease: EASE }}>
              Mohammed
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-1">
            <motion.span className="inline-block italic" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.2, ease: EASE }}>
              Belouarraq<span className="not-italic text-accent">.</span>
            </motion.span>
          </span>
        </h1>
        <motion.p {...enter(0.4)} className="mt-5 text-[15px] leading-relaxed text-ink-muted">
          {profile.tagline}
        </motion.p>
        <motion.div {...enter(0.5)} className="mt-7 flex gap-2">
          <button onClick={() => open('projects')} className="btn-primary flex-1">
            Projects <ArrowRight size={16} weight="bold" />
          </button>
          <button onClick={() => open('contact')} className="btn-secondary flex-1">
            Contact
          </button>
        </motion.div>
      </motion.section>

      <section className="relative bg-base px-5 pb-6">
        <MobileReveal root={scrollRef}>
          <div className="mb-2 flex items-center justify-between border-b border-line pb-2">
            <span className="eyebrow">Index</span>
            <span className="font-mono text-[10.5px] text-ink-faint">{APPS.length}</span>
          </div>
        </MobileReveal>
        <ol>
          {APPS.map((a, i) => (
            <MobileReveal key={a.id} root={scrollRef} delay={i * 0.03}>
              <button onClick={() => open(a.id)} className="press ripple-host flex w-full items-center gap-4 border-b border-line py-3.5 text-left">
                <span className="w-6 font-mono text-[11px] text-accent">{a.index}</span>
                <span className="display text-[24px] leading-none text-ink">{a.name}</span>
                <ArrowUpRight size={16} className="ml-auto text-ink-faint" />
              </button>
            </MobileReveal>
          ))}
        </ol>

        <MobileReveal root={scrollRef}>
          <button onClick={() => open('projects', { project: featured.id })} className="card press ripple-host mt-8 block w-full p-5 text-left">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              <Sparkle size={12} weight="fill" /> Featured build
            </span>
            <span className="display mt-2 block text-[26px] leading-tight">{featured.name}</span>
            <span className="mt-1 block text-[13px] text-ink-muted">{featured.subtitle}</span>
          </button>
        </MobileReveal>

        <MobileReveal root={scrollRef}>
          <footer className="mt-10 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            <p>{profile.location}</p>
            <p className="mt-1">© {new Date().getFullYear()} Mohammed Belouarraq</p>
          </footer>
        </MobileReveal>
      </section>
    </div>
  );
}

function MobileReveal({ children, root, delay = 0 }: { children: React.ReactNode; root: React.RefObject<HTMLElement | null>; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3, root }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
