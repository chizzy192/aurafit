// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#FDF8F5",       // Soft Off-white / Cream
          pink: "#F7D6D0",        // Light blush pink
          rose: "#C98A7D",        // Muted Rose Brown (Neutral Accent)
          darkRose: "#8E5B50",    // Deep Rose Brown for typography & borders
          surface: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;