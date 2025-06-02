import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string(),
    draft: z.boolean().default(false),
    whetter: z.string(),
    featured: z.boolean().optional(),
    image: z.string().optional(),
    sideImage: z.string().optional(),
    sideImageCaption: z.string().optional(),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog,
};
