/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-primary': '#2C3E50',
        'game-secondary': '#3498DB',
        'game-accent': '#E74C3C',
      }
    },
  },
  plugins: [],
}
