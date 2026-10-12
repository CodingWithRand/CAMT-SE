import type { Metadata, Viewport } from 'next';
import { Caprasimo, Figtree, Fredoka, Noto_Sans_Thai } from 'next/font/google';
import './globals.css';

const caprasimo = Caprasimo({ weight: '400', subsets: ['latin'], variable: '--font-caprasimo' });
const figtree = Figtree({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-figtree' });
// Rounded display face for the brand name, close to the lettering in the logo.
const fredoka = Fredoka({ weight: ['600', '700'], subsets: ['latin'], variable: '--font-brand' });
const notoThai = Noto_Sans_Thai({ weight: ['400', '500', '600', '700'], subsets: ['thai'], variable: '--font-noto-thai' });

export const metadata: Metadata = {
  title: 'WhongNaiMor',
  description: 'ชุมชนออนไลน์ของนักศึกษาและบุคลากร มช.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${caprasimo.variable} ${figtree.variable} ${fredoka.variable} ${notoThai.variable}`}>
      <body>{children}</body>
    </html>
  );
}
