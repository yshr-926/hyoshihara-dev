// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

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
  // TODO: 独自ドメイン確定後に差し替える(sitemap / OGP / RSS の絶対URL生成に使用)
  site: 'https://example.com',

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
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
