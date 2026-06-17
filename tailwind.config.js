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
      },
      animation: {
        "meteor-effect": "meteor 5s linear infinite",
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
