/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
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
      boxShadow: {
        'glow-pink': '0 8px 30px -4px rgba(219, 39, 119, 0.25)',
        'glow-subtle': '0 10px 40px -10px rgba(219, 39, 119, 0.08), 0 2px 10px rgba(0, 0, 0, 0.02)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #e11d48 0%, #db2777 50%, #c026d3 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #db2777 100%)',
        'subtle-mesh': 'radial-gradient(at 0% 0%, rgba(253, 242, 248, 0.9) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(245, 243, 255, 0.9) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(254, 242, 242, 0.6) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(236, 254, 255, 0.8) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(250, 245, 255, 0.9) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}
