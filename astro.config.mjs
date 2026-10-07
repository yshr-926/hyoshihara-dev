// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

/**
 * コードフェンスのメタ(```ts title="src/foo.ts")から title を拾い、
 * Shiki が出力する <pre> に data-title 属性として載せる。
 * 記事ページ側のスクリプトがこの属性を読んでファイル名として表示する。
 * @type {import('shiki').ShikiTransformer}
 */
const codeBlockTitle = {
  name: 'hyoshihara:code-block-title',
  pre(node) {
    const raw = this.options.meta?.__raw ?? '';
    const match = raw.match(/(?:^|\s)title=(?:"([^"]*)"|'([^']*)'|(\S+))/);
    const title = match?.[1] ?? match?.[2] ?? match?.[3];
    if (title) node.properties['data-title'] = title;
  },
};

// https://astro.build/config
export default defineConfig({
  // 公開 URL(sitemap / OGP / RSS / canonical / hreflang の絶対 URL 生成に使用)。apex で公開し、www は apex へ寄せる
  site: 'https://hirotoyoshihara.dev',

  // /resume は廃止し、経歴はトップにまとめた。旧 URL からの流入はトップへ送る
  redirects: { '/resume': '/' },

  integrations: [mdx(), sitemap()],

  markdown: {
    shikiConfig: {
      // ライト / ダークの二重テーマで出力し、global.css の切り替え CSS がサイトのテーマに追従させる
      // (単色だとライトでも暗い面のまま、印刷でも暗い面が刷られる)
      themes: { light: 'github-light', dark: 'github-dark' },
      transformers: [codeBlockTitle],
    },
    // markdown.remarkPlugins / rehypePlugins は Astro 7 で deprecated のため、
    // unified() 経由で markdown.processor に渡す(公式アップグレードガイド準拠)。
    // 見出しへの共有リンク(# アンカー)。rehypeHeadingIds は Astro が見出しに振る id と
    // 目次(headings の slug)を一致させるため、後続プラグインより先に置く必要がある
    processor: unified({
      rehypePlugins: [
        rehypeHeadingIds,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: { class: 'heading-anchor', ariaLabel: 'この見出しへのリンク' },
            content: { type: 'text', value: '#' },
          },
        ],
      ],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
