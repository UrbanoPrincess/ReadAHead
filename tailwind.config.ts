import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: '#800000', // Maroon
        brown: '#8B4513', // Brown
        beige: '#F5F5DC', // Beige
        lightMaroon: '#B03060', // Light Maroon
        darkBrown: '#654321', // Dark Brown
      },
    },
  },
  plugins: [
    require('flowbite/plugin'), // Adds Flowbite plugin for Tailwind CSS
  ],
} satisfies Config;
