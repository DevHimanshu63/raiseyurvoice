import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(225,29,46,0.18),transparent_60%)]" />
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 md:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-cream/80">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          A citizen platform · Bharat ke har gaon, har shehar ke liye
        </div>

        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          <span className="block font-hindi text-4xl text-cream/95 md:text-5xl">
            तुम्हारी आवाज़, हमारी ज़िम्मेदारी
          </span>
          <span className="mt-3 block gradient-text">
            Raise the voice nobody else will.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/75 md:text-xl">
          Corruption ho, sarkari karmchari ki manmaani ho, police ka rawaiya ho,
          ya gaon ki koi anya samasya — apni baat sabut ke saath bhejo.
          Verify karne ke baad, hum aapki kahaani apne social media par sabke saamne laayenge.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link href="/submit" className="btn-primary text-base md:text-lg">
            Raise Your Voice
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/#how" className="btn-ghost text-base">
            Yeh kaise kaam karta hai?
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-cream/65">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-leaf" />
            Aapki pehchan tabhi public hogi jab aap permission do
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-cream/30 sm:inline-block" />
          <span>Free · Saral · Verified stories only</span>
        </div>
      </div>
    </section>
  );
}
