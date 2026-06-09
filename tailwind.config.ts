import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0b0b0c',
          soft: '#17171a',
          muted: '#2a2a2f'
        },
        cream: '#f7f3ea',
        accent: {
          DEFAULT: '#e11d2e',
          dark: '#a8121f',
          glow: '#ff3a4c'
        },
        saffron: '#ff9933',
        leaf: '#138808'
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        hindi: ['var(--font-hindi)', 'Noto Sans Devanagari', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'grain':
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(225,29,46,0.55)' },
          '70%': { boxShadow: '0 0 0 18px rgba(225,29,46,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(225,29,46,0)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        pulseRing: 'pulseRing 2s ease-out infinite',
        marquee: 'marquee 30s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
