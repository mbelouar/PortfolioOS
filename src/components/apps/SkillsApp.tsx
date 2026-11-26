'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { AppHeader, EmptyState, Reveal, SectionTitle } from '@/components/ui/Section';
import { skillCategories, skillLevelLabel, spokenLanguages, type Skill } from '@/data/portfolio';
import type { AppProps } from './registry';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function SkillsApp({ params }: AppProps) {
  const [query, setQuery] = useState(params?.q ?? '');
  const q = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      skillCategories
        .map((c) => ({ ...c, skills: c.skills.filter((s) => !q || s.name.toLowerCase().includes(q)) }))
        .filter((c) => c.skills.length),
    [q],
  );
  const total = skillCategories.reduce((n, c) => n + c.skills.length, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <AppHeader index="03" eyebrow={`${total} technologies`} title="Skills" subtitle="The tools I reach for to build, ship and operate systems.">
        <label className="relative block w-full sm:w-64">
          <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter the stack"
            aria-label="Filter skills"
            className="input !py-2.5 pl-9 pr-9"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                onClick={() => setQuery('')}
                aria-label="Clear filter"
                className="press absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-[4px] text-ink-muted hover:bg-white/10 hover:text-ink"
              >
                <X size={12} weight="bold" />
              </motion.button>
            )}
          </AnimatePresence>
        </label>
      </AppHeader>

      {/* Legend */}
      <div className="-mt-4 mb-2 flex flex-wrap items-center gap-5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
        {['Expert', 'Advanced', 'Proficient'].map((l, i) => (
          <span key={l} className="flex items-center gap-2">
            <Meter level={[95, 85, 75][i]} compact />
            {l}
          </span>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No match in the stack"
            body={`Nothing called “${query}” yet. Try a broader term like “cloud” or “python”.`}
            action={
              <button className="btn-secondary mt-2" onClick={() => setQuery('')}>
                Clear filter
              </button>
            }
          />
        </div>
      )}

      {groups.map((c, ci) => (
        <Reveal as="section" key={c.id}>
          <SectionTitle index={String(ci + 1).padStart(2, '0')} aside={<span className="font-mono text-[10.5px] text-ink-faint">{c.skills.length}</span>}>
            {c.title}
          </SectionTitle>
          <div className="grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-2">
            {c.skills.map((s, i) => (
              <SkillRow key={s.name} skill={s} delay={i * 0.03} />
            ))}
            {c.skills.length % 2 === 1 && <div className="hidden bg-surface sm:block" />}
          </div>
        </Reveal>
      ))}

      {!q && (
        <Reveal as="section">
          <SectionTitle index="—">Spoken languages</SectionTitle>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {spokenLanguages.map((l) => (
              <p key={l.code} className="flex items-baseline gap-3">
                <span className="display text-[28px] leading-none text-ink">{l.name}</span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{l.level}</span>
              </p>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}

function SkillRow({ skill, delay }: { skill: Skill; delay: number }) {
  const [broken, setBroken] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className="group flex items-center gap-3.5 bg-surface px-4 py-3.5 transition-colors duration-300 hover:bg-surface-raised"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ctl bg-white p-1.5 transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110">
        {broken ? (
          <span className="font-mono text-sm font-bold text-neutral-700">{skill.name[0]}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={skill.icon} alt="" width={24} height={24} decoding="async" className="h-full w-full object-contain" onError={() => setBroken(true)} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] text-ink" title={skill.name}>
          {skill.name}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{skillLevelLabel(skill.level)}</p>
      </div>
      <Meter level={skill.level} />
    </motion.div>
  );
}

/** Five ticks: reads at a glance and avoids implying false precision. */
function Meter({ level, compact = false }: { level: number; compact?: boolean }) {
  const filled = level >= 90 ? 5 : level >= 80 ? 4 : 3;
  return (
    <span className={`flex items-end ${compact ? 'gap-[2px]' : 'gap-[3px]'}`} aria-label={skillLevelLabel(level)}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`${compact ? 'h-2.5 w-[3px]' : 'w-[4px]'} rounded-[1px] transition-colors duration-500 ${i < filled ? 'bg-accent' : 'bg-white/[0.1]'}`}
          style={compact ? undefined : { height: 6 + i * 3 }}
        />
      ))}
    </span>
  );
}
