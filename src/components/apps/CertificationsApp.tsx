'use client';

import { ArrowUpRight, SealCheck } from '@phosphor-icons/react';
import { AppHeader, Reveal } from '@/components/ui/Section';
import { certifications, certMeta, type Certification } from '@/data/portfolio';
import { trackPointer } from '@/lib/hooks';

export default function CertificationsApp() {
  return (
    <div className="mx-auto max-w-4xl">
      <AppHeader
        index="07"
        eyebrow={`${certifications.length} verified credentials`}
        title="Certifications"
        subtitle="Industry credentials across cloud, data, AI, Kubernetes and containers."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((c, i) => (
          <Reveal key={c.id} delay={(i % 3) * 0.08}>
            <CertCard cert={c} index={i} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/** Credential plate: logo seal, serif title, mono metadata, verify link. */
function CertCard({ cert: c, index }: { cert: Certification; index: number }) {
  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={trackPointer}
      className="card card-hover spotlight ticks press-soft press ripple-host group flex h-full flex-col p-5"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-ctl bg-white transition-transform duration-500 ease-spring group-hover:scale-110 ${c.logoFit === 'contain' ? 'p-2' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.logo} alt={`${c.issuer} logo`} className={`h-full w-full ${c.logoFit === 'cover' ? 'object-cover' : 'object-contain'}`} />
        </div>
        <span className="font-mono text-[10.5px] text-ink-faint">No.{String(index + 1).padStart(2, '0')}</span>
      </div>

      <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
        {certMeta(c)}
        {c.expires && <span> · exp. {c.expires}</span>}
      </p>
      <h3 className="display mt-1.5 text-[24px] leading-[1.08] text-ink">{c.name}</h3>
      <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">{c.description}</p>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap gap-1.5">
          {c.skills.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ok">
            <SealCheck size={14} weight="fill" /> Verified
          </span>
          <span className="flex items-center gap-1 text-[12px] text-ink-muted transition-colors group-hover:text-accent">
            Credential
            <ArrowUpRight size={13} weight="bold" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
        {c.credentialId && (
          <p className="mt-2 truncate font-mono text-[10px] text-ink-faint" title={c.credentialId}>
            ID {c.credentialId}
          </p>
        )}
      </div>
    </a>
  );
}
