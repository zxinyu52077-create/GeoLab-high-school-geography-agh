/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        elnino: {
          warm: '#ef4444',
          light: '#fca5a5',
          dark: '#b91c1c',
        },
        lanina: {
          cool: '#3b82f6',
          light: '#93c5fd',
          dark: '#1d4ed8',
        },
        neutral: {
          ocean: '#0ea5e9',
          normal: '#22c55e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 10s linear infinite',
        'wave': 'wave 2s ease-in-out infinite',
      },
      keyframes: {
        flow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
