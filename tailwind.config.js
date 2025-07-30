/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        expert: {
          primary: '#4361ee',
          secondary: '#3f37c9',
          accent: '#4895ef',
        }
      }
    },
  },
  plugins: [],
}