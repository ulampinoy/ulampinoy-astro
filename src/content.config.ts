import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Structured recipe card data (rendered by RecipeCard and emitted as Recipe JSON-LD)
const recipe = z.object({
  prepTime: z.number().optional(), // minutes
  cookTime: z.number().optional(), // minutes
  servings: z.number().optional(),
  course: z.string().optional(),
  cuisine: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  summary: z.string().optional(),
  ingredients: z.array(
    z.object({
      group: z.string().optional(),
      items: z.array(z.string()),
    })
  ),
  instructions: z.array(
    z.object({
      group: z.string().optional(),
      steps: z.array(z.string()),
    })
  ),
  notes: z.array(z.string()).default([]),
  nutrition: z
    .object({
      calories: z.string().optional(),
      protein: z.string().optional(),
      fat: z.string().optional(),
      carbohydrates: z.string().optional(),
    })
    .optional(),
});

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
    recipe: recipe.optional(),
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
