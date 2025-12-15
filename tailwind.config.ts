import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F6C453',
        primaryLight: '#FFF4D6',
        accent: '#F2B6B6',
        success: '#A8CBB7',
        text: '#5A4634',
        background: '#FFFCF6',
      },
      fontFamily: {
        display: ['"Cormorant Infant"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Nunito"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
