/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'green-dark': '#1e3a2f',
        'green-mid': '#2d6a4f',
        'green-light': '#4a7c59',
      }
    }
  },
  plugins: [],
}
