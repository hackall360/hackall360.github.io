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

const linkHrefSchema = z.string().refine(
  (value) => value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://'),
  {
    message: 'Link href must be an absolute URL or start with "/".'
  }
);

const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.number().int(),
    role: z.string(),
    stack: z.array(z.string()).default([]),
    summary: z.string(),
    outcomes: z.array(z.string().min(1)).min(1),
    links: z
      .array(
        z.object({
          label: z.string(),
          href: linkHrefSchema
        })
      )
      .default([]),
    featured: z.boolean().default(false)
  })
});

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    canonicalUrl: z.string().url().optional()
  })
});

export const collections = { projects, notes, work };
