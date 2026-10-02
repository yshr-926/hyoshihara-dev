// 英語プロフィール(/en/)の表示文。事実(期間 ISO・リンク・updatedAt)は src/data/profile.ts から共有し、
// ここには英語読者向けの表示文だけを持つ(二重管理しない)。

import { career, contacts, education, profile } from './profile';
import type { ContactId } from './profile';

export const profileEn = {
  fullName: profile.fullName,
  fullNameJa: profile.fullNameJa,
  /** 職種 */
  title: 'AI Engineer',
  /** 専門領域(英語読者向け、1 行) */
  domain: 'Spatial optimization and AI agent development',
  /** domain の文中埋め込み用(文頭でないので小文字始まり)。AI 等の頭字語はそのまま保つ */
  domainInline: 'spatial optimization and AI agent development',
  /** 事実ベースの自己紹介 1〜2 文。宣伝表現なし */
  intro:
    "I'm an AI engineer at HEROZ, Inc. I work on spatial optimization and AI agent development.",
  /** 「空間最適化」が何を指すかの 1 文(非専門家向け) */
  domainNote:
    'Spatial optimization here means deciding where rooms and equipment go under regulatory and dimensional constraints, as in residential floor plans.',
  /** プロフィール内容を最後に更新した日(ISO 日付、profile.ts と共有) */
  updatedAt: profile.updatedAt,
} as const;

export interface ContactEn {
  id: (typeof contacts)[number]['id'];
  label: string;
  handle: string;
  href: string;
  /** フッター等で使う役割の短い英語ラベル */
  role: string;
  primary?: boolean;
}

// href / handle / primary は profile.ts の contacts と共有し、role だけ英語で持つ。
// Record<ContactId, string> で網羅させ、profile.ts に contact を追加したときに型エラーで気づけるようにする
const ROLE_EN: Record<ContactId, string> = {
  linkedin: 'Work inquiries',
  github: 'Code',
  x: 'Updates',
};

export const contactsEn: ContactEn[] = contacts.map((contact) => ({
  id: contact.id,
  label: contact.label,
  handle: contact.handle,
  href: contact.href,
  role: ROLE_EN[contact.id],
  primary: contact.primary,
}));

export interface CareerEntryEn {
  company: string;
  role: string;
  from: { iso: string; text: string };
  to: { iso: string; text: string } | 'Present';
}

// company / role の英語表記。期間(from/to の iso)は profile.ts の career と共有する。
// id をキーにした Record で結合するため、career に項目を追加したのに対訳を足し忘れると
// 型エラーになる(配列インデックス対応と違い、件数・順序のズレでは気づけない事故を防ぐ)
const CAREER_EN: Record<(typeof career)[number]['id'], { company: string; role: string }> = {
  heroz: { company: 'HEROZ, Inc.', role: 'AI Engineer' }, // TODO(要確認): 公式英語表記に合わせる
};

export const careerEn: CareerEntryEn[] = career.map((job) => ({
  company: CAREER_EN[job.id].company,
  role: CAREER_EN[job.id].role,
  from: job.from,
  to: job.to === '現在' ? 'Present' : job.to,
}));

export interface EducationEntryEn {
  year: string;
  school: string;
  /** Master's (YYYY) / Bachelor's (YYYY) の形 */
  status: string;
}

// school / status の英語表記。year は profile.ts の education と共有する。
// CAREER_EN と同様、id をキーにした Record で結合する(配列インデックス対応をやめ、追加漏れを型エラーで検知する)
const EDUCATION_EN: Record<(typeof education)[number]['id'], { school: string; status: string }> = {
  'kyutech-grad': {
    school:
      'Kyushu Institute of Technology, Graduate School of Computer Science and Systems Engineering', // TODO(要確認): 公式英語表記に合わせる
    status: "Master's (2025)",
  },
  'kyutech-ug': {
    school: 'Kyushu Institute of Technology, School of Computer Science and Systems Engineering', // TODO(要確認): 公式英語表記に合わせる
    status: "Bachelor's (2023)",
  },
};

export const educationEn: EducationEntryEn[] = education.map((entry) => ({
  year: entry.year,
  school: EDUCATION_EN[entry.id].school,
  status: EDUCATION_EN[entry.id].status,
}));

/** 専門領域を 2 群に分けたもの(英語ラベル・英語語) */
export const fieldGroupsEn: { label: string; items: string[] }[] = [
  {
    label: 'Search & Optimization',
    items: ['Constraint Satisfaction', 'Computational Geometry', 'Combinatorial Search'],
  },
  { label: 'AI Agents', items: ['RAG', 'LLM Evaluation', 'LLM Orchestration'] },
];

/** 主な使用言語(専門領域とは分ける) */
export const languagesEn: string[] = ['Python'];

/** UI 文言(en/index.astro 側で使う、Layout の辞書とは別枠) */
export const uiEn = {
  contactLead: 'For work inquiries, please reach out via',
  contactLeadTail: '.',
  fieldsLabel: 'FIELDS',
  fieldsHeading: 'Fields',
  languagesLead: 'Primary language',
  careerLabel: 'CAREER',
  careerHeading: 'Career',
  educationLabel: 'EDUCATION',
  educationHeading: 'Education',
  postsLabel: 'POSTS',
  postsHeading: 'Posts',
  postsAll: 'All posts',
  featuredLabel: 'FEATURED',
  featuredHeading: 'Start here',
  lastUpdated: 'Last updated',
  japaneseSuffix: '(Japanese)',
} as const;
