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
    // 記事冒頭に出す「この記事で分かること」(任意、最大 4 点。2〜3 点を推奨)
    keyPoints: z.array(z.string()).max(4).optional(),
  }),
});

export const collections = { blog };
