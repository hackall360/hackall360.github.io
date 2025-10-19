import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    problem: z.string().optional(),
    solution: z.string().optional(),
    techStack: z.array(z.string()).optional(),
    results: z.union([z.array(z.string()), z.string()]).optional(),
    github: z.string().url().optional(),
    demo: z.string().url().optional(),
    lastUpdated: z.date().optional()
  })
});

export const collections = { projects };
