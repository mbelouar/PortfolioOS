'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, CaretDown, ChatCircle, GithubLogo, LockSimple, Sparkle } from '@phosphor-icons/react';
import { useOS } from '@/components/os/OSContext';
import { AppHeader, Segmented } from '@/components/ui/Section';
import { profile, projects, type CaseStudy, type Project, type ProjectCategory } from '@/data/portfolio';
import { trackPointer } from '@/lib/hooks';
import type { AppProps } from './registry';

type Filter = 'all' | ProjectCategory;

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ai', label: 'AI & QA' },
  { value: 'devops', label: 'Cloud & DevOps' },
  { value: 'fullstack', label: 'Full-stack' },
  { value: 'data', label: 'Data' },
  { value: 'systems', label: 'Systems' },
];

export default function ProjectsApp({ params, paramsKey }: AppProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [highlight, setHighlight] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  // Deep-link from Spotlight / widgets: reset the filter and pulse the requested project.
  const request = params?.project ? `${params.project}:${paramsKey ?? 0}` : null;
  const [handled, setHandled] = useState<string | null>(null);
  if (request !== handled) {
    setHandled(request);
    if (params?.project) {
      setFilter('all');
      setHighlight(params.project);
    }
  }

  useEffect(() => {
    const id = params?.project;
    if (!id) return;
    const t1 = window.setTimeout(() => refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    const t2 = window.setTimeout(() => setHighlight(null), 2200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [params?.project, paramsKey]);

  const visible = useMemo(
    () => projects.filter((p) => filter === 'all' || p.category === filter),
    [filter],
  );

  return (
    <div className="mx-auto max-w-4xl">
      <AppHeader
        index="02"
        eyebrow={`${projects.length} projects · selected work`}
        title="Projects"
        subtitle="Infrastructure, platforms and products I've designed, built and shipped."
      />
      <div className="scrollbar-none -mx-1 -mt-4 mb-8 overflow-x-auto px-1">
        <Segmented
          value={filter}
          options={filters.map((f) => ({ ...f, count: f.value === 'all' ? projects.length : projects.filter((p) => p.category === f.value).length }))}
          onChange={setFilter}
        />
      </div>

      <motion.div layout className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i}
              highlighted={highlight === p.id}
              innerRef={(el) => {
                refs.current[p.id] = el;
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <a
        href={`${profile.github}?tab=repositories`}
        target="_blank"
        rel="noopener noreferrer"
        className="press-soft press group mt-8 flex items-center justify-between border-y border-line py-6"
      >
        <span className="flex items-center gap-4">
          <GithubLogo size={28} className="text-ink-muted transition-colors group-hover:text-accent" />
          <span>
            <span className="display block text-[28px] leading-none">More on GitHub</span>
            <span className="mt-1 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{profile.githubHandle} · all repositories</span>
          </span>
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-[#170a03]">
          <ArrowUpRight size={18} weight="bold" />
        </span>
      </a>
    </div>
  );
}

function ProjectCard({
  project: p,
  index,
  highlighted,
  innerRef,
}: {
  project: Project;
  index: number;
  highlighted: boolean;
  innerRef: (el: HTMLElement | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.article
      ref={innerRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={trackPointer}
      className={`card card-hover spotlight ticks group flex flex-col p-6 ${p.featured ? 'md:col-span-2 md:p-8' : ''} ${
        highlighted ? 'shadow-glow' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
        <span className="flex items-center gap-3">
          <span className="text-accent">{String(index + 1).padStart(2, '0')}</span>
          <span>{p.year}</span>
          <span className="hidden sm:inline">{p.type}</span>
        </span>
        <span className="flex items-center gap-2">
          {p.featured && (
            <span className="flex items-center gap-1 text-accent">
              <Sparkle size={11} weight="fill" /> Featured
            </span>
          )}
          {p.proprietary && (
            <span className="flex items-center gap-1 text-bad">
              <LockSimple size={11} weight="bold" /> {p.proprietary.org}
            </span>
          )}
        </span>
      </div>

      <div className={`mt-5 flex flex-wrap items-start justify-between gap-4 ${p.featured ? 'md:flex-nowrap' : ''}`}>
        <div className="min-w-0">
          <h3 className={`display leading-[1.02] text-ink ${p.featured ? 'text-[44px]' : 'text-[30px]'}`}>{p.name}</h3>
          <p className="mt-2 text-[14px] text-ink-muted">{p.subtitle}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {p.demo && (
            <a href={p.demo} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} live demo`} className="btn-primary !px-3 !py-2 text-xs">
              <span className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-[#170a03]" />
              Live
            </a>
          )}
          {p.caseStudy && (
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="btn-primary !px-3 !py-2 text-xs">
              <BookOpen size={14} weight="bold" />
              Case study
              <CaretDown size={12} weight="bold" className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
          )}
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} source code on GitHub`} className="btn-secondary !px-3 !py-2 text-xs">
              <GithubLogo size={14} />
              Code
              <ArrowUpRight size={12} weight="bold" />
            </a>
          )}
        </div>
      </div>

      <p className={`mt-4 text-[14px] leading-[1.7] text-ink-muted ${p.featured ? 'max-w-3xl' : ''}`}>{p.description}</p>

      <AnimatePresence initial={false}>
        {open && p.caseStudy && <CaseStudyPanel project={p} caseStudy={p.caseStudy} />}
      </AnimatePresence>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
        {p.tech.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

function CaseStudyPanel({ project: p, caseStudy: cs }: { project: Project; caseStudy: CaseStudy }) {
  const { open } = useOS();
  const EASE = [0.22, 1, 0.36, 1] as const;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="overflow-hidden"
    >
      <div className="mt-6 space-y-7 border-t border-line pt-6">
        {/* Problem */}
        <div>
          <p className="eyebrow mb-1.5">The problem</p>
          <p className="display max-w-3xl text-[22px] leading-snug text-ink">{cs.problem}</p>
        </div>

        {/* Pipeline */}
        <div>
          <p className="eyebrow mb-3">How it works</p>
          <ol className="relative grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-3 lg:grid-cols-6">
            {cs.pipeline.map((s, i) => (
              <motion.li
                key={s.step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: EASE }}
                className="relative bg-surface p-4"
              >
                <span className="font-mono text-[10px] text-accent">STEP {String(i + 1).padStart(2, '0')}</span>
                <p className="mt-2 text-[13.5px] text-ink">{s.step}</p>
                <p className="mt-1 text-[11.5px] leading-snug text-ink-faint">{s.detail}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 border-y border-line sm:grid-cols-4">
          {cs.results.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.45 + i * 0.06, ease: EASE }}
              className={`px-4 py-4 ${i ? 'sm:border-l sm:border-line' : ''}`}
            >
              <p className="display text-[36px] leading-none text-accent">{r.value}</p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{r.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Confidentiality note + CTA */}
        {p.proprietary && (
          <div className="flex flex-col gap-3 rounded-card p-4 shadow-[inset_0_0_0_1px_rgb(var(--bad)/0.3)] sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-muted">
              <LockSimple size={14} weight="bold" className="mt-0.5 shrink-0 text-bad" />
              {p.proprietary.note}
            </p>
            <button
              type="button"
              onClick={() => open('contact', { subject: `About your ${p.name}` })}
              className="btn-primary shrink-0 !py-2 text-xs"
            >
              <ChatCircle size={14} weight="bold" />
              Ask me about it
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
