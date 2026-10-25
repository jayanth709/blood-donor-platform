/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      colors: {
        red: {
          primary: '#dc1a3c',
          deep: '#9f0e27',
          450: '#f04060',
        },
        dark: {
          bg: '#050810',
          card: '#0b0f1f',
          border: 'rgba(255,255,255,0.07)',
        },
      },
      animation: {
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
        'blood-float': 'blood-float 6s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite',
        scan: 'scan 3s linear infinite',
        emergency: 'emergency-pulse 2s infinite',
        'ticker-scroll': 'ticker-scroll 30s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '56%': { transform: 'scale(1)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
