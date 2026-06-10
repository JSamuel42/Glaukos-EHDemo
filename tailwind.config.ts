import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
    './lib/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        serif: {
          background:          'rgb(250 250 248 / <alpha-value>)',
          foreground:          'rgb(26 26 26 / <alpha-value>)',
          muted:               'rgb(245 243 240 / <alpha-value>)',
          'muted-foreground':  'rgb(107 107 107 / <alpha-value>)',
          accent:              'rgb(8 56 96 / <alpha-value>)',
          'accent-secondary':  'rgb(10 79 128 / <alpha-value>)',
          'accent-foreground': 'rgb(255 255 255 / <alpha-value>)',
          border:              'rgb(232 228 223 / <alpha-value>)',
          card:                'rgb(255 255 255 / <alpha-value>)',
          ring:                'rgb(8 56 96 / <alpha-value>)',
        },
        evhub: {
          navy:    '#0E1B2C',
          mint:    '#5DCAA5',
          purple:  '#AFA9EC',
          blue:    '#85B7EB',
        },
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:     ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
        mono:     ['var(--font-ibm-mono)', 'monospace'],
      },
      fontSize: {
        display:  ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        headline: ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        title:    ['1.25rem', { lineHeight: '1.3' }],
        label:    ['0.75rem', { lineHeight: '1', letterSpacing: '0.15em' }],
      },
      borderRadius: {
        'serif-sm': '4px',
        'serif-md': '6px',
        'serif-lg': '8px',
      },
      boxShadow: {
        'serif-sm': '0 1px 2px rgba(26,26,26,0.04)',
        'serif-md': '0 4px 12px rgba(26,26,26,0.06)',
        'serif-lg': '0 8px 24px rgba(26,26,26,0.08)',
      },
      transitionDuration: {
        serif: '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
