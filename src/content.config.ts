import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const onboarding = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/onboarding" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().default(99),
  }),
});

export const collections = { onboarding };
