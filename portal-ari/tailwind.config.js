/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F97316', 
          orangeHover: '#EA580C', 
          grayLight: '#F3F4F6', 
          grayBorder: '#D1D5DB',
          grayText: '#4B5563', 
        }
      }
    },
  },
  plugins: [],
}