module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          200: '#f9f8f4',
          300: '#f4f1ea',
          400: '#dcd6cc',
          500: '#d6d0c4',
          800: '#372213',
        },
      },
    },

    fontFamily: {
      sans: ['Inter var', 'Inter', 'sans-serif'],
      serif: ['"Source Serif Pro"', 'serif'],
    },
  },
  plugins: [],
}
