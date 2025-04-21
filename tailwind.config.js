/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: {
          400: '#1DCD9F',
          500: '#1ab890',
          600: '#169976',
          700: '#12805f',
          800: '#0e6b4e',
          900: '#0a583f',
        },
      },
    },
  },
  plugins: [],
} 