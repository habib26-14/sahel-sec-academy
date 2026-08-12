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
        night: {
          50: '#EDF1F7',
          100: '#D3DCE8',
          200: '#A8BBCC',
          300: '#7A93AA',
          400: '#47617D',
          500: '#243A55',
          600: '#13223A',
          700: '#0C182C',
          800: '#08101F',
          900: '#040810',
          DEFAULT: '#040A14',
        },
        navy: {
          50: '#EAF0F7',
          100: '#C9D7EA',
          200: '#93ABCC',
          300: '#5D7FAE',
          400: '#31558A',
          DEFAULT: '#0C2340',
          700: '#0A1D36',
          800: '#07162A',
          900: '#040C1A',
        },
        teal: {
          50: '#E9FBF2',
          100: '#C9F5DF',
          200: '#94E9BD',
          300: '#59DA97',
          400: '#28C473',
          DEFAULT: '#0FA864',
          600: '#0A8A54',
          700: '#086F45',
          800: '#075C39',
          900: '#054B2F',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: {
        prose: '65ch',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-node': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'dash-flow': {
          '0%': { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
        'scan': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'pulse-node': 'pulse-node 3s ease-in-out infinite',
        'dash-flow': 'dash-flow 6s linear infinite',
        'scan': 'scan 4s ease-in-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config