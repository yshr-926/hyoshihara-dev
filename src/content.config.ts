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
    // 下書きは本番ビルドから外す。省略時に公開扱いにならないよう必須にしている(新規記事は draft: true から始める)
    draft: z.boolean(),
    // 記事冒頭に出す「この記事で分かること」(任意、最大 4 点。2〜3 点を推奨)
    keyPoints: z.array(z.string()).max(4).optional(),
    // トップの「まず読んでほしい記事」枠に出す(任意、最大 2 本まで表示)。featuredNote は推薦理由 1 行
    featured: z.boolean().default(false),
    featuredNote: z.string().optional(),
    // 内容を更新した日(任意)。検証環境や結論が変わったときに記事側で更新する
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { blog };
