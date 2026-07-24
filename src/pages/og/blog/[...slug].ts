import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

// 記事ごとに OGP 画像をビルド時生成する。
// パス: /og/blog/<slug>.png
const posts = await getCollection('blog', ({ data }) => !data.draft);

// OGImageRoute には { path: page } の形で渡す
const pages = Object.fromEntries(posts.map((post) => [post.id, post.data]));

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  // pages のキー(= post.id)をそのまま slug にする → /og/blog/<id>.png
  getSlug: (path) => path,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [
      [24, 24, 27],
      [9, 9, 11],
    ],
    // 左端のアクセントライン(視認性のため背景よりはっきりした色に)
    border: { color: [99, 102, 241], width: 12, side: 'inline-start' },
    padding: 60,
    font: {
      title: { size: 64, weight: 'Bold', color: [250, 250, 250], families: ['Noto Sans CJK JP'] },
      description: { size: 32, color: [180, 180, 190], families: ['Noto Sans CJK JP'] },
    },
    // 日本語グリフの描画に CJK フォント(otf)を読み込む
    fonts: [
      './src/assets/fonts/NotoSansCJKjp-Regular.otf',
      './src/assets/fonts/NotoSansCJKjp-Bold.otf',
    ],
  }),
});
