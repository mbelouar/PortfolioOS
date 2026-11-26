'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, EnvelopeSimple, FileText, GraduationCap, MapPin } from '@phosphor-icons/react';
import { useOS } from '@/components/os/OSContext';
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons';
import { Reveal, SectionTitle } from '@/components/ui/Section';
import { certifications, education, experiences, profile, projects, spokenLanguages } from '@/data/portfolio';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function AboutApp() {
  const { open } = useOS();

  const stats = [
    { value: projects.length, label: 'Projects', app: 'projects' as const },
    { value: certifications.length, label: 'Certifications', app: 'certifications' as const },
    { value: experiences.length, label: 'Roles', app: 'experience' as const },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero: portrait plate + editorial name */}
      <section className="grid gap-8 sm:grid-cols-[220px_1fr] sm:gap-10">
        <motion.figure
          initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
          transition={{ duration: 1, ease: EASE }}
          className="relative w-44 sm:w-full"
        >
          <div className="aspect-[4/5] overflow-hidden rounded-card ring-1 ring-line-strong">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.photo} alt={profile.name} width={440} height={550} className="h-full w-full object-cover grayscale-[25%]" />
          </div>
          <figcaption className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            <span>Fig. 01</span>
            <span className="flex items-center gap-1">
              <MapPin size={11} weight="bold" /> {profile.location.split(',')[0]}
            </span>
          </figcaption>
        </motion.figure>

        <div className="min-w-0">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ok"
          >
            <span className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-ok" />
            {profile.availability}
          </motion.p>
          <h1 className="display mt-4 text-[48px] leading-[0.92] sm:text-[68px]">
            {profile.name.split(' ').map((w, i) => (
              <span key={w} className="block overflow-hidden">
                <motion.span
                  className={`inline-block ${i ? 'italic' : ''}`}
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: EASE }}
                >
                  {w}
                  {i === profile.name.split(' ').length - 1 && <span className="not-italic text-accent">.</span>}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className="mt-5 text-[16px] leading-relaxed text-ink-muted"
          >
            {profile.headline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
            className="mt-7 flex flex-wrap items-center gap-2"
          >
            <button className="btn-primary" onClick={() => open('resume')}>
              <FileText size={16} weight="bold" />
              View résumé
            </button>
            <button className="btn-secondary" onClick={() => open('contact')}>
              <EnvelopeSimple size={16} />
              Get in touch
            </button>
            <a className="btn-icon" href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GithubIcon size={18} />
            </a>
            <a className="btn-icon" href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <LinkedinIcon size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <Reveal className="mt-12 grid grid-cols-3 border-y border-line">
        {stats.map((s, i) => (
          <button
            key={s.label}
            onClick={() => open(s.app)}
            className={`press ripple-host group flex items-end justify-between px-4 py-5 text-left transition-colors hover:bg-white/[0.03] ${i ? 'border-l border-line' : ''}`}
          >
            <span>
              <span className="display block text-[44px] leading-none tabular-nums transition-colors group-hover:text-accent">
                {String(s.value).padStart(2, '0')}
              </span>
              <span className="mt-2 block font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{s.label}</span>
            </span>
            <ArrowUpRight size={16} className="text-ink-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          </button>
        ))}
      </Reveal>

      {/* Profile */}
      <Reveal as="section">
        <SectionTitle index="A">Profile</SectionTitle>
        <div className="grid gap-8 sm:grid-cols-[1fr_200px]">
          <div className="space-y-4 text-[15px] leading-[1.75] text-ink-muted">
            <p className="display text-[26px] leading-snug text-ink">{profile.tagline}</p>
            {profile.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div>
            <p className="eyebrow mb-3">Focus</p>
            <ul className="space-y-2">
              {profile.focus.map((f, i) => (
                <li key={f} className="flex items-baseline gap-2 text-[13px] text-ink">
                  <span className="font-mono text-[10px] text-accent">{String(i + 1).padStart(2, '0')}</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      {/* Education */}
      <Reveal as="section">
        <SectionTitle index="B" aside={<GraduationCap size={16} className="text-ink-faint" />}>
          Education
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {education.map((e, i) => (
            <Reveal key={e.id} delay={i * 0.08}>
              <div className="card card-hover ticks flex h-full gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-ctl bg-white p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.logo} alt="" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">{e.period}</p>
                  <p className="display mt-1 text-[22px] leading-tight">{e.school}</p>
                  <p className="mt-1 text-[13px] text-ink">{e.program}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-faint">{e.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Languages */}
      <Reveal as="section">
        <SectionTitle index="C">Languages</SectionTitle>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-card bg-line sm:grid-cols-3">
          {spokenLanguages.map((l) => (
            <div key={l.code} className="flex items-center gap-4 bg-surface p-5">
              <span className="display text-[34px] leading-none text-accent">{l.code}</span>
              <div className="min-w-0">
                <p className="text-[14px] text-ink">{l.name}</p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">{l.level}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
