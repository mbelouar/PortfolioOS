import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

interface AppIconProps {
  icon: PhosphorIcon;
  size?: number;
  /** Lit state: accent ink and frame (running / focused apps). */
  active?: boolean;
  className?: string;
}

/**
 * Launcher tile: a square graphite plate with a hairline frame and a single Phosphor glyph.
 * Every app shares the same weight and proportions; only the active state adds colour.
 */
export default function AppIcon({ icon: Icon, size = 44, active = false, className = '' }: AppIconProps) {
  const glyph = Math.round(size * 0.46);
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center transition-[color,box-shadow,background-color] duration-300 ${
        active ? 'text-accent' : 'text-ink/85'
      } ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(4, Math.round(size * 0.2)),
        background: active ? 'rgb(var(--accent) / 0.1)' : 'rgb(var(--surface-raised))',
        boxShadow: active
          ? 'inset 0 0 0 1px rgb(var(--accent) / 0.55), 0 0 18px -6px rgb(var(--accent) / 0.7)'
          : 'inset 0 0 0 1px rgb(var(--ink) / 0.12), inset 0 1px 0 rgb(var(--ink) / 0.06)',
      }}
    >
      <Icon size={glyph} weight={active ? 'fill' : 'regular'} />
    </span>
  );
}
