/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1e50a0',
          light: '#e8f0fb',
        },
      },
    },
  },
  plugins: [],
};
