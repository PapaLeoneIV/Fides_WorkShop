import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(calendar|card|button|ripple|spinner).js"
  ],
  theme: {
    colors: {
      softbrown: '#efe7d4', // Custom color
    },
    extend: {
      colors: {
        background: "var(--background)", // Ensure these CSS variables are defined
        foreground: "var(--foreground)", // Ensure these CSS variables are defined
      },
    },
  },
  plugins: [nextui()],
};

export default config;
