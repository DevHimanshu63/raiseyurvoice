import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Categories from '@/components/Categories';
import Privacy from '@/components/Privacy';
import Connect from '@/components/Connect';
import CallToAction from '@/components/CallToAction';

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Categories />
      <Privacy />
      <Connect />
      <CallToAction />
    </>
  );
}
