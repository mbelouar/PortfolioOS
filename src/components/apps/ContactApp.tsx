'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, CircleNotch, Copy, EnvelopeSimple, MapPin, PaperPlaneTilt, Phone, WarningCircle } from '@phosphor-icons/react';
import { useOS } from '@/components/os/OSContext';
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons';
import { AppHeader, Reveal } from '@/components/ui/Section';
import { profile } from '@/data/portfolio';
import type { AppProps } from './registry';

const LIMITS = { name: 100, email: 200, subject: 150, message: 5000 };

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactApp({ params, paramsKey = 0 }: AppProps) {
  const { notify } = useOS();
  const [form, setForm] = useState({ name: '', email: '', subject: params?.subject ?? '', message: '', company: '' });
  // Opened again with a subject (e.g. "Ask me about it" on a project): prefill it.
  const [seenKey, setSeenKey] = useState(paramsKey);
  if (paramsKey !== seenKey) {
    setSeenKey(paramsKey);
    if (params?.subject) setForm((f) => ({ ...f, subject: params.subject }));
  }
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      notify({ title: 'Email copied', body: profile.email, icon: <Check size={16} weight="bold" className="text-ok" /> });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '', company: '' });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Network error — check your connection and try again.');
    }
  };

  const channels = [
    { icon: EnvelopeSimple, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
    { icon: MapPin, label: 'Based in', value: profile.location },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <AppHeader
        index="08"
        eyebrow="Contact · reply within a day"
        title="Let's build something."
        subtitle="Internships, collaborations or a quick question. Write directly or use the form."
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        {/* Channels */}
        <Reveal className="flex flex-col">
          <p className="eyebrow mb-3">Direct line</p>
          <button
            onClick={copyEmail}
            className="press-soft press group border-y border-line py-5 text-left"
            aria-label="Copy email address"
          >
            <span className="display block break-all text-[26px] leading-tight text-ink transition-colors group-hover:text-accent sm:text-[30px]">
              {profile.email}
            </span>
            <span className="mt-2 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              {copied ? <Check size={12} weight="bold" className="text-ok" /> : <Copy size={12} />}
              {copied ? 'Copied to clipboard' : 'Click to copy'}
            </span>
          </button>

          <ul className="divide-y divide-line border-b border-line">
            {channels.slice(1).map((c) => {
              const Inner = (
                <>
                  <c.icon size={18} className="text-ink-faint transition-colors group-hover:text-accent" />
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{c.label}</span>
                    <span className="block truncate text-[14px] text-ink">{c.value}</span>
                  </span>
                </>
              );
              return (
                <li key={c.label}>
                  {c.href ? (
                    <a href={c.href} className="press-soft press group flex items-center gap-4 py-4">
                      {Inner}
                      <ArrowUpRight size={14} className="ml-auto text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  ) : (
                    <div className="group flex items-center gap-4 py-4">{Inner}</div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn-secondary justify-between">
              <span className="flex items-center gap-2">
                <LinkedinIcon size={16} /> LinkedIn
              </span>
              <ArrowUpRight size={12} weight="bold" />
            </a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn-secondary justify-between">
              <span className="flex items-center gap-2">
                <GithubIcon size={16} /> GitHub
              </span>
              <ArrowUpRight size={12} weight="bold" />
            </a>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={0.1} className="card relative overflow-hidden p-6">
          <AnimatePresence mode="wait" initial={false}>
            {status === 'sent' ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-[380px] flex-col items-center justify-center text-center"
              >
                <motion.span
                  initial={{ scale: 0.3, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-[#170a03]"
                >
                  <Check size={30} weight="bold" />
                </motion.span>
                <h3 className="display text-[34px] leading-none">Message sent</h3>
                <p className="mt-3 max-w-xs text-sm text-ink-muted">Thanks for reaching out. I&apos;ll get back to you soon.</p>
                <button onClick={() => setStatus('idle')} className="btn-secondary mt-7">
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field n="01" label="Name">
                    <input name="name" value={form.name} onChange={update} required maxLength={LIMITS.name} autoComplete="name" placeholder="Jane Doe" className="input" />
                  </Field>
                  <Field n="02" label="Email">
                    <input name="email" type="email" value={form.email} onChange={update} required maxLength={LIMITS.email} autoComplete="email" placeholder="jane@company.com" className="input" />
                  </Field>
                </div>
                <Field n="03" label="Subject">
                  <input name="subject" value={form.subject} onChange={update} required maxLength={LIMITS.subject} placeholder="Internship opportunity" className="input" />
                </Field>
                <Field n="04" label="Message" counter={`${form.message.length}/${LIMITS.message}`}>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={update}
                    required
                    rows={6}
                    maxLength={LIMITS.message}
                    placeholder="Tell me about your team, project or idea…"
                    className="input resize-none"
                  />
                </Field>
                {/* Honeypot — hidden from people, irresistible to bots */}
                <input
                  name="company"
                  value={form.company}
                  onChange={update}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />

                <AnimatePresence>
                  {status === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      role="alert"
                      className="flex items-start gap-2 overflow-hidden rounded-ctl px-3 py-2.5 text-[13px] text-bad shadow-[inset_0_0_0_1px_rgb(var(--bad)/0.35)]"
                    >
                      <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={status === 'sending'} className="btn-primary group w-full !py-3.5">
                  {status === 'sending' ? (
                    <>
                      <CircleNotch size={16} weight="bold" className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send message
                      <PaperPlaneTilt size={16} weight="bold" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </div>
  );
}

function Field({ n, label, counter, children }: { n: string; label: string; counter?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">
        <span className="text-accent">{n}</span>
        {label}
        {counter && <span className="ml-auto text-ink-faint">{counter}</span>}
      </span>
      {children}
    </label>
  );
}
