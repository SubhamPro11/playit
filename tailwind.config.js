/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        navy: {
          950: '#070a12',
          900: '#0b0f19',
          850: '#0f172a',
          800: '#131d33',
          700: '#1e293b',
          600: '#334155',
        },
        lime: {
          400: '#a3e635',
          500: '#84cc16',
        }
      },
    },
  },
  plugins: [],
}
