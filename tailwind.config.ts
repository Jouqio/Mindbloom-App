import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // MindBloom brand colors
        brand: {
          purple:   '#7F77DD',
          teal:     '#1D9E75',
          coral:    '#D85A30',
          pink:     '#D4537E',
          amber:    '#EF9F27',
        },
        mood: {
          happy:    '#1D9E75',
          calm:     '#378ADD',
          excited:  '#EF9F27',
          anxious:  '#D85A30',
          stressed: '#E24B4A',
          emotional:'#7F77DD',
          tired:    '#888780',
        },
      },
      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 6px)',
        xl:  'calc(var(--radius) + 4px)',
        '2xl':'calc(var(--radius) + 8px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.55' },
          '50%':      { opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        shimmer:          'shimmer 1.4s ease-in-out infinite',
        'fade-in':        'fade-in 0.25s cubic-bezier(0, 0, 0.2, 1)',
        'scale-in':       'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        'xs':    '0 1px 2px rgba(0,0,0,0.04)',
        'focus': '0 0 0 3px rgba(127,119,221,0.20)',
        'brand': '0 0 0 3px rgba(127,119,221,0.18)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
