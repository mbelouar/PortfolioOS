import type { Config } from 'tailwindcss';

/**
 * "Blueprint" design tokens: warm graphite surfaces, bone ink, one signal-orange accent.
 * Radii are deliberately small and consistent (6 / 10 / 14), shadows are rare and deep.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink) / 0.66)',
          faint: 'rgb(var(--ink) / 0.44)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          soft: 'rgb(var(--accent) / 0.12)',
        },
        ok: 'rgb(var(--ok) / <alpha-value>)',
        bad: 'rgb(var(--bad) / <alpha-value>)',
        base: 'rgb(var(--base) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised) / <alpha-value>)',
          sunken: 'rgb(var(--surface-sunken) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--ink) / 0.09)',
          strong: 'rgb(var(--ink) / 0.18)',
        },
      },
      borderRadius: {
        ctl: '6px',
        card: '10px',
        win: '14px',
      },
      boxShadow: {
        window: '0 0 0 1px rgb(0 0 0 / 0.6), 0 50px 120px -30px rgb(0 0 0 / 0.9), 0 18px 40px -18px rgb(0 0 0 / 0.7)',
        'window-inactive': '0 0 0 1px rgb(0 0 0 / 0.5), 0 30px 70px -30px rgb(0 0 0 / 0.75)',
        popover: '0 0 0 1px rgb(var(--ink) / 0.12), 0 28px 60px -16px rgb(0 0 0 / 0.85)',
        glow: '0 0 0 1px rgb(var(--accent) / 0.55), 0 0 24px -4px rgb(var(--accent) / 0.55)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        blink: { '0%, 49%': { opacity: '1' }, '50%, 100%': { opacity: '0' } },
        pulse2: { '0%, 100%': { opacity: '0.45' }, '50%': { opacity: '1' } },
        ripple: { from: { transform: 'translate(-50%, -50%) scale(0)', opacity: '0.45' }, to: { transform: 'translate(-50%, -50%) scale(1)', opacity: '0' } },
        scan: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(100%)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        blink: 'blink 1.1s step-end infinite',
        pulse2: 'pulse2 2.2s ease-in-out infinite',
        ripple: 'ripple 650ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        scan: 'scan 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
