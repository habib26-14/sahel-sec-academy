import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EAF0F7',
          100: '#C9D7EA',
          200: '#93ABCC',
          300: '#5D7FAE',
          400: '#31558A',
          DEFAULT: '#0C2340',
          700: '#0A1D36',
          800: '#07162A',
          900: '#050F1F',
        },
        teal: {
          50: '#E5F7EF',
          100: '#C2EDDC',
          200: '#86DBBB',
          300: '#4AC79A',
          400: '#2BB282',
          DEFAULT: '#1D9E75',
          600: '#17805F',
          700: '#12634A',
        },
      },
      maxWidth: {
        prose: '65ch',
      },
    },
  },
  plugins: [],
}
export default config