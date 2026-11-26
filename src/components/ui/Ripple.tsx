'use client';

import { useEffect } from 'react';

/**
 * One global listener gives every `.ripple-host` element (buttons, launcher tiles, cards)
 * a soft ink ripple from the exact press point. Skipped under reduced motion.
 */
export function useRipples() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onDown = (e: PointerEvent) => {
      const host = (e.target as HTMLElement | null)?.closest<HTMLElement>('.ripple-host, .btn, .btn-primary, .btn-secondary, .btn-ghost, .btn-icon');
      if (!host || host.matches(':disabled')) return;
      const r = host.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const dot = document.createElement('span');
      dot.className = 'ripple-dot';
      dot.style.width = dot.style.height = `${size}px`;
      dot.style.left = `${e.clientX - r.left}px`;
      dot.style.top = `${e.clientY - r.top}px`;
      host.appendChild(dot);
      window.setTimeout(() => dot.remove(), 700);
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);
}
