'use client';

import { motion } from 'framer-motion';
import { useContext } from 'react';
import { ArrowUpRight, DeviceMobile, HandHeart, Trophy, type Icon } from '@phosphor-icons/react';
import { useOS } from '@/components/os/OSContext';
import { AppHeader, Reveal, ScrollRootContext, SectionTitle } from '@/components/ui/Section';
import { communityContext, volunteering, type Volunteering } from '@/data/portfolio';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Per-role glyph and short label, keyed by volunteering id. */
interface RoleStyle {
  icon: Icon;
  short: string;
}
const STYLE: Record<string, RoleStyle> = {
  'sports-club': { icon: Trophy, short: '1337 MED Sports Club' },
  ecdh: { icon: DeviceMobile, short: 'ECDH' },
};
const FALLBACK: RoleStyle = { icon: HandHeart, short: '' };

const monthIndex = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
};
const monthsBetween = (start: string, end: string) => monthIndex(end) - monthIndex(start) + 1;
const fmtDuration = (months: number) => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y}y`, m && `${m}m`].filter(Boolean).join(' ') || '1m';
};
const fmtMonth = (ym: string) =>
  new Date(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

export default function CommunityApp() {
  const totalMonths = volunteering.reduce((n, v) => n + monthsBetween(v.start, v.end), 0);

  const stats = [
    { value: volunteering.length, label: 'Organizations' },
    { value: totalMonths, label: 'Months volunteered' },
    { value: 1, label: 'Club founded' },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <AppHeader
        index="05"
        eyebrow="Beyond the code"
        title="Community"
        subtitle="Volunteering and student life — where I learned to lead people, organize events and keep things running for others."
      />

      <div className="grid grid-cols-3 border-y border-line">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: EASE }}
            className={`px-4 py-5 ${i ? 'border-l border-line' : ''}`}
          >
            <p className="display text-[44px] leading-none tabular-nums">{String(s.value).padStart(2, '0')}</p>
            <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <Reveal as="section">
        <SectionTitle index="A">Timeline</SectionTitle>
        <Ribbon />
      </Reveal>

      <SectionTitle index="B">Roles</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        {volunteering.map((v, i) => (
          <RoleCard key={v.id} v={v} index={i} />
        ))}
      </div>
    </div>
  );
}

/** Gantt-style ribbon showing how commitments overlapped over the years. */
function Ribbon() {
  const { open } = useOS();
  const root = useContext(ScrollRootContext);
  const rows = [
    ...volunteering.map((v) => ({ id: v.id, label: STYLE[v.id]?.short || v.org, start: v.start, end: v.end, context: false, logo: v.logo, logoBg: v.logoBg })),
    ...communityContext.map((c) => ({ ...c, context: true })),
  ];
  const first = Math.min(...rows.map((r) => monthIndex(r.start)));
  const last = Math.max(...rows.map((r) => monthIndex(r.end)));
  const startYear = Math.floor(first / 12);
  const endYear = Math.floor(last / 12) + 1;
  const span = (endYear - startYear) * 12;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  return (
    <div className="card overflow-hidden p-5 sm:p-6">
      <div className="relative">
        {/* Year gridlines */}
        <div className="pointer-events-none absolute inset-0 ml-[38%] sm:ml-[30%]">
          {years.map((y, i) => (
            <div
              key={y}
              className="absolute bottom-0 top-0 border-l border-dashed border-ink/10"
              style={{ left: `${(i / (years.length - 1)) * 100}%` }}
            />
          ))}
        </div>

        <div className="relative space-y-3">
          {rows.map((r, i) => {
            const left = ((monthIndex(r.start) - startYear * 12) / span) * 100;
            const width = ((monthIndex(r.end) - monthIndex(r.start) + 1) / span) * 100;
            return (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-[38%] shrink-0 sm:w-[30%]">
                  {r.context ? (
                    <button
                      onClick={() => open('experience')}
                      className="group flex max-w-full items-center gap-2 text-left text-xs text-ink-muted hover:text-ink"
                    >
                      {r.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.logo} alt="" className="h-5 w-5 shrink-0 rounded-md object-contain ring-1 ring-white/10" style={{ background: r.logoBg }} />
                      )}
                      <span className="truncate">{r.label}</span>
                      <ArrowUpRight size={12} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ) : (
                    <p className="flex items-center gap-2 text-xs font-medium text-ink">
                      {r.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.logo} alt="" className="h-5 w-5 shrink-0 rounded-md object-contain ring-1 ring-white/10" style={{ background: r.logoBg }} />
                      )}
                      <span className="truncate">{r.label}</span>
                    </p>
                  )}
                </div>
                <div className="relative h-6 flex-1">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, root: root ?? undefined }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: EASE }}
                    title={`${fmtMonth(r.start)} — ${fmtMonth(r.end)}`}
                    className={`absolute inset-y-0 origin-left rounded-[3px] ${r.context ? 'border border-dashed border-ink/25' : 'bg-accent'}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                  <span
                    className={`absolute inset-y-0 flex items-center px-2.5 font-mono text-[10px] ${
                      r.context ? 'text-ink-faint' : 'text-[#170a03]'
                    }`}
                    style={{ left: `${left}%` }}
                  >
                    {fmtDuration(monthsBetween(r.start, r.end))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Year axis */}
        <div className="relative ml-[38%] mt-3 h-4 sm:ml-[30%]">
          {years.map((y, i) => (
            <span
              key={y}
              className="absolute -translate-x-1/2 font-mono text-[10px] text-ink-faint first:translate-x-0 last:-translate-x-full"
              style={{ left: `${(i / (years.length - 1)) * 100}%` }}
            >
              {y}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleCard({ v, index }: { v: Volunteering; index: number }) {
  const s = STYLE[v.id] ?? FALLBACK;
  const Icon = s.icon;
  const months = monthsBetween(v.start, v.end);

  return (
    <Reveal as="article" delay={index * 0.08} className="card card-hover ticks group flex flex-col p-6">
      <div className="flex items-start justify-between">
        <span
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-ctl p-1.5 ring-1 ring-line-strong transition-transform duration-500 ease-spring group-hover:-rotate-3 group-hover:scale-110"
          style={{ background: v.logoBg }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.logo} alt={`${v.org} logo`} className="h-full w-full object-contain" />
        </span>
        <span className="text-right">
          <span className="display block text-[40px] leading-none text-accent">{fmtDuration(months)}</span>
          <span className="mt-1 flex items-center justify-end gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            <Icon size={12} /> {v.cause}
          </span>
        </span>
      </div>

      <h3 className="display mt-6 text-[28px] leading-[1.05]">{v.role}</h3>
      <p className="mt-1 text-[13.5px] text-ink-muted">{v.org}</p>
      <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
        {fmtMonth(v.start)} — {fmtMonth(v.end)}
      </p>
      <p className="mt-4 text-[13.5px] leading-[1.7] text-ink-muted">{v.description}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
        {v.highlights.map((h) => (
          <span key={h} className="chip">
            {h}
          </span>
        ))}
      </div>
    </Reveal>
  );
}
