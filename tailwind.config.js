/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-pink': {
          DEFAULT: '#ff1493',
          50: '#fff0f7',
          100: '#ffe3f1',
          200: '#ffc6e4',
          300: '#ff98cc',
          400: '#ff5aa8',
          500: '#ff1493',
          600: '#f0006d',
          700: '#d10058',
          800: '#ad0049',
          900: '#8f0040',
          950: '#580022',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-glow': '0 20px 50px rgba(255, 20, 147, 0.15)',
        'neon-glow-sm': '0 10px 30px rgba(255, 20, 147, 0.1)',
        'neon-glow-lg': '0 25px 60px rgba(255, 20, 147, 0.2)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'marquee': 'marquee 30s linear infinite',
        'pulse-pink': 'pulse-pink 2s ease-in-out infinite',
      },
      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-pink': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 20, 147, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255, 20, 147, 0)' },
        },
      },
    },
  },
  plugins: [],
}
