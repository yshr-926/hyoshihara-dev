# hyoshihara-dev

[hirotoyoshihara.dev](https://hirotoyoshihara.dev) のソースコードです。プロフィールと技術記事を載せた、Astro 製の静的サイトです。

## 技術スタック

| 項目             | 内容                                                           |
| :--------------- | :------------------------------------------------------------- |
| フレームワーク   | Astro 7(静的生成。クライアント JS は最小限)                    |
| コンテンツ       | MDX + Content Collections(frontmatter は Zod でビルド時に検証) |
| スタイリング     | Tailwind CSS 4(設定は `src/styles/global.css` の `@theme`)     |
| コードハイライト | Shiki(ビルド時に生成)                                          |
| OGP 画像         | astro-og-canvas(ビルド時に記事ごとに生成)                      |
| ホスティング     | Cloudflare Workers の静的アセット配信                          |
| ランタイム       | Bun                                                            |

## 開発

[Bun](https://bun.sh/) と Node.js 22.12 以上が必要です。

```bash
bun install
bun run dev
```

| コマンド               | 内容                                                 |
| :--------------------- | :--------------------------------------------------- |
| `bun run dev`          | 開発サーバー                                         |
| `bun run build`        | 本番ビルド(`dist/`)。型と frontmatter の検証も兼ねる |
| `bun run preview`      | ビルド結果の確認                                     |
| `bun run lint`         | ESLint                                               |
| `bun run format:check` | Prettier の整形チェック(`bun run format` で整形)     |
| `bun run audit`        | 依存の脆弱性検査(`scripts/audit_deps.py`)            |

CI(`.github/workflows/ci.yml`)でも同じ検査を実行します。

## 記事の追加

`src/content/blog/<slug>.mdx` を作成します。frontmatter は `src/content.config.ts` のスキーマで検証されます。

```mdx
---
title: 記事タイトル
description: 記事の概要
date: 2026-07-24
tags: [astro, tailwind]
draft: true # true の間は一覧・RSS・OGP 画像の対象外
---
```

公開するときは `draft` を外して main に push します。OGP 画像はビルド時に自動で作られます。

## ディレクトリ構成

```
src/
├── content/blog/        # 記事(*.mdx)
├── content.config.ts    # 記事のスキーマ
├── data/                # プロフィール(日本語 / 英語)
├── pages/               # トップ・英語版・記事・タグ・RSS・OGP 画像
├── components/          # 共通コンポーネント
├── layouts/Layout.astro # 共通レイアウト
├── styles/global.css    # テーマとベーススタイル
└── assets/fonts/        # OGP 画像用の Noto Sans CJK
integrations/            # ビルド時に CSP などのセキュリティヘッダーを生成
scripts/                 # 依存の脆弱性検査
```

## デプロイ

main に push すると、GitHub Actions(`.github/workflows/deploy.yml`)がビルドして Cloudflare Workers にデプロイします。Worker 名とカスタムドメインは `wrangler.jsonc` にあります。

## ライセンス

| 対象                                                       | ライセンス                                                                                     |
| :--------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| ソースコード                                               | [MIT](LICENSE)                                                                                 |
| 記事(`src/content/blog/`)                                  | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)(出典を明記すれば転載・改変可) |
| プロフィール・経歴(`src/data/` とプロフィールページの文章) | 著作権は著者に帰属(無断転載不可)                                                               |
| フォント(`src/assets/fonts/` の Noto Sans CJK)             | SIL Open Font License 1.1(`src/assets/fonts/LICENSE-NotoSansCJK.txt`)                          |
