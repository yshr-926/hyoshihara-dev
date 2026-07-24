import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 記事: src/content/blog/*.mdx を Zod スキーマで型検証する
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    // 公開前の下書きを本番ビルドから外したいとき用(任意)
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
