/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        ibm: ['IBM Plex Mono', 'monospace'],
      },
      zIndex: {
        'base': 'var(--z-base)',
        'low': 'var(--z-low)',
        'mid': 'var(--z-mid)',
        'high': 'var(--z-high)',
        'overlay': 'var(--z-overlay)',
        'modal': 'var(--z-modal)',
        'toast': 'var(--z-toast)',
        'fullboard': 'var(--z-fullboard, 12000)',
        'max': 'var(--z-max, 99999)',
        'floating': 'var(--z-floating)',
        'behind': 'var(--z-behind, -1)',
      },
    },
  },
  plugins: [],
}