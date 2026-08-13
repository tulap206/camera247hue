/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F5C518',
          navy: '#0B1F33',
          ink: '#152536',
          muted: '#5C6B7A',
          border: '#E4E9F0',
          bg: '#F5F7FA',
          soft: '#EEF2F6',
          surface: '#FFFFFF',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 35, 55, 0.08)',
        lift: '0 18px 48px rgba(15, 35, 55, 0.12)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
