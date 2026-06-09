import SubmissionForm from '@/components/SubmissionForm';

export const metadata = {
  title: 'Apni baat bhejo · Awaaz Uthao',
  description:
    'Apni samasya, gaon, district aur sabut ke saath bhejo. Hum aapki kahaani sabke saamne laayenge.'
};

export default function SubmitPage() {
  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(225,29,46,0.18),transparent_70%)]" />
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="mb-10 text-center">
          <div className="chip mx-auto mb-4">Step into the spotlight</div>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            <span className="font-hindi block">अपनी आवाज़ उठाओ</span>
            <span className="gradient-text mt-2 block">Raise your voice</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/70">
            Bilkul honestly bhar do. Aap ki har baat private hai jab tak aap
            khud public karne ki anumati nahi dete.
          </p>
        </div>

        <SubmissionForm />
      </div>
    </section>
  );
}
