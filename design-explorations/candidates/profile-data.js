// 各候補が共有するプロフィールデータ。src/data/profile.ts / projects.ts の内容を写したもの(デザイン比較用)。
// 記事は公開分が 0 件なので、記事欄は「並び方の見本」として空の状態を出す。
window.PROFILE = {
  siteName: 'hirotoyoshihara.dev',
  fullName: 'Hiroto Yoshihara',
  fullNameJa: '吉原 啓人',
  title: 'AIエンジニア',
  domain: 'ドメインに基づいたアルゴリズム開発',
  intro:
    'HEROZ株式会社で AI エンジニアとして働いています。対象ドメインの制約や評価基準を定式化し、それに基づいてアルゴリズムを設計・開発しています。',
  updatedAt: '2026-09-16',
  contacts: [
    { id: 'linkedin', label: 'LinkedIn', handle: 'hirotoyo6290', href: 'https://www.linkedin.com/in/hirotoyo6290/', role: '仕事の連絡', primary: true },
    { id: 'github', label: 'GitHub', handle: 'yshr-926', href: 'https://github.com/yshr-926', role: 'コード' },
    { id: 'x', label: 'X', handle: '@hiroto_6290', href: 'https://x.com/hiroto_6290', role: '近況' },
  ],
  career: [{ company: 'HEROZ株式会社', role: 'AIエンジニア', from: '2025.04', to: '現在' }],
  education: [
    { year: '2025', school: '九州工業大学大学院 情報工学府', status: '修了' },
    { year: '2023', school: '九州工業大学 情報工学部', status: '卒業' },
  ],
  fieldGroups: [
    { label: '探索・最適化', en: 'Search & Optimization', items: ['制約充足', '計算幾何', '組合せ探索'] },
    { label: '機械学習・深層学習', en: 'Machine Learning', items: ['確率的最適化', '深層学習の学習理論', 'モデルの学習・評価'] },
    { label: 'AI エージェント', en: 'AI Agents', items: ['RAG', 'LLM 評価', 'LLM オーケストレーション'] },
  ],
  languages: ['Python'],
  projects: [
    {
      id: 'gridder',
      name: 'Gridder',
      href: 'https://gridder.hirotoyoshihara.dev/',
      repo: 'https://github.com/yshr-926/gridder',
      description: 'グリッドにスナップした図形ですばやく作図し、画像で共有するブラウザ向けのスケッチツール。',
      stack: ['React', 'TypeScript', 'Konva'],
    },
    {
      id: 'algoviz',
      name: 'algoviz',
      href: 'https://algoviz.hirotoyoshihara.dev/',
      description: '最適化・探索・機械学習のアルゴリズムを、パラメータを動かせる可視化で学ぶための学習アプリ。',
      stack: ['React', 'TypeScript', 'Canvas'],
    },
    {
      id: 'shiritype',
      name: 'Shiritype',
      href: 'https://shiritype.hirotoyoshihara.dev/',
      description: 'コード・Linux コマンド・Git・エディタのショートカットを、打ちながら覚えるタイピング練習サイト。',
      stack: ['TanStack Start', 'React', 'TypeScript'],
    },
  ],
};

// 小さなテンプレート補助(各候補で共通)
window.esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// 再現できる乱数(mulberry32)。SGD のノイズや点の配置を毎回同じにする
window.seeded = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// 比較ページ(../index.html)からのテーマ切替を受け取る。file:// で開いたときは親から DOM を触れないため、メッセージで渡す
window.addEventListener('message', (e) => {
  if (e.data?.type !== 'ui-theme') return;
  const root = document.documentElement;
  e.data.theme === 'system' ? root.removeAttribute('data-theme') : root.setAttribute('data-theme', e.data.theme);
});
