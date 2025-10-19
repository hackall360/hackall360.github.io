const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: {
          light: colors.cyan[400],
          DEFAULT: colors.cyan[500],
          dark: colors.blue[500]
        },
        surface: {
          DEFAULT: '#020617',
          elevated: '#0f172a',
          highlight: '#11203f'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'tech-grid':
          'linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.08) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
