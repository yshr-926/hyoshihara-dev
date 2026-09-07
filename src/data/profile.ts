// トップページ / レイアウト(ヘッダー・フッター・OGP 既定文)で共有するプロフィールデータ(実データの一次ソース)。
// 実績・数字・案件説明・自己紹介文は掲載しない方針のため、ここには氏名・肩書き・専門領域・連絡先・経歴・学歴・専門語だけを置く。

export const profile = {
  /** サイト表記の名前(ヘッダー・OGP と揃える) */
  handle: 'hyoshihara',
  /** フルネーム(英・和)。トップで併記して同一人物だと分かるようにする */
  fullName: 'Hiroto Yoshihara',
  fullNameJa: '吉原 啓人',
  /** 職種 */
  title: 'AIエンジニア',
  /** 専門領域(記号を使わず日本語で 1 行) */
  domain: '空間最適化とAIエージェント開発',
} as const;

export type ContactId = 'github' | 'x' | 'linkedin';

export interface Contact {
  id: ContactId;
  label: string;
  /** 画面に出す短い識別子(@handle やアドレス) */
  handle: string;
  href: string;
}

export const contacts: Contact[] = [
  { id: 'github', label: 'GitHub', handle: 'yshr-926', href: 'https://github.com/yshr-926' },
  { id: 'x', label: 'X', handle: '@hiroto_6290', href: 'https://x.com/hiroto_6290' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'hirotoyo6290',
    href: 'https://www.linkedin.com/in/hirotoyo6290/',
  },
];

export interface CareerEntry {
  company: string;
  role: string;
  /** 期間。datetime 属性用の ISO(YYYY-MM)と表示用の文字列 */
  from: { iso: string; text: string };
  /** 在籍中は '現在' のみ */
  to: { iso: string; text: string } | '現在';
}

export const career: CareerEntry[] = [
  {
    company: 'HEROZ株式会社',
    role: 'AIエンジニア',
    from: { iso: '2025-04', text: '2025.04' },
    to: '現在',
  },
];

export interface EducationEntry {
  /** 修了・卒業年(YYYY) */
  year: string;
  school: string;
  /** 修了 / 卒業 */
  status: string;
}

export const education: EducationEntry[] = [
  { year: '2025', school: '九州工業大学大学院 情報工学府', status: '修了' },
  { year: '2023', school: '九州工業大学 情報工学部', status: '卒業' },
];

/** 専門領域を伝える少数の言葉(羅列にしない。5〜8 語) */
export const fields: string[] = [
  '探索・最適化',
  '制約充足',
  '計算幾何',
  'RAG',
  'LLM 評価',
  'Python',
];
