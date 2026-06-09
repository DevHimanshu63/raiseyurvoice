import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import CopyClient from '@/components/CopyClient';

export const metadata = {
  title: 'Shukriya · Awaaz Uthao',
  description: 'Aapki awaaz hum tak pohch gayi hai.'
};

interface PageProps {
  searchParams: { ticket?: string };
}

export default function ThankYou({ searchParams }: PageProps) {
  const ticket = searchParams.ticket ?? '—';

  return (
    <section className="relative">
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-leaf/15 text-leaf">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          <span className="font-hindi block">शुक्रिया, आवाज़ हम तक पहुँच गई</span>
          <span className="mt-2 block gradient-text">Your voice has reached us</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-cream/70">
          Hamari team aapki kahani jaldi review karegi aur zaroorat hui to aapse
          contact karegi.
        </p>

        <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-ink-soft px-5 py-3 font-mono text-cream">
          <span className="text-xs text-cream/60">TICKET</span>
          <span className="font-bold tracking-wider">{ticket}</span>
          <CopyClient text={ticket} />
        </div>

        <p className="mt-3 text-xs text-cream/55">
          Yeh ticket ID save kar lena — aage baat karne mein kaam aayegi.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-ghost">
            Wapas home par
          </Link>
          <Link href="/submit" className="btn-primary">
            Ek aur complaint bhejo
          </Link>
        </div>
      </div>
    </section>
  );
}
