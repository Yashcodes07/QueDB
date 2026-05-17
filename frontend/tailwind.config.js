export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0a0a0f',
          secondary: '#111118',
          tertiary: '#1a1a24',
          card: '#16161f',
          hover: '#1e1e2a',
        },
        border: {
          DEFAULT: '#2a2a3a',
          subtle: '#1e1e2a',
          strong: '#3a3a50',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          muted: '#6366f120',
          border: '#6366f140',
        },
        success: { DEFAULT: '#10b981', muted: '#10b98120' },
        warning: { DEFAULT: '#f59e0b', muted: '#f59e0b20' },
        error:   { DEFAULT: '#ef4444', muted: '#ef444420' },
        text: {
          primary: '#f0f0ff',
          secondary: '#9090b0',
          muted: '#5a5a78',
        }
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease',
        'slide-up':   'slideUp 0.3s ease',
        'slide-in':   'slideIn 0.25s ease',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer':    'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-10px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      }
    }
  },
  plugins: []
}