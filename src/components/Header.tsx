import Link from 'next/link';
import { Megaphone } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-accent text-white animate-pulseRing">
            <Megaphone className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold tracking-tight">
              Awaaz Uthao
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-cream/50">
              Raise Your Voice
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-cream/75 md:flex">
          <Link href="/#how" className="hover:text-cream">
            How it works
          </Link>
          <Link href="/#categories" className="hover:text-cream">
            Categories
          </Link>
          <Link href="/#connect" className="hover:text-cream">
            Connect
          </Link>
          <Link href="/submit" className="btn-primary px-5 py-2 text-sm">
            Raise Voice
          </Link>
        </nav>

        <Link href="/submit" className="btn-primary px-4 py-2 text-sm md:hidden">
          Raise Voice
        </Link>
      </div>
    </header>
  );
}
