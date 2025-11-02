import type { Config } from 'tailwindcss';
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f8ff',
          100: '#d8e7ff',
          200: '#aecdff',
          300: '#83b3ff',
          400: '#5999ff',
          500: '#327fff',
          600: '#1f63db',
          700: '#1349a9',
          800: '#0c3278',
          900: '#061b48'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
export default config;
