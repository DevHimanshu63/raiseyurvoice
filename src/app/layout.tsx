import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Tiro_Devanagari_Hindi } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickySocials from '@/components/StickySocials';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

const hindi = Tiro_Devanagari_Hindi({
  subsets: ['devanagari', 'latin'],
  weight: '400',
  variable: '--font-hindi',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Awaaz Uthao — Raise Your Voice',
  description:
    'Aapki awaaz, hamari zimmedari. Corruption, anyaya, ya kisi bhi samasya ko sabut ke saath bhejo — hum sabke saamne laayenge.',
  openGraph: {
    title: 'Awaaz Uthao — Raise Your Voice',
    description:
      'Send your story with proof. We will raise voices that nobody listens to.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${hindi.variable}`}>
      <body className="min-h-screen bg-ink font-sans text-cream antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grain opacity-[0.06]" />
        <Header />
        <StickySocials />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
