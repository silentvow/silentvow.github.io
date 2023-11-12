/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      comic: ['"Comic Sans MS"', 'Comic Sans', 'Chalkboard', 'ChalkboardSE-Regular', 'cursive'],
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'bounce-text': {
          '0%': { transform: 'scale(1,1) translateY(0)' },
          '10%': { transform: 'scale(1.1,.9) translateY(0)' },
          '30%': { transform: 'scale(.9,1.1)   translateY(-55px)' },
          '50%': { transform: 'scale(1.05,.95) translateY(0)' },
          '58%': { transform: 'scale(1,1) translateY(-7px)' },
          '65%': { transform: 'scale(1,1) translateY(0)' },
          '100%': { transform: 'scale(1,1) translateY(0)' },
        },
      },
      animation: {
        'bounce-text': 'bounce 1s ease infinite',
      },
    },
  },
  plugins: [],
}
