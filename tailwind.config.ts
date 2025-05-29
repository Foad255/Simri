// simri-app/tailwind.config.js
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // "./src/**/*.{js,ts,jsx,tsx,mdx}", // If using a src directory
  ],
  theme: {
    extend: {
      fontFamily: {
        // Example: If you want to use Inter, ensure it's imported via CSS or <link>
        // sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        // For modal, if not using inline style tag
        // modalShow: 'modalShow 0.2s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        // modalShow: {
        //   'to': { opacity: '1', transform: 'scale(1)' },
        // },
      },
    },
  },
  plugins: [
    forms, // Equivalent to require('@tailwindcss/forms')
  ],
};
