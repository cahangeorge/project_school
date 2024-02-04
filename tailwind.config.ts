import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'auth': "url('/images/bg.jpg')"
      }
    },
  },
  plugins: [],
} satisfies Config