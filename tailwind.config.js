/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // or 'media' if you prefer OS-level settings
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          text: '#e0e0e0', // Lighter text for dark backgrounds
          background: '#1a202c', // Dark background
          primary: '#63b3ed', // Example primary color for dark mode
          secondary: '#9f7aea', // Example secondary color for dark mode
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
