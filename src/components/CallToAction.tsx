import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/20 via-ink-soft to-ink p-10 md:p-16">
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-saffron/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-bold leading-tight md:text-5xl">
              <span className="font-hindi block text-cream">
                अब चुप मत रहो।
              </span>
              <span className="mt-2 block gradient-text">Speak. With proof.</span>
            </h2>
            <p className="mt-5 text-cream/75 md:text-lg">
              Aapki ek complaint kisi ki zindagi badal sakti hai. Ek photo,
              ek video, ek FIR copy — sab zaroori hai.
            </p>
            <Link href="/submit" className="btn-primary mt-7 text-base md:text-lg">
              Submit your story
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
