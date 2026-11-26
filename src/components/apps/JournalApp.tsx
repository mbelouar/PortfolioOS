'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowsOut,
  ArrowUpRight,
  CaretDown,
  Flag,
  GitMerge,
  GitPullRequest,
  Globe,
  Microphone,
  PenNib,
  PlayCircle,
  PushPin,
  Trophy,
  type Icon,
} from '@phosphor-icons/react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons';
import Lightbox from '@/components/ui/Lightbox';
import { AppHeader, EmptyState, Reveal, Segmented } from '@/components/ui/Section';
import { journal, POST_TYPES, type Post, type PostType } from '@/data/journal';
import { trackPointer } from '@/lib/hooks';

const EASE = [0.22, 1, 0.36, 1] as const;

const TYPE_STYLE: Record<PostType, { icon: Icon }> = {
  opensource: { icon: GitPullRequest },
  achievement: { icon: Trophy },
  milestone: { icon: Flag },
  talk: { icon: Microphone },
  writing: { icon: PenNib },
};

const fmtDate = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, (m || 1) - 1, day || 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    ...(day ? { day: 'numeric' } : {}),
  });
};

type Filter = 'all' | PostType;

export default function JournalApp() {
  const [filter, setFilter] = useState<Filter>('all');

  const sorted = useMemo(
    () => [...journal].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.date.localeCompare(a.date)),
    [],
  );
  const visible = sorted.filter((p) => filter === 'all' || p.type === filter);

  // Only offer filters for types that actually have posts.
  const presentTypes = (Object.keys(POST_TYPES) as PostType[]).filter((t) => journal.some((p) => p.type === t));
  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    ...presentTypes.map((t) => ({ value: t as Filter, label: POST_TYPES[t].plural })),
  ];

  // Group by year, keeping pinned posts in their own group at the top.
  const groups = useMemo(() => {
    const out: { key: string; label: string; posts: Post[] }[] = [];
    for (const p of visible) {
      const key = p.pinned && filter === 'all' ? 'pinned' : p.date.slice(0, 4);
      let g = out.find((x) => x.key === key);
      if (!g) out.push((g = { key, label: key === 'pinned' ? 'Pinned' : key, posts: [] }));
      g.posts.push(p);
    }
    return out;
  }, [visible, filter]);

  const counts = presentTypes.map((t) => ({ type: t, n: journal.filter((p) => p.type === t).length }));

  return (
    <div className="mx-auto max-w-3xl">
      <AppHeader
        index="06"
        eyebrow="Contributions & milestones"
        title="Journal"
        subtitle="Open-source work, wins and moments worth writing down — newest first."
      />

      <div className="scrollbar-none -mx-1 -mt-4 mb-10 overflow-x-auto px-1">
        <Segmented
          value={filter}
          options={filters.map((f) => ({ ...f, count: f.value === 'all' ? journal.length : counts.find((c) => c.type === f.value)?.n }))}
          onChange={setFilter}
        />
      </div>

      <div className="relative">

        <AnimatePresence mode="popLayout" initial={false}>
          {groups.map((g) => (
            <motion.section key={`${filter}-${g.key}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="sticky top-0 z-10 -mx-1 mb-4 flex items-center gap-3 bg-surface/95 px-1 py-2 backdrop-blur-sm">
                {g.key === 'pinned' && <PushPin size={16} weight="fill" className="text-accent" />}
                <h2 className="display text-[40px] leading-none text-ink">{g.label}</h2>
                <span aria-hidden className="h-px flex-1 bg-line" />
                <span className="font-mono text-[10.5px] text-ink-faint">{g.posts.length}</span>
              </div>
              <ol className="mb-12 space-y-5">
                {g.posts.map((p, i) => (
                  <PostEntry key={p.id} post={p} index={i} />
                ))}
              </ol>
            </motion.section>
          ))}
        </AnimatePresence>

        {visible.length === 0 && <EmptyState title="Nothing here yet" body="No entries of this kind so far. Check back soon." />}
      </div>
    </div>
  );
}

function PostEntry({ post: p, index }: { post: Post; index: number }) {
  const s = TYPE_STYLE[p.type];
  const Icon = s.icon;
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const isAward = p.type === 'achievement' && p.badge;

  return (
    <Reveal as="li" delay={Math.min(index, 3) * 0.05} className="relative">
      <article
        onPointerMove={trackPointer}
        className={`card card-hover spotlight ticks min-w-0 overflow-hidden ${isAward ? 'shadow-glow' : ''}`}
      >
        {p.image && (
          <button type="button" onClick={() => setZoom(true)} aria-label="Enlarge photo" className="group/photo relative block aspect-[16/9] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image.src}
              alt={p.image.alt}
              className="absolute inset-0 h-full w-full object-cover object-[50%_40%] transition-transform duration-700 ease-mac group-hover/photo:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-base/85 via-transparent to-transparent" />
            {p.image.caption && (
              <span className="absolute bottom-3 left-5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/85">{p.image.caption}</span>
            )}
            <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-ctl bg-base/80 text-ink opacity-0 transition-opacity group-hover/photo:opacity-100">
              <ArrowsOut size={14} weight="bold" />
            </span>
          </button>
        )}

        <div className="p-6">
          <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em]">
            <span className="flex items-center gap-1.5 text-accent">
              <Icon size={13} weight="bold" />
              {POST_TYPES[p.type].label}
            </span>
            <span className="h-px w-4 bg-line-strong" />
            <time className="text-ink-faint" dateTime={p.date}>
              {fmtDate(p.date)}
            </time>
          </div>

          <h3 className="display text-[28px] leading-[1.08] text-ink">{p.title}</h3>
          {p.badge && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-ctl bg-accent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#170a03]">
              <Trophy size={12} weight="fill" />
              {p.badge}
            </span>
          )}
          <p className="mt-3 text-[14px] leading-[1.7] text-ink-muted">{p.summary}</p>

          {p.contribution && <ContributionPanel c={p.contribution} />}

          {p.body && p.body.length > 0 && (
            <>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-2 text-[13.5px] leading-relaxed text-ink-muted">
                      {p.body.map((para) => (
                        <p key={para}>{para}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="press mt-3 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent hover:text-ink"
              >
                {expanded ? 'Show less' : 'Read more'}
                <CaretDown size={12} weight="bold" className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </>
          )}

          {(p.tags?.length || p.links?.length) && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {p.tags?.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.links?.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    <LinkIcon kind={l.kind} />
                    {l.label}
                    <ArrowUpRight size={12} weight="bold" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {p.image && (
        <Lightbox open={zoom} onClose={() => setZoom(false)} src={p.image.src} alt={p.image.alt} caption={p.image.caption ?? ''} />
      )}
    </Reveal>
  );
}

/** GitHub-style pull-request summary. */
function ContributionPanel({ c }: { c: NonNullable<Post['contribution']> }) {
  const status = {
    merged: { label: 'Merged', cls: 'bg-accent text-[#170a03]', icon: GitMerge },
    open: { label: 'Open', cls: 'bg-ok text-[#04160c]', icon: GitPullRequest },
    closed: { label: 'Closed', cls: 'bg-white/20 text-ink', icon: GitPullRequest },
  }[c.status];
  const StatusIcon = status.icon;
  const total = (c.additions ?? 0) + (c.deletions ?? 0);
  const addShare = total ? Math.round(((c.additions ?? 0) / total) * 5) : 0;

  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      className="press-soft press group mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-ctl bg-surface-sunken px-4 py-3 font-mono text-[12px] shadow-[inset_0_0_0_1px_rgb(var(--ink)/0.1)] transition-shadow hover:shadow-[inset_0_0_0_1px_rgb(var(--accent)/0.5)]"
    >
      <GithubIcon size={16} className="shrink-0 text-ink-muted" />
      <span className="min-w-0 truncate text-ink">
        {c.repo}
        {c.pr && <span className="text-ink-faint"> #{c.pr}</span>}
      </span>
      <span className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-[10px] uppercase tracking-wider ${status.cls}`}>
        <StatusIcon size={12} weight="bold" />
        {status.label}
      </span>
      {total > 0 && (
        <span className="ml-auto flex items-center gap-2">
          <span className="text-ok">+{c.additions ?? 0}</span>
          <span className="text-bad">−{c.deletions ?? 0}</span>
          <span className="flex gap-0.5" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={`h-2 w-2 rounded-[2px] ${i < addShare ? 'bg-ok' : 'bg-bad'}`} />
            ))}
          </span>
        </span>
      )}
      <ArrowUpRight size={14} className="text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
    </a>
  );
}

function LinkIcon({ kind }: { kind?: string }) {
  if (kind === 'linkedin') return <LinkedinIcon size={14} />;
  if (kind === 'github') return <GithubIcon size={14} />;
  if (kind === 'video') return <PlayCircle size={14} />;
  return <Globe size={14} />;
}
