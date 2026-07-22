import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { visit } from "unist-util-visit";

function rehypeOptimizeImages() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "img" && node.properties && node.properties.src) {
        const src = String(node.properties.src);
        if (src.startsWith("/images/")) {
          const cleanSrc = src.split("?")[0];
          node.properties.src = `/.netlify/images?url=${cleanSrc}&w=800&fm=avif&q=80`;
        }
        if (!node.properties.loading) {
          node.properties.loading = "lazy";
        }
        if (!node.properties.decoding) {
          node.properties.decoding = "async";
        }
      }
    });
  };
}

export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeOptimizeImages],
  },
  integrations: [tailwind(), sitemap()],
  site: "https://ulampinoy.com",
  images: {
    domains: ["localhost"],
    remotePatterns: [{ protocol: "https" }],
  },
});
