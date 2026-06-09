import Socials, { SOCIAL_LINKS } from './Socials';
import { Youtube } from 'lucide-react';

export default function Connect() {
  return (
    <section id="connect" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-10 rounded-3xl border border-white/10 bg-ink-soft p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
          <div>
            <div className="chip mb-3">Mujhse judo</div>
            <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
              <span className="font-hindi block">मैं हूँ —</span>
              <span className="gradient-text mt-1 block">What They Hide</span>
            </h2>
            <p className="mt-4 max-w-lg text-cream/70">
              YouTube par main wahi kahaaniyan dikhata hoon jo mainstream media
              chhupa deta hai. Aap ki bheji hui story bhi yahan tak pohchegi —
              follow karo taaki update miss na ho.
            </p>

            <div className="mt-6">
              <Socials size="lg" />
            </div>

            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-7 inline-flex bg-red-600 hover:bg-red-700 shadow-red-600/30"
            >
              <Youtube className="h-5 w-5" />
              Subscribe on YouTube
            </a>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-[radial-gradient(50%_50%_at_50%_50%,rgba(225,29,46,0.25),transparent_70%)]" />
            <div className="rounded-2xl border border-white/10 bg-ink p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-red-600/15 text-red-400">
                  <Youtube className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold">What They Hide</div>
                  <div className="text-xs text-cream/55">@whattheyhidee</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-cream/75">
                &ldquo;Mainstream nahi dikhata? Main dikhaunga. Sabut ke saath.&rdquo;
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-cream/60">
                <li>· Ground reports from across India</li>
                <li>· Verified citizen stories</li>
                <li>· Updates on every complaint we publish</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
