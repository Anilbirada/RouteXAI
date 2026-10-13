/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080B12',
        panel: '#111827',
        'panel-subtle': '#172033',
        'panel-border': '#1E293B',
        accent: {
          primary: '#38BDF8',
          secondary: '#6366F1',
          hover: '#0EA5E9',
        },
        traffic: {
          low: '#22C55E',
          moderate: '#F59E0B',
          heavy: '#F97316',
          severe: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
