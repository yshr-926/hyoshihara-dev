import { OGImageRoute } from 'astro-og-canvas';
import { profile } from '../../data/profile';

// トップ専用の OG 画像。ビルド時に静的生成される。パス: /og/site.png
const pages = {
  site: {
    title: `${profile.fullNameJa} / ${profile.fullName}`,
    description: `${profile.title} — ${profile.domain}`,
  },
};

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getSlug: (path) => `${path}.png`,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    // サイトの図面トークン: 紙 / インク / 朱の帯(現在地の朱書きの延長として、帯にのみ使う)
    bgGradient: [
      [245, 247, 248],
      [245, 247, 248],
    ],
    border: { color: [196, 58, 30], width: 12, side: 'inline-start' },
    padding: 60,
    font: {
      title: { size: 64, weight: 'Bold', color: [31, 46, 58], families: ['Noto Sans CJK JP'] },
      description: { size: 32, color: [31, 46, 58], families: ['Noto Sans CJK JP'] },
    },
    fonts: [
      './src/assets/fonts/NotoSansCJKjp-Regular.otf',
      './src/assets/fonts/NotoSansCJKjp-Bold.otf',
    ],
  }),
});
