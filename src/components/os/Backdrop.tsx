'use client';

import { useEffect, useRef } from 'react';

/**
 * Wallpaper: blueprint grid + slowly shifting topographic contours.
 *
 * - The grid (8px fine / 40px bold) is pure CSS.
 * - Contours come from a smooth scalar field sampled on a coarse lattice and traced with
 *   marching squares on a canvas. Every fifth line is an accent "index contour".
 * - ~20fps, paused while the tab is hidden, a single static frame under reduced motion.
 */
const CELL = 16; // px between lattice samples
const LEVELS = 20;
const FPS = 20;

function field(x: number, y: number, t: number) {
  return (
    Math.sin(x * 0.9 + t * 0.07) * 0.9 +
    Math.sin(y * 1.15 - t * 0.05) * 0.8 +
    Math.sin((x + y) * 0.55 + t * 0.04) * 0.9 +
    Math.sin(Math.hypot(x - 2.6, y - 1.4) * 1.6 - t * 0.09) * 0.75 +
    Math.cos(x * 0.35 - y * 0.8 + t * 0.03) * 0.6
  );
}

export default function Backdrop({ dim = 0 }: { dim?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let vals = new Float32Array(0);
    let raf = 0;
    let last = 0;
    const t0 = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      vals = new Float32Array(cols * rows);
    };

    const draw = (t: number) => {
      const scale = 1 / 190;
      let min = Infinity;
      let max = -Infinity;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const v = field(i * CELL * scale, j * CELL * scale, t);
          vals[j * cols + i] = v;
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = 'round';

      for (let l = 1; l < LEVELS; l++) {
        const iso = min + ((max - min) * l) / LEVELS;
        const major = l % 5 === 0;
        ctx.beginPath();
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = vals[j * cols + i];
            const b = vals[j * cols + i + 1];
            const c = vals[(j + 1) * cols + i + 1];
            const d = vals[(j + 1) * cols + i];
            const code = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
            if (code === 0 || code === 15) continue;
            const x = i * CELL;
            const y = j * CELL;
            const top = () => [x + CELL * ((iso - a) / (b - a)), y] as const;
            const right = () => [x + CELL, y + CELL * ((iso - b) / (c - b))] as const;
            const bottom = () => [x + CELL * ((iso - d) / (c - d)), y + CELL] as const;
            const left = () => [x, y + CELL * ((iso - a) / (d - a))] as const;
            const seg = (p: readonly [number, number], q: readonly [number, number]) => {
              ctx.moveTo(p[0], p[1]);
              ctx.lineTo(q[0], q[1]);
            };
            switch (code) {
              case 1: case 14: seg(left(), bottom()); break;
              case 2: case 13: seg(bottom(), right()); break;
              case 3: case 12: seg(left(), right()); break;
              case 4: case 11: seg(top(), right()); break;
              case 6: case 9: seg(top(), bottom()); break;
              case 7: case 8: seg(left(), top()); break;
              case 5: seg(left(), top()); seg(bottom(), right()); break;
              case 10: seg(top(), right()); seg(left(), bottom()); break;
            }
          }
        }
        ctx.strokeStyle = major ? 'rgba(255,107,44,0.26)' : 'rgba(236,232,223,0.075)';
        ctx.lineWidth = major ? 1.1 : 0.9;
        ctx.stroke();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 1000 / FPS) return;
      last = now;
      draw((now - t0) / 1000);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced || document.hidden) {
        draw(30);
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    resize();
    start();
    const ro = new ResizeObserver(() => {
      resize();
      draw((performance.now() - t0) / 1000);
    });
    ro.observe(canvas);
    document.addEventListener('visibilitychange', start);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', start);
    };
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-base">
      {/* Blueprint grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(rgb(var(--ink) / 0.055) 1px, transparent 1px)',
            'linear-gradient(90deg, rgb(var(--ink) / 0.055) 1px, transparent 1px)',
            'linear-gradient(rgb(var(--ink) / 0.022) 1px, transparent 1px)',
            'linear-gradient(90deg, rgb(var(--ink) / 0.022) 1px, transparent 1px)',
          ].join(','),
          backgroundSize: '40px 40px, 40px 40px, 8px 8px, 8px 8px',
          backgroundPosition: '-1px -1px',
        }}
      />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      {/* Warm light falloff + edge shading for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 60% at 72% 40%, rgb(var(--accent) / 0.07), transparent 70%), radial-gradient(130% 100% at 50% 50%, transparent 55%, rgb(var(--base) / ${0.75 + dim}) 100%)`,
        }}
      />
      {dim > 0 && <div className="absolute inset-0" style={{ background: `rgb(var(--base) / ${dim})` }} />}
    </div>
  );
}
