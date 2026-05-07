/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0D0D0D',
          900: '#0A0A0A',
          800: '#141414',
          700: '#1A1A1A'
        },
        emerald: {
          glow: '#34D399',
          DEFAULT: '#10B981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'monospace']
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        glow: '0 0 24px rgba(16,185,129,0.18)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.4)'
      }
    }
  },
  plugins: []
}
