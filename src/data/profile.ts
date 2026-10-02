// トップページ / レイアウト(ヘッダー・フッター・OGP 既定文)で共有するプロフィールデータ(実データの一次ソース)。
// 実績・数字・案件説明は掲載しない方針のため、ここには氏名・肩書き・事実ベースの自己紹介・専門領域・連絡先・経歴・学歴・専門語だけを置く。

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
  /** 事実ベースの自己紹介 1〜2 文。宣伝表現なし */
  intro:
    'HEROZ株式会社で AI エンジニアとして働いています。専門は空間最適化と AI エージェント開発です。',
  /** 「空間最適化」が何を指すかの 1 文(非専門家向け) */
  domainNote:
    '空間最適化は、住宅の間取りのように、法規や寸法の制約を満たしながら部屋や設備の配置を決める問題を指します。',
  /** プロフィール内容を最後に更新した日(ISO 日付) */
  updatedAt: '2026-09-16',
} as const;

export type ContactId = 'github' | 'x' | 'linkedin';

export interface Contact {
  id: ContactId;
  label: string;
  /** 画面に出す短い識別子(@handle やアドレス) */
  handle: string;
  href: string;
  /** フッター等で使う役割の短い和文ラベル(例: '仕事の連絡' / 'コード' / '近況') */
  role: string;
  /** 主連絡先(1 件だけ true) */
  primary?: boolean;
}

export const contacts: Contact[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'hirotoyo6290',
    href: 'https://www.linkedin.com/in/hirotoyo6290/',
    role: '仕事の連絡',
    primary: true,
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: 'yshr-926',
    href: 'https://github.com/yshr-926',
    role: 'コード',
  },
  {
    id: 'x',
    label: 'X',
    handle: '@hiroto_6290',
    href: 'https://x.com/hiroto_6290',
    role: '近況',
  },
];

export interface CareerEntry {
  /** 安定 ID。profile.en.ts の英訳と Record で結合するためのキー(配列インデックスに依存しない) */
  id: string;
  company: string;
  role: string;
  /** 期間。datetime 属性用の ISO(YYYY-MM)と表示用の文字列 */
  from: { iso: string; text: string };
  /** 在籍中は '現在' のみ */
  to: { iso: string; text: string } | '現在';
}

export const career: CareerEntry[] = [
  {
    id: 'heroz',
    company: 'HEROZ株式会社',
    role: 'AIエンジニア',
    from: { iso: '2025-04', text: '2025.04' },
    to: '現在',
  },
];

export interface EducationEntry {
  /** 安定 ID。profile.en.ts の英訳と Record で結合するためのキー(配列インデックスに依存しない) */
  id: string;
  /** 修了・卒業年(YYYY) */
  year: string;
  school: string;
  /** 修了 / 卒業 */
  status: string;
}

export const education: EducationEntry[] = [
  { id: 'kyutech-grad', year: '2025', school: '九州工業大学大学院 情報工学府', status: '修了' },
  { id: 'kyutech-ug', year: '2023', school: '九州工業大学 情報工学部', status: '卒業' },
];

/** 専門領域を 2 群に分けたもの */
export const fieldGroups: { label: string; items: string[] }[] = [
  { label: '探索・最適化', items: ['制約充足', '計算幾何', '組合せ探索'] },
  { label: 'AI エージェント', items: ['RAG', 'LLM 評価', 'LLM オーケストレーション'] },
];

/** 主な使用言語(専門領域とは分ける) */
export const languages: string[] = ['Python'];
