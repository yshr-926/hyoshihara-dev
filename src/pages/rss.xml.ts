import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { profile } from '../data/profile';

// 公開記事のみ、日付降順で配信する。site は独自ドメイン確定までの仮値(TODO: astro.config.mjs 側で差し替え)
export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: 'hyoshihara.dev',
    description: `${profile.title} — ${profile.domain}`,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}`,
    })),
  });
}
