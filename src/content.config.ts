import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { DOMAINS } from './consts';

const domainSchema = z.enum(DOMAINS);

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    domain: domainSchema,
    topics: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['zh', 'en']).default('zh'),
    summary: z.string(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

const topics = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/topics' }),
  schema: z.object({
    title: z.string(),
    domain: domainSchema,
    summary: z.string(),
    updated: z.coerce.date(),
    order: z.number().default(0),
  }),
});

export const collections = { articles, topics };
