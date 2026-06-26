import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blog",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, "").replace(/\/index$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string().optional(),
    draft: z.boolean().default(false),
    whetter: z.string().optional(),
    featured: z.boolean().optional(),
    image: z.string().optional(),
    sideImage: z.string().optional(),
    sideImageCaption: z.string().optional(),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    hasVideo: z.boolean().optional(),
    videoUrl: z.string().optional(),
    category: z.string().optional(),
    spotlight: z.boolean().optional(),
    spotlightOrder: z.number().optional(),
    promoted: z.boolean().optional(),
  }),
});

const glossary = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/glossary",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, "").replace(/\/index$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.date().optional(),
    author: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
  glossary,
};
