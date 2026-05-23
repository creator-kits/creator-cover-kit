/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        mist: '#f4f7fb',
        sand: '#fbfaf6',
        accent: '#ff7a59',
        teal: '#2f7c85',
      },
      boxShadow: {
        panel: '0 24px 80px rgba(23, 32, 51, 0.08)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Avenir Next"', '"Segoe UI"', 'sans-serif'],
        display: ['"Space Grotesk"', '"Avenir Next"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
