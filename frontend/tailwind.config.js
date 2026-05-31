/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#A62D2D',
        'primary-dark': '#8B2424',
        'primary-light': '#C4433A',
        charcoal: '#222222',
        offwhite: '#F8F6F2',
        card: '#FFFFFF',
        secondary: '#6B7280',
        border: '#E5E7EB',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
