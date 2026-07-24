// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: 独自ドメイン確定後に差し替える(sitemap / OGP / RSS の絶対URL生成に使用)
  site: 'https://example.com',

  integrations: [mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
