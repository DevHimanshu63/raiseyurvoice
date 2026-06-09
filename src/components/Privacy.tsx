import { Lock, EyeOff, UserCheck, AlertTriangle } from 'lucide-react';

const points = [
  {
    icon: Lock,
    title: 'Aapka data, aapke control mein',
    body:
      'Phone number aur personal details sirf verification ke liye use hote hain. Bina aap ki anumati ke kuch public nahi hota.'
  },
  {
    icon: EyeOff,
    title: 'Anonymous bhi reh sakte ho',
    body:
      'Form mein chuno — kya aap apna naam dikhana chahte ho ya story sirf anonymously share ho. Faisla aap ka hai.'
  },
  {
    icon: UserCheck,
    title: 'Sirf verified kahaani',
    body:
      'Bina sabut ke aur bina verification ke kuch bhi publish nahi hota. Fake complaint koi nuksaan nahi pohcha sakta.'
  },
  {
    icon: AlertTriangle,
    title: 'Hum police nahi hain',
    body:
      'Yeh ek media platform hai — court ya police ki jagah nahi. Emergency mein 112 dial karein. FIR ke liye apne nazdiki thane se sampark karein.'
  }
];

export default function Privacy() {
  return (
    <section id="privacy" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10">
          <div className="chip mb-3">Privacy &amp; Safety</div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Aap surakshit ho. Aap ki kahani surakshit hai.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {points.map((p, i) => (
            <div key={i} className="card flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-leaf/15 text-leaf">
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-cream">{p.title}</h3>
                <p className="text-sm leading-relaxed text-cream/70">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
