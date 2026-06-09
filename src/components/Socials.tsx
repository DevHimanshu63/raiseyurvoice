import { Youtube, Instagram, Facebook } from 'lucide-react';

const HANDLE = '@whattheyhidee';

export const SOCIAL_LINKS = {
  youtube: 'https://www.youtube.com/@WhatTheyHideee',
  instagram: 'https://www.instagram.com/whattheyhidee',
  facebook: 'https://www.facebook.com/share/1BKF6mXA5i/',
  threads: 'https://www.threads.com/@whattheyhidee'
} as const;

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.51 11.13c-.09-.04-.18-.08-.27-.12-.16-2.97-1.78-4.67-4.51-4.69h-.04c-1.63 0-2.99.7-3.83 1.96l1.5 1.03c.62-.94 1.6-1.14 2.33-1.14h.03c.91.01 1.6.27 2.04.79.32.37.54.89.65 1.54-.83-.14-1.73-.18-2.69-.12-2.7.16-4.43 1.73-4.32 3.92.06 1.11.61 2.07 1.55 2.69.79.53 1.81.79 2.87.73 1.4-.08 2.5-.61 3.27-1.59.58-.74.95-1.69 1.11-2.89.66.4 1.15.93 1.42 1.56.46 1.08.49 2.85-.95 4.29-1.26 1.26-2.78 1.81-5.07 1.83-2.54-.02-4.46-.83-5.71-2.41C5.65 16.04 5.04 13.99 5.01 12c.03-1.99.64-4.04 1.78-5.51C8.04 4.91 9.96 4.1 12.5 4.08c2.56.02 4.51.84 5.79 2.43.63.78 1.1 1.76 1.41 2.91l1.81-.49c-.38-1.41-.97-2.63-1.77-3.62C18.13 3.29 15.69 2.26 12.51 2.24h-.02c-3.17.02-5.58 1.05-7.17 3.07C3.91 7.13 3.18 9.45 3.15 12v.01c.03 2.54.76 4.86 2.17 6.69 1.59 2.02 4 3.05 7.17 3.07h.02c2.82-.02 4.81-.76 6.45-2.4 2.14-2.14 2.07-4.82 1.37-6.46-.51-1.19-1.45-2.14-2.82-2.78m-4.65 4.7c-1.17.07-2.39-.46-2.45-1.6-.04-.85.6-1.79 2.51-1.9.22-.01.43-.02.65-.02.69 0 1.34.07 1.94.2-.22 2.79-1.53 3.25-2.65 3.32" />
    </svg>
  );
}

const ICON_CLASS =
  'h-4.5 w-4.5 group-hover:scale-110 transition-transform';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export default function Socials({ size = 'md', showLabels = false, className = '' }: Props) {
  const dim =
    size === 'sm'
      ? 'h-9 w-9'
      : size === 'lg'
      ? 'h-12 w-12'
      : 'h-10 w-10';
  const iconSize =
    size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-[18px] w-[18px]';

  const items: { name: string; href: string; Icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
    {
      name: 'YouTube',
      href: SOCIAL_LINKS.youtube,
      Icon: Youtube,
      tone: 'hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/40'
    },
    {
      name: 'Instagram',
      href: SOCIAL_LINKS.instagram,
      Icon: Instagram,
      tone: 'hover:bg-pink-600/20 hover:text-pink-300 hover:border-pink-600/40'
    },
    {
      name: 'Facebook',
      href: SOCIAL_LINKS.facebook,
      Icon: Facebook,
      tone: 'hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-600/40'
    },
    {
      name: 'Threads',
      href: SOCIAL_LINKS.threads,
      Icon: ThreadsIcon,
      tone: 'hover:bg-white/15 hover:text-white hover:border-white/40'
    }
  ];

  if (showLabels) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {items.map(({ name, href, Icon, tone }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-cream/85 transition ${tone}`}
            aria-label={`${name} — ${HANDLE}`}
          >
            <Icon className={`${ICON_CLASS} h-4 w-4`} />
            {name}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {items.map(({ name, href, Icon, tone }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} — ${HANDLE}`}
          className={`group grid place-items-center rounded-full border border-white/10 bg-white/5 text-cream/85 transition ${dim} ${tone}`}
        >
          <Icon className={`${ICON_CLASS} ${iconSize}`} />
        </a>
      ))}
    </div>
  );
}

export { HANDLE };
