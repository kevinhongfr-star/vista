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
        // LYC Brand Colors (aligned 2026-07-07)
        primary: {
          DEFAULT: '#1C1C1E',
          navy: '#1C1C1E',
          foreground: '#e8e8e8',
        },
        accent: {
          DEFAULT: '#C108AB',
          gold: '#C108AB',  // legacy alias — now fuchsia
          fuchsia: '#C108AB',
          hover: '#A00790',
        },
        background: {
          light: '#FFFFFF',
          dark: '#0F0F11',
        },
        surface: {
          light: '#ffffff',
          dark: '#1C1C1E',
        },
        text: {
          light: '#1C1C1E',
          dark: '#e8e8e8',
        },
        // Engagement Tier Colors
        tier: {
          cold: '#94a3b8',
          warm: '#3b82f6',
          engaged: '#22c55e',
          hot: '#f97316',
          committed: '#ef4444',
        },
        // Encirclement Level Colors
        encirclement: {
          scout: '#94a3b8',
          patrol: '#3b82f6',
          encirclement: '#a855f7',
          siege: '#f97316',
          occupation: '#ef4444',
        },
        // Status Colors
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
        info: '#3b82f6',
        // shadcn/ui semantic colors (CSS variables)
        shadcnBg: 'hsl(var(--background))',
        shadcnFg: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
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
    },
  },
  plugins: [],
}

export default config
