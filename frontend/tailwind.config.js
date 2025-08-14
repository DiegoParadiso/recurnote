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
        base: 1,
        low: 10,
        midLow: 15,
        mid: 25,
        high: 35,
        overlay: 45,
        modal: 75,
        floating: 105,
        toast: 9999,
      },
    },
  },
  plugins: [],
}