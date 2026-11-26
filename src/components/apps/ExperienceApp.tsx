'use client';

import { motion } from 'framer-motion';
import { useContext } from 'react';
import { AppHeader, Reveal, ScrollRootContext } from '@/components/ui/Section';
import { experiences } from '@/data/portfolio';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ExperienceApp() {
  const root = useContext(ScrollRootContext);
  return (
    <div className="mx-auto max-w-4xl">
      <AppHeader index="04" eyebrow="Career log" title="Experience" subtitle="Internships and leadership roles that shaped how I work." />

      <ol className="relative">
        {experiences.map((e, i) => (
          <Reveal as="li" key={e.id} className="relative grid gap-4 border-t border-line py-8 sm:grid-cols-[180px_1fr] sm:gap-10">
            {/* Ledger column */}
            <div className="flex items-start gap-3 sm:flex-col sm:gap-4">
              <span className="display text-[40px] leading-none text-ink-faint">{String(experiences.length - i).padStart(2, '0')}</span>
              <div>
                <p className="font-mono text-[11px] text-accent">{e.period}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{e.type}</p>
              </div>
            </div>

            <article className="min-w-0">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-ctl bg-white ${e.logoCover ? '' : 'p-1.5'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.logo} alt={`${e.company} logo`} className={`h-full w-full ${e.logoCover ? 'object-cover' : 'object-contain'}`} />
                </span>
                <span className="text-[14px] text-ink-muted">{e.company}</span>
              </div>
              <h3 className="display mt-4 text-[34px] leading-[1.02] text-ink">{e.role}</h3>
              <p className="mt-3 max-w-2xl text-[14.5px] leading-[1.7] text-ink-muted">{e.description}</p>

              <ul className="mt-5 space-y-2.5">
                {e.highlights.map((h, j) => (
                  <motion.li
                    key={h}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6, root: root ?? undefined }}
                    transition={{ duration: 0.5, delay: j * 0.06, ease: EASE }}
                    className="grid grid-cols-[28px_1fr] text-[13.5px] leading-relaxed text-ink"
                  >
                    <span className="pt-[3px] font-mono text-[10px] text-accent">{String(j + 1).padStart(2, '0')}</span>
                    {h}
                  </motion.li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {e.tech.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
