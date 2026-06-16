/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        primary: {
          DEFAULT: '#0068f9',
          hover: '#0052cc',
        },
        navy: '#0A1628',
      },
      borderRadius: {
        '2xl': '1rem', // 16px
      },
      borderWidth: {
        'avatar': 'var(--avatar-border)',
      },
      height: {
        'banner': 'var(--banner-height)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
