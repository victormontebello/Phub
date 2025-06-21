/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Habilita modo escuro baseado em classe
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
          // Cores para tema escuro
          '50-dark': '#0f2f2c',
          '100-dark': '#134e4a',
          '500-dark': '#2dd4bf',
          '600-dark': '#14b8a6',
          '700-dark': '#0d9488',
          '900-dark': '#042f2e',
        },
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          // Cores para tema escuro
          '50-dark': '#451a03',
          '100-dark': '#7c2d12',
          '500-dark': '#fb923c',
          '600-dark': '#f97316',
          '700-dark': '#ea580c',
        },
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          // Cores para tema escuro
          '50-dark': '#2e1065',
          '100-dark': '#4c1d95',
          '500-dark': '#a78bfa',
          '600-dark': '#8b5cf6',
          '700-dark': '#7c3aed',
        },
        // Cores de fundo e texto para tema escuro
        background: {
          light: '#ffffff',
          dark: '#0f172a',
        },
        surface: {
          light: '#f8fafc',
          dark: '#1e293b',
        },
        text: {
          light: '#1e293b',
          dark: '#f1f5f9',
        },
        'text-secondary': {
          light: '#64748b',
          dark: '#94a3b8',
        },
        border: {
          light: '#e2e8f0',
          dark: '#334155',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
};