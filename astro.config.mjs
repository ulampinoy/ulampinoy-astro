import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
  site: "https://ulampinoy.com",
  images: {
    domains: ["localhost"],
    remotePatterns: [{ protocol: "https" }],
  },
});
