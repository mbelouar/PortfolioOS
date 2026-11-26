'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import {
  ArrowElbowDownLeft,
  ArrowUpRight,
  Copy,
  Cpu,
  EnvelopeSimple,
  FileText,
  FolderSimple,
  LockSimple,
  MagnifyingGlass,
  Notebook,
  SealCheck,
  type Icon,
} from '@phosphor-icons/react';
import { APPS } from '@/components/apps/registry';
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons';
import { certifications, certMeta, profile, projects, skillCategories } from '@/data/portfolio';
import { journal } from '@/data/journal';
import { useOS } from './OSContext';

interface Result {
  id: string;
  group: 'Applications' | 'Projects' | 'Journal' | 'Skills' | 'Certifications' | 'Actions';
  title: string;
  subtitle?: string;
  keywords: string;
  icon: React.ReactNode;
  run: () => void;
}

const glyph = (G: Icon | ((p: { size?: number }) => React.ReactElement)) => (
  <span className="flex h-8 w-8 items-center justify-center rounded-ctl shadow-[inset_0_0_0_1px_rgb(var(--ink)/0.14)]">
    <G size={16} />
  </span>
);

const GROUP_ORDER: Result['group'][] = ['Applications', 'Actions', 'Projects', 'Journal', 'Skills', 'Certifications'];

/** Simple scorer: prefix matches beat word matches beat substring matches. */
function score(r: Result, q: string) {
  const title = r.title.toLowerCase();
  if (title.startsWith(q)) return 3;
  if (title.split(/[\s/—-]+/).some((w) => w.startsWith(q))) return 2;
  if (`${title} ${r.subtitle ?? ''} ${r.keywords}`.toLowerCase().includes(q)) return 1;
  return 0;
}

export default function Spotlight() {
  const { spotlightOpen } = useOS();
  // A new key per opening guarantees a fresh panel, even if reopened mid-exit-animation.
  const [generation, setGeneration] = useState(0);
  const [wasOpen, setWasOpen] = useState(spotlightOpen);
  if (spotlightOpen !== wasOpen) {
    setWasOpen(spotlightOpen);
    if (spotlightOpen) setGeneration((g) => g + 1);
  }
  return <AnimatePresence>{spotlightOpen && <SpotlightPanel key={generation} />}</AnimatePresence>;
}

