/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D91F26',
          600: '#D91F26',
          700: '#811217',
          800: '#811316',
          900: '#731014'
        },
        
      },
      gridTemplateColumns: {
        '11': 'repeat(11, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '11': 'repeat(11, minmax(0, 1fr))',
      },
    },
    // Change to font Montserrat
    fontFamily: {
      'montserrat': ['Montserrat', 'sans-serif'],
    },
  },
  plugins: [],
}

