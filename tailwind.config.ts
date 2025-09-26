import type { Config } from 'tailwindcss';
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ['class'],
  content: ['pages/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        card: {
          DEFAULT: '#172554',
          foreground: '#e2e8f0',
        },
        primary: {
          DEFAULT: '#1d4ed8',
          foreground: '#f8fafc',
        },
        secondary: {
          DEFAULT: '#1f2937',
          foreground: '#e2e8f0',
        },
        muted: {
          DEFAULT: '#1e293b',
          foreground: '#cbd5f5',
        },
        accent: {
          DEFAULT: '#7c3aed',
          foreground: '#f8fafc',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#f8fafc',
        },
        border: '#334155',
        input: '#1e293b',
        ring: '#1d4ed8',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        aurora: {
          from: {
            backgroundPosition: '50% 50%, 50% 50%',
          },
          to: {
            backgroundPosition: '350% 50%, 350% 50%',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        aurora: 'aurora 60s linear infinite',
      },
    },
  },
  plugins: [animate],
};

export default config;
