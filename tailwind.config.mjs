// tailwind.config.js
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      sans: ["Noto Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      serif: ["Noto Serif", "ui-serif", "Georgia", "serif"],
      'Noto_Sans_Tagalog': ["Noto Sans Tagalog", "sans-serif"],
    },
    extend: {
      colors: {
        "regal-blue": "#243c5a",
      },
      fontSize: {
        "article-intro": ["1.25rem", "1.75rem"], // 20px with 28px line height
      },
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
