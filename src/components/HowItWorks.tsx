import { FilePlus2, ShieldCheck, Megaphone } from 'lucide-react';

const steps = [
  {
    icon: FilePlus2,
    titleHi: '1. अपनी बात लिखो',
    titleEn: 'Tell us what happened',
    body:
      'Apna naam, gaon, district, aur samasya ka pura vivaran do. Photos, videos ya documents — jo bhi sabut ho, upload karo. Sab kuch private rehta hai.'
  },
  {
    icon: ShieldCheck,
    titleHi: '2. हम जांच करते हैं',
    titleEn: 'We verify the story',
    body:
      'Hamari team aapse contact karegi, sabut review karegi, aur agar zaroorat ho toh ground par confirmation lega. Bina verification ke, kuch bhi public nahi hota.'
  },
  {
    icon: Megaphone,
    titleHi: '3. आवाज़ हर जगह पहुँचेगी',
    titleEn: 'Your voice reaches lakhs',
    body:
      'Verified kahani ko YouTube, Instagram, aur dusre social media par share kiya jaata hai. Authorities tak pressure pohchta hai aur insaaf ke chance badhte hain.'
  }
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="chip mb-3">Process</div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Yeh kaise kaam karta hai
            </h2>
            <p className="mt-2 max-w-xl text-cream/65">
              Teen seedhe step — sabkuch transparent, sabkuch verified.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="card relative overflow-hidden">
              <div className="absolute right-4 top-4 font-display text-6xl font-bold text-white/[0.04]">
                0{i + 1}
              </div>
              <div className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent-glow">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="font-hindi text-lg text-cream/95">{s.titleHi}</div>
              <div className="mb-2 text-sm uppercase tracking-wider text-cream/55">
                {s.titleEn}
              </div>
              <p className="text-sm leading-relaxed text-cream/70">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
