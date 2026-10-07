// トップページ(日本語 / 英語)の「個人開発」セクションに載せるプロジェクト。
// 説明は何ができるかを事実ベースで 1 文。宣伝表現・利用者数などの数字は入れない。

export interface Project {
  id: string;
  name: string;
  /** 公開サイトの URL */
  href: string;
  /** 公開リポジトリの URL。private のものは持たない(リンクを出さない) */
  repo?: string;
  description: { ja: string; en: string };
  /** 主な技術(3〜4 個まで) */
  stack: string[];
}

export const projects: Project[] = [
  {
    id: 'gridder',
    name: 'Gridder',
    href: 'https://gridder.hirotoyoshihara.dev/',
    repo: 'https://github.com/yshr-926/gridder',
    description: {
      ja: 'グリッドにスナップした図形ですばやく作図し、画像で共有するブラウザ向けのスケッチツール。',
      en: 'A browser sketch tool for drawing grid-snapped shapes quickly and sharing them as images.',
    },
    stack: ['React', 'TypeScript', 'Konva'],
  },
  {
    id: 'algoviz',
    name: 'algoviz',
    href: 'https://algoviz.hirotoyoshihara.dev/',
    description: {
      ja: '最適化・探索・機械学習のアルゴリズムを、パラメータを動かせる可視化で学ぶための学習アプリ。',
      en: 'A learning app for optimization, search, and machine learning algorithms through interactive visualizations.',
    },
    stack: ['React', 'TypeScript', 'Canvas'],
  },
  {
    id: 'shiritype',
    name: 'Shiritype',
    href: 'https://shiritype.hirotoyoshihara.dev/',
    description: {
      ja: 'コード・Linux コマンド・Git・エディタのショートカットを、打ちながら覚えるタイピング練習サイト。',
      en: 'A typing practice site for learning code, Linux commands, Git, and editor shortcuts as you type them.',
    },
    stack: ['TanStack Start', 'React', 'TypeScript'],
  },
];
