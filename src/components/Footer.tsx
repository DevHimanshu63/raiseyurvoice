import Link from 'next/link';
import Socials from './Socials';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-soft/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-display text-xl font-bold">Awaaz Uthao</div>
          <p className="mt-2 max-w-xs text-sm text-cream/65">
            Jo koi nahi sunta, hum sunenge. Apni samasya sabut ke saath bhejo —
            hum aapki kahaani sabke saamne laayenge.
          </p>
          <div className="mt-5">
            <div className="mb-2 text-xs uppercase tracking-wider text-cream/55">
              Follow @whattheyhidee
            </div>
            <Socials size="md" />
          </div>
        </div>

        <div className="text-sm">
          <div className="mb-3 font-semibold text-cream/85">Links</div>
          <ul className="space-y-2 text-cream/65">
            <li>
              <Link href="/submit" className="hover:text-cream">
                Submit a complaint
              </Link>
            </li>
            <li>
              <Link href="/#how" className="hover:text-cream">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/#privacy" className="hover:text-cream">
                Privacy &amp; safety
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-cream">
                Admin login
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <div className="mb-3 font-semibold text-cream/85">Important</div>
          <p className="text-cream/60">
            We are not a government agency or police. We are a citizen platform
            that documents stories and shares verified ones on social media.
            For emergencies, please dial <strong className="text-cream">112</strong>.
          </p>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-cream/45">
        © {new Date().getFullYear()} Awaaz Uthao · A project by{' '}
        <a
          href="https://www.youtube.com/@WhatTheyHideee"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-cream/70 hover:text-cream"
        >
          What They Hide
        </a>
        .
      </div>
    </footer>
  );
}
