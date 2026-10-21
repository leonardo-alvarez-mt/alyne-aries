/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: { '8xl': '88rem' },
      colors: {
        brand: {
          50:  '#F7FAFD',
          100: '#F2F7FD',
          200: '#BFD9F4',
          300: '#80B3E8',
          400: '#408DDE',
          500: '#0067D2',
          600: '#004D9E',
          700: '#003368',
          800: '#001A35',
          900: '#00050B',
        },
        neutral: {
          0:   '#FFFFFF', 50:  '#F8FAFC', 100: '#F2F4F7',
          200: '#E4E7EC', 300: '#D0D5DD', 400: '#98A2B3', 500: '#667085',
          600: '#475467', 700: '#344054', 800: '#1D2939', 900: '#0B1F3A',
        },
        grey: { 200: '#EBEBEB', 300: '#E0E0E0', 800: '#666666', 900: '#212121' },
        'cool-grey': {
          50: '#F7F7F7', 100: '#F9FAFC', 200: '#E3E9EF', 300: '#C7D3DF',
          400: '#ABBDCF', 500: '#8FA7BF', 600: '#6B7D8F', 700: '#47535F', 800: '#242A30',
          900: '#07080A', surface: '#F0F0F5',
        },
        purple: { 500: '#6366f1', 600: '#4f46e5', 700: '#6366f133', 800: '#6366f11a' },
        indigo: { 100: '#edebfe' },
        blue: { 400: '#408DDE', 500: '#0067D2' },
        green: { 750: '#00774E' },
        'product-green': { 100: '#F3FBF3' },
        black: { 100: '#00050B' },
      },
    },
  },
  plugins: [],
};
