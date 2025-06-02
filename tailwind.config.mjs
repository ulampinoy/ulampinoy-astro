// tailwind.config.js
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            img: {
              marginTop: "1em",
              marginBottom: "1em",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
