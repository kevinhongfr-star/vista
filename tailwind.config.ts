import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // LYC Brand Palette — "McKinsey meets Soho House"
        primary: {
          DEFAULT: '#1A1A1A',
          navy: '#1C1C1E',
          foreground: '#e8e8e8',
        },
        accent: {
          DEFAULT: '#C108AB',
          fuchsia: '#C108AB',
          hover: '#A00790',
          5: '#c108ab08',
          10: '#c108ab1a',
          15: '#c108ab26',
          20: '#c108ab33',
          40: '#c108ab66',
          60: '#c108ab99',
          80: '#c108abcc',
          90: '#c108abe6',
        },
        teal: { DEFAULT: '#00897B', light: '#4DB6AC' },
        ocean: { DEFAULT: '#4FC3F7', deep: '#0288D1' },
        slate: { DEFAULT: '#607D8B' },
        blueGrey: { DEFAULT: '#B0BEC5' },
        bg: {
          DEFAULT: '#FAFAFA',
          warm: '#F7F6F4',
          alt: '#F5F5F5',
          tertiary: '#EDEDED',
        },
        border: {
          DEFAULT: '#E5E5E5',
          warm: '#E8E6E3',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#555555',
          muted: '#999999',
        },
        success: '#2d8a4e',
        warning: '#b8860b',
        error: '#c0392b',
        info: '#2c5282',
        tier: {
          cold: '#94a3b8',
          warm: '#3b82f6',
          engaged: '#22c55e',
          hot: '#f97316',
          committed: '#ef4444',
        },
        encirclement: {
          scout: '#94a3b8',
          patrol: '#3b82f6',
          encirclement: '#a855f7',
          siege: '#f97316',
          occupation: '#ef4444',
        },
        // shadcn/ui semantic colors (CSS variables)
        shadcnBg: 'hsl(var(--background))',
        shadcnFg: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-libre-baskerville)', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'glow-fuchsia': '0 0 20px rgba(193, 8, 171, 0.15)',
      },
    },
  },
  plugins: [],
}

export default config
