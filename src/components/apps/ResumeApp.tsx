'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowSquareOut, DownloadSimple, FileText } from '@phosphor-icons/react';
import { profile } from '@/data/portfolio';
import { useCoarsePointer } from '@/lib/hooks';
import type { AppProps } from './registry';

type Lang = keyof typeof profile.cv;

const asLang = (v?: string): Lang | null => (v === 'fr' || v === 'en' ? v : null);
const EASE = [0.22, 1, 0.36, 1] as const;
const CONTENTS = ['Experience', 'Education', 'Technical skills', 'Projects', 'Certifications', 'Languages'];

export default function ResumeApp({ params, paramsKey = 0 }: AppProps) {
  const [lang, setLang] = useState<Lang>(asLang(params?.lang) ?? 'en');
  // Re-opening the app with a language (e.g. from Spotlight) switches the open window too.
  const [seenKey, setSeenKey] = useState(paramsKey);
  if (paramsKey !== seenKey) {
    setSeenKey(paramsKey);
    const requested = asLang(params?.lang);
    if (requested) setLang(requested);
  }
  // Mobile browsers render embedded PDFs poorly (often just the first page), so offer a clean hand-off instead.
  const touch = useCoarsePointer();
  const cv = profile.cv[lang];
  const fileName = cv.file.slice(1);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loaded = loadedKey === lang;

  const langSwitch = (pill: string) => (
    <div role="tablist" aria-label="Résumé language" className="relative inline-flex rounded-ctl p-0.5 shadow-[inset_0_0_0_1px_rgb(var(--ink)/0.14)]">
      {(Object.keys(profile.cv) as Lang[]).map((l) => (
        <button
          key={l}
          role="tab"
          aria-selected={lang === l}
          title={profile.cv[l].label}
          onClick={() => setLang(l)}
          className={`press relative rounded-[4px] px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
            lang === l ? 'text-[#170a03]' : 'text-ink-faint hover:text-ink'
          }`}
        >
          {lang === l && <motion.span layoutId={pill} className="absolute inset-0 rounded-[4px] bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
          <span className="relative">{profile.cv[l].label}</span>
        </button>
      ))}
    </div>
  );

  const Actions = (
    <div className="flex flex-col gap-2">
      <a href={cv.file} download={fileName} className="btn-primary w-full">
        <DownloadSimple size={16} weight="bold" />
        Download PDF
      </a>
      <a href={cv.file} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
        <ArrowSquareOut size={16} />
        Open in new tab
      </a>
    </div>
  );

  if (touch) {
    return (
      <div className="scrollbar-none flex h-full flex-col overflow-y-auto bg-surface p-6">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent">10 / Document</p>
        <h1 className="display mt-3 text-[52px] leading-none">Résumé</h1>
        <p className="mt-3 text-[14px] text-ink-muted">{profile.name} · {profile.role}</p>
        <div className="mt-6">{langSwitch('cv-lang-touch')}</div>
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 16, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="blueprint-frame my-8 flex aspect-[1/1.3] w-full max-w-[260px] flex-col items-center justify-center gap-3 self-center rounded-card"
        >
          <FileText size={44} className="text-accent" />
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">PDF · {cv.label}</p>
        </motion.div>
        <div className="mt-auto">{Actions}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Document panel */}
      <aside className="scrollbar-none hidden w-[240px] shrink-0 flex-col overflow-y-auto border-r border-line bg-surface p-6 md:flex">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent">10 / Document</p>
        <h1 className="display mt-3 text-[44px] leading-none">Résumé</h1>
        <p className="mt-2 text-[13px] text-ink-muted">{profile.name}</p>

        <div className="mt-6">{langSwitch('cv-lang-panel')}</div>

        <dl className="mt-6 space-y-3 border-y border-line py-4 font-mono text-[10.5px] uppercase tracking-[0.12em]">
          <div className="flex justify-between gap-2">
            <dt className="text-ink-faint">File</dt>
            <dd className="truncate text-ink-muted" title={fileName}>{fileName.replace('CV_Mohammed_Belouarraq_', '')}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-faint">Format</dt>
            <dd className="text-ink-muted">PDF · A4</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-faint">Language</dt>
            <dd className="text-ink-muted">{cv.label}</dd>
          </div>
        </dl>

        <p className="eyebrow mb-2 mt-6">Contents</p>
        <ol className="space-y-1.5">
          {CONTENTS.map((c, i) => (
            <li key={c} className="flex items-baseline gap-2 text-[13px] text-ink-muted">
              <span className="font-mono text-[10px] text-accent">{String(i + 1).padStart(2, '0')}</span>
              {c}
            </li>
          ))}
        </ol>

        <div className="mt-auto pt-6">{Actions}</div>
      </aside>

      {/* Viewer */}
      <div className="flex min-w-0 flex-1 flex-col bg-surface-sunken">
        <div className="flex items-center gap-3 border-b border-line px-4 py-2 md:hidden">
          {langSwitch('cv-lang-bar')}
          <a href={cv.file} download={fileName} className="btn-primary ml-auto !px-3 !py-1.5 text-xs">
            <DownloadSimple size={14} weight="bold" />
            Download
          </a>
        </div>
        <div className="relative flex-1 p-4 sm:p-8">
          {/* Ruler ticks along the top edge */}
          <div
            aria-hidden
            className="absolute inset-x-8 top-3 h-2 opacity-60"
            style={{ backgroundImage: 'linear-gradient(90deg, rgb(var(--ink) / 0.25) 1px, transparent 1px)', backgroundSize: '16px 100%' }}
          />
          {!loaded && (
            <div aria-hidden className="absolute inset-4 flex flex-col gap-3 rounded-ctl bg-surface p-10 sm:inset-8">
              <div className="skeleton mx-auto h-7 w-1/2 rounded" />
              <div className="skeleton mx-auto h-3 w-1/3 rounded" />
              <div className="mt-8 space-y-2.5">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="skeleton h-2.5 rounded" style={{ width: `${94 - ((i * 13) % 30)}%` }} />
                ))}
              </div>
              <p className="mt-auto font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Loading {fileName}…</p>
            </div>
          )}
          <motion.iframe
            key={lang}
            initial={{ opacity: 0, y: 12 }}
            animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: EASE }}
            onLoad={() => setLoadedKey(lang)}
            src={`${cv.file}#toolbar=0&navpanes=0&view=FitH`}
            title={`Résumé (${cv.label}) — ${profile.name}`}
            className="h-full w-full rounded-ctl bg-white shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]"
          />
        </div>
      </div>
    </div>
  );
}
