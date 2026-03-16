/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Font families and colors are defined in src/index.css @theme block.
      // Only extend with values not covered there.
    }
  },
  plugins: [],
}
