// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)', 'DM Sans', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-body)', 'DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['Fira Code', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}