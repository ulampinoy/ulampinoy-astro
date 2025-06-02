import { defineCollection, z } from "astro:content";

const blog = defineCollection({
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
  }),
});

export const collections = {
  blog,
};
