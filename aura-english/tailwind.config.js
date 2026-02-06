/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B5FE5',
          50: '#F0F0FE',
          100: '#E0E1FD',
          200: '#C1C4FB',
          300: '#A2A6F9',
          400: '#8389F7',
          500: '#5B5FE5',
          600: '#3A3FCE',
          700: '#2B2F9C',
          800: '#1C1F69',
          900: '#0E1037',
        },
        background: '#F8F9FC',
        surface: '#FFFFFF',
        text: {
          primary: '#1A1A2E',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      boxShadow: {
        'card': '0 4px 12px rgba(91, 95, 229, 0.1)',
        'card-hover': '0 8px 24px rgba(91, 95, 229, 0.15)',
      },
    },
  },
  plugins: [],
}

