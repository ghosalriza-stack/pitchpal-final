/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1e293b',
        paper: '#ffffff',
        card: '#ffffff',
        rust: '#db2777',
        rustDark: '#be185d',
        teal: '#059669',
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          rose: '#e11d48',
          magenta: '#c026d3',
          violet: '#8b5cf6',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -5px rgba(219, 39, 119, 0.05), 0 2px 10px rgba(0, 0, 0, 0.02)',
        'glow-pink': '0 8px 30px -4px rgba(219, 39, 119, 0.25)',
      },
    },
  },
  plugins: [],
}
