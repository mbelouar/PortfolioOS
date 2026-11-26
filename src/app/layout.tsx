import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

const sans = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
const display = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Mohammed Belouarraq — Software Engineer',
  description:
    'Interactive desktop-style portfolio of Mohammed Belouarraq, Software Engineer focused on DevOps, Kubernetes, cloud infrastructure and AI evaluation.',
  keywords: ['portfolio', 'devops', 'cloud', 'kubernetes', 'docker', 'terraform', 'computer engineering'],
  authors: [{ name: 'Mohammed Belouarraq' }],
  openGraph: {
    title: 'Mohammed Belouarraq — Software Engineer',
    description: 'Interactive desktop-style portfolio — projects, skills, certifications and more.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d0e0b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
