import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
  site: "https://ulampinoy.com",
  images: {
    domains: ["localhost"],
    remotePatterns: [{ protocol: "https" }],
  },
  content: {
    collections: {
      blog: {
        type: "content", // Use 'content' instead of 'data' for better type handling
        schema: ({ z }) => z.object({
          title: z.string(),
          description: z.string(),
          date: z.string().transform(str => new Date(str)),
          draft: z.boolean().optional(),
          image: z.string().optional(),
          whetter: z.string().optional(),
          author: z.string().optional(),
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
        }),
      },
      glossary: {
        type: "content",
        schema: ({ z }) => z.object({
          title: z.string(),
          description: z.string(),
          date: z.string().transform(str => new Date(str)).optional(),
          draft: z.boolean().optional(),
          image: z.string().optional(),
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
        }),
      },
    },
  },
});