/** Mounted only while open, so query/selection reset naturally each time. */
function SpotlightPanel() {
  const os = useOS();
  const present = useIsPresent();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const close = () => os.setSpotlightOpen(false);

  const all = useMemo<Result[]>(
    () => [
      ...APPS.map((a) => ({
        id: `app-${a.id}`,
        group: 'Applications' as const,
        title: a.name,
        subtitle: 'Application',
        keywords: a.keywords,
        icon: glyph(a.icon),
        run: () => os.open(a.id),
      })),
      {
        id: 'act-cv',
        group: 'Actions',
        title: 'Résumé (English)',
        subtitle: 'PDF',
        keywords: 'cv resume pdf download english en',
        icon: glyph(FileText),
        run: () => os.open('resume', { lang: 'en' }),
      },
      {
        id: 'act-cv-fr',
        group: 'Actions',
        title: 'CV (Français)',
        subtitle: 'PDF',
        keywords: 'cv resume pdf download french francais fr',
        icon: glyph(FileText),
        run: () => os.open('resume', { lang: 'fr' }),
      },
      {
        id: 'act-email',
        group: 'Actions',
        title: 'Copy Email Address',
        subtitle: profile.email,
        keywords: 'mail contact clipboard',
        icon: glyph(Copy),
        run: () => {
          navigator.clipboard
            ?.writeText(profile.email)
            .then(() => os.notify({ title: 'Email copied', body: profile.email }))
            .catch(() => {});
        },
      },
      {
        id: 'act-message',
        group: 'Actions',
        title: 'Send a Message',
        subtitle: 'Contact form',
        keywords: 'hire email write contact',
        icon: glyph(EnvelopeSimple),
        run: () => os.open('contact'),
      },
      {
        id: 'act-github',
        group: 'Actions',
        title: 'Open GitHub',
        subtitle: profile.githubHandle,
        keywords: 'code repositories source',
        icon: glyph(GithubIcon),
        run: () => window.open(profile.github, '_blank', 'noopener'),
      },
      {
        id: 'act-linkedin',
        group: 'Actions',
        title: 'Open LinkedIn',
        subtitle: 'Profile',
        keywords: 'network social',
        icon: glyph(LinkedinIcon),
        run: () => window.open(profile.linkedin, '_blank', 'noopener'),
      },
      {
        id: 'act-lock',
        group: 'Actions',
        title: 'Lock Screen',
        keywords: 'sleep logout',
        icon: glyph(LockSimple),
        run: os.lock,
      },
      ...projects.map((p) => ({
        id: `proj-${p.id}`,
        group: 'Projects' as const,
        title: p.name,
        subtitle: p.subtitle,
        keywords: p.tech.join(' '),
        icon: glyph(FolderSimple),
        run: () => os.open('projects', { project: p.id }),
      })),
      ...journal.map((post) => ({
        id: `post-${post.id}`,
        group: 'Journal' as const,
        title: post.title,
        subtitle: post.date.slice(0, 4),
        keywords: `${post.summary} ${(post.tags ?? []).join(' ')}`,
        icon: glyph(Notebook),
        run: () => os.open('journal'),
      })),
      ...skillCategories.flatMap((c) =>
        c.skills.map((s) => ({
          id: `skill-${c.id}-${s.name}`,
          group: 'Skills' as const,
          title: s.name,
          subtitle: c.title,
          keywords: '',
          icon: glyph(Cpu),
          run: () => os.open('skills', { q: s.name }),
        })),
      ),
      ...certifications.map((c) => ({
        id: `cert-${c.id}`,
        group: 'Certifications' as const,
        title: c.short,
        subtitle: certMeta(c),
        keywords: c.name,
        icon: glyph(SealCheck),
        run: () => os.open('certifications'),
      })),
    ],
    [os],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all.filter((r) => r.group === 'Applications' || r.id === 'act-cv' || r.id === 'act-cv-fr' || r.id === 'act-email');
    const ranked = all
      .map((r) => ({ r, s: score(r, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || GROUP_ORDER.indexOf(a.r.group) - GROUP_ORDER.indexOf(b.r.group))
      .slice(0, 14)
      .map((x) => x.r);
    // Keep results grouped, with the group holding the best match first (sort is stable).
    const groups = [...new Set(ranked.map((r) => r.group))];
    return ranked.sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group));
  }, [all, query]);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const execute = (r?: Result) => {
    if (!r) return;
    close();
    r.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[9800] flex items-start justify-center bg-base/70 px-4 pt-[12vh] backdrop-blur-[2px]"
      style={{ pointerEvents: present ? 'auto' : 'none' }}
      onPointerDown={(e) => e.target === e.currentTarget && close()}
    >
      <motion.div
        role="dialog"
        aria-label="Spotlight search"
        initial={{ opacity: 0, scale: 0.97, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -8 }}
        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
        className="w-full max-w-[660px] overflow-hidden rounded-win bg-surface shadow-popover"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <MagnifyingGlass size={20} className="shrink-0 text-accent" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search apps, projects, skills…"
            aria-label="Search"
            aria-controls="spotlight-results"
            aria-activedescendant={results[active] ? `sr-${results[active].id}` : undefined}
            className="display h-16 flex-1 bg-transparent text-[26px] text-ink placeholder:text-ink-faint focus:outline-none"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-flex">esc</kbd>
        </div>

        <div
          ref={listRef}
          id="spotlight-results"
          role="listbox"
          className="scrollbar-mac max-h-[min(440px,55vh)] overflow-y-auto p-2"
        >
          {results.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-3 py-12 text-center">
              <MagnifyingGlass size={28} className="text-ink-faint" />
              <p className="display text-2xl text-ink">Nothing found</p>
              <p className="text-[13px] text-ink-faint">No match for “{query}”. Try a skill, project or app name.</p>
            </div>
          )}
          {results.map((r, i) => {
            const header = i === 0 || results[i - 1].group !== r.group ? r.group : null;
            const isActive = i === active;
            return (
              <div key={r.id}>
                {header && <p className="px-3 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">{header}</p>}
                <button
                  id={`sr-${r.id}`}
                  data-idx={i}
                  role="option"
                  aria-selected={isActive}
                  onPointerMove={() => !isActive && setActive(i)}
                  onClick={() => execute(r)}
                  className={`relative flex w-full items-center gap-3 rounded-ctl px-3 py-2 text-left transition-colors duration-100 ${
                    isActive ? 'bg-accent/[0.12] text-ink' : 'text-ink-muted'
                  }`}
                >
                  {isActive && <motion.span layoutId="spot-bar" className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-accent" transition={{ type: 'spring', stiffness: 600, damping: 40 }} />}
                  <span className={isActive ? 'text-accent' : 'text-ink-muted'}>{r.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{r.title}</span>
                  </span>
                  {r.subtitle && (
                    <span
                      className={`hidden max-w-[45%] truncate text-xs sm:block ${isActive ? 'text-ink-muted' : 'text-ink-faint'}`}
                    >
                      {r.subtitle}
                    </span>
                  )}
                  {isActive &&
                    (r.id.startsWith('act-github') || r.id.startsWith('act-linkedin') ? (
                      <ArrowUpRight size={16} className="shrink-0 text-accent" />
                    ) : (
                      <ArrowElbowDownLeft size={16} className="shrink-0 text-accent" />
                    ))}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
