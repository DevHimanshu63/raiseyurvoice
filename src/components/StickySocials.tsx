import { Youtube, Instagram, Facebook } from 'lucide-react';
import { SOCIAL_LINKS } from './Socials';

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.51 11.13c-.09-.04-.18-.08-.27-.12-.16-2.97-1.78-4.67-4.51-4.69h-.04c-1.63 0-2.99.7-3.83 1.96l1.5 1.03c.62-.94 1.6-1.14 2.33-1.14h.03c.91.01 1.6.27 2.04.79.32.37.54.89.65 1.54-.83-.14-1.73-.18-2.69-.12-2.7.16-4.43 1.73-4.32 3.92.06 1.11.61 2.07 1.55 2.69.79.53 1.81.79 2.87.73 1.4-.08 2.5-.61 3.27-1.59.58-.74.95-1.69 1.11-2.89.66.4 1.15.93 1.42 1.56.46 1.08.49 2.85-.95 4.29-1.26 1.26-2.78 1.81-5.07 1.83-2.54-.02-4.46-.83-5.71-2.41C5.65 16.04 5.04 13.99 5.01 12c.03-1.99.64-4.04 1.78-5.51C8.04 4.91 9.96 4.1 12.5 4.08c2.56.02 4.51.84 5.79 2.43.63.78 1.1 1.76 1.41 2.91l1.81-.49c-.38-1.41-.97-2.63-1.77-3.62C18.13 3.29 15.69 2.26 12.51 2.24h-.02c-3.17.02-5.58 1.05-7.17 3.07C3.91 7.13 3.18 9.45 3.15 12v.01c.03 2.54.76 4.86 2.17 6.69 1.59 2.02 4 3.05 7.17 3.07h.02c2.82-.02 4.81-.76 6.45-2.4 2.14-2.14 2.07-4.82 1.37-6.46-.51-1.19-1.45-2.14-2.82-2.78m-4.65 4.7c-1.17.07-2.39-.46-2.45-1.6-.04-.85.6-1.79 2.51-1.9.22-.01.43-.02.65-.02.69 0 1.34.07 1.94.2-.22 2.79-1.53 3.25-2.65 3.32" />
    </svg>
  );
}

const items: {
  name: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
}[] = [
  {
    name: 'YouTube',
    href: SOCIAL_LINKS.youtube,
    Icon: Youtube,
    tone: 'hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-red-600/40'
  },
  {
    name: 'Instagram',
    href: SOCIAL_LINKS.instagram,
    Icon: Instagram,
    tone:
      'hover:bg-gradient-to-br hover:from-pink-500 hover:via-fuchsia-600 hover:to-orange-500 hover:text-white hover:border-pink-500 hover:shadow-pink-500/40'
  },
  {
    name: 'Facebook',
    href: SOCIAL_LINKS.facebook,
    Icon: Facebook,
    tone: 'hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-blue-600/40'
  },
  {
    name: 'Threads',
    href: SOCIAL_LINKS.threads,
    Icon: ThreadsIcon,
    tone: 'hover:bg-white hover:text-ink hover:border-white hover:shadow-white/30'
  }
];

export default function StickySocials() {
  return (
    <aside
      aria-label="Connect on social media"
      className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 md:block lg:right-5"
    >
      <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-full border border-white/10 bg-ink-soft/80 p-2 shadow-xl shadow-black/40 backdrop-blur">
        <span className="my-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-cream/55 [writing-mode:vertical-rl]">
          Follow
        </span>
        {items.map(({ name, href, Icon, tone }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            title={name}
            className={`group grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-cream/85 shadow-md shadow-black/20 transition-all duration-200 hover:scale-110 hover:shadow-lg ${tone}`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        ))}
      </div>
    </aside>
  );
}
