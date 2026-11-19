/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'spectral': ['Spectral', 'Georgia', 'serif'],
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        'medium-green': '#1a8917',
      },
      lineHeight: {
        'tight': '1.2',
        'relaxed': '1.6',
        'loose': '1.8',
      },
      letterSpacing: {
        'tighter': '-0.003em',
      },
    },
  },
  plugins: [],
}
