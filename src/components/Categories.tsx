import { CATEGORY_LABELS, type SubmissionCategory } from '@/lib/types';
import {
  Banknote,
  Building2,
  ShieldAlert,
  Stethoscope,
  GraduationCap,
  Lightbulb,
  LandPlot,
  HeartHandshake,
  CircleEllipsis
} from 'lucide-react';

const ICONS: Record<SubmissionCategory, React.ComponentType<{ className?: string }>> = {
  corruption: Banknote,
  government_official: Building2,
  police: ShieldAlert,
  healthcare: Stethoscope,
  education: GraduationCap,
  civic: Lightbulb,
  land_property: LandPlot,
  women_safety: HeartHandshake,
  other: CircleEllipsis
};

export default function Categories() {
  const keys = Object.keys(CATEGORY_LABELS) as SubmissionCategory[];
  return (
    <section id="categories" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10">
          <div className="chip mb-3">Kis tarah ki samasya?</div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Har anyaya ki sunwai zaroori hai
          </h2>
          <p className="mt-2 max-w-2xl text-cream/65">
            Aap ki samasya in mein se kisi ek mein aati hai? Niche ek baar
            dekhiye, fir form bhar dijiye.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {keys.map((k) => {
            const Icon = ICONS[k];
            const label = CATEGORY_LABELS[k];
            return (
              <div
                key={k}
                className="group rounded-2xl border border-white/10 bg-ink-soft p-4 transition hover:border-accent/40 hover:bg-ink-muted"
              >
                <Icon className="mb-3 h-6 w-6 text-accent-glow" />
                <div className="font-hindi text-base text-cream/95">{label.hi}</div>
                <div className="text-xs uppercase tracking-wider text-cream/55">
                  {label.en}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
