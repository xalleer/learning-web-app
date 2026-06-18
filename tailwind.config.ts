import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0F',
          surface: '#111118',
          elevated: '#1A1A27',
        },
        border: {
          DEFAULT: '#1E1E2E',
          hover: '#2D2D42',
        },
        accent: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          muted: '#6366F120',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,.24), 0 24px 80px rgba(0,0,0,.38)',
      },
    },
  },
  plugins: [],
} satisfies Config;
