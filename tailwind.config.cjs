const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#e0faff',
          100: '#b5f2ff',
          200: '#82e9ff',
          300: '#4ddaf8',
          400: '#24c7eb',
          500: '#11b0d6',
          600: '#0a8cb1',
          700: '#0c6e8d',
          800: '#0f566f',
          900: '#0f455b',
          light: '#5eead4',
          DEFAULT: '#0ea5e9',
          dark: '#0369a1',
          neon: '#22d3ee'
        },
        surface: {
          DEFAULT: '#020617',
          elevated: '#0b1223',
          highlight: '#13213e',
          overlay: '#0f172a'
        },
        neutral: {
          soft: '#94a3b8',
          emphasis: '#cbd5f5'
        }
      },
      fontFamily: {
        sans: ['"Satoshi"', '"Inter"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"General Sans"', '"Space Grotesk"', 'system-ui', 'sans-serif']
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34, 211, 238, 0.3), 0 25px 50px -20px rgba(14, 165, 233, 0.45)',
        'inner-terminal': 'inset 0 0 0 1px rgba(14, 165, 233, 0.45), inset 0 15px 30px -15px rgba(34, 211, 238, 0.45)'
      },
      dropShadow: {
        glow: ['0 8px 20px rgba(34, 211, 238, 0.35)']
      },
      backgroundImage: {
        'tech-grid':
          'linear-gradient(rgba(37, 99, 235, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.08) 1px, transparent 1px)',
        'terminal-noise':
          'radial-gradient(circle at 15% 20%, rgba(14, 165, 233, 0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.08), transparent 60%)'
      },
      transitionTimingFunction: {
        'spring-out': 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      const accent = theme('colors.accent.neon');
      addUtilities(
        {
          '.glow-sheen': {
            boxShadow: `0 0 0 1px ${accent}40, 0 20px 45px -20px ${accent}80`
          },
          '.terminal-accent': {
            background:
              'linear-gradient(135deg, rgba(14, 165, 233, 0.16) 0%, rgba(14, 165, 233, 0.02) 60%), radial-gradient(circle at top left, rgba(34, 211, 238, 0.4), transparent 55%)',
            borderColor: `${accent}33`
          },
          '.focus-ring-accent': {
            outline: 'none',
            boxShadow: `0 0 0 2px rgba(15, 23, 42, 0.95), 0 0 0 4px ${accent}66`
          }
        },
        ['responsive', 'hover', 'focus', 'focus-visible']
      );
    })
  ]
};
