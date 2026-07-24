# hyoshihara-dev

個人レジュメ兼技術記事サイト。転職活動・案件獲得時に「ここを見てください」と渡せる一元的な URL として、レジュメ(職務経歴)と技術記事を同じ場所で公開する静的サイトです。CMS・データベースは使いません。

## 特徴

- ⚡ **Astro による静的生成** — デフォルトでゼロ JS。Lighthouse 90+ を目安にした軽量なサイト
- 📝 **MDX + Content Collections** — 記事はリポジトリ内の MDX ファイルで管理し、frontmatter を Zod スキーマでビルド時に型検証
- 🎨 **Tailwind CSS v4(CSS-first 構成)** — `tailwind.config.js` を持たず、テーマ拡張は `src/styles/global.css` の `@theme` に記述
- 🖼️ **OGP 画像の自動生成** — astro-og-canvas によりビルド時に記事ごとの OGP 画像を生成(日本語は Noto Sans CJK で描画)
- ♿ **アクセシビリティ対応** — `prefers-reduced-motion` / `prefers-reduced-transparency` / `prefers-contrast` に対応。ライト/ダークは `color-scheme` + `light-dark()` で実装

## 必要条件

- [Bun](https://bun.sh/)(パッケージ管理・スクリプト実行。npm / yarn / pnpm は使用しない)
- Node.js >= 22.12.0

## セットアップ

```bash
git clone <repository-url>
cd hyoshihara-dev
bun install
```

## 開発コマンド

| コマンド                 | 内容                                                                              |
| :----------------------- | :-------------------------------------------------------------------------------- |
| `astro dev --background` | 開発サーバーをバックグラウンドで起動(`astro dev stop` / `status` / `logs` で管理) |
| `bun run build`          | 本番ビルド(`dist/` 出力)。型・スキーマ検証を兼ねるため、変更後は必ず実行する      |
| `bun run preview`        | ビルド結果をローカルで確認                                                        |

テスト・リンターは未導入。検証手段は `bun run build` の成功と開発サーバーでの目視確認です。

## ページ構成

| パス                  | 内容                                         |
| :-------------------- | :------------------------------------------- |
| `/`                   | トップ(自己紹介・実績ダイジェスト・最新記事) |
| `/resume`             | レジュメ(職務経歴・スキルセット)             |
| `/blog`               | 記事一覧                                     |
| `/blog/[slug]`        | 記事詳細(Shiki によるコードハイライト)       |
| `/og/blog/[slug].png` | 記事 OGP 画像(ビルド時に自動生成)            |

## 記事の書き方

1. `src/content/blog/<slug>.mdx` を作成する
2. frontmatter を埋める(`src/content.config.ts` の Zod スキーマで検証される):

   ```mdx
   ---
   title: 記事タイトル
   description: 記事の概要
   date: 2026-07-24
   tags: [astro, tailwind]
   draft: true # 公開前は true。draft のままだと一覧・OGP 生成の対象外
   ---

   本文は基本 Markdown で書き、図解やインタラクティブデモが必要な箇所だけコンポーネントを import する。
   ```

3. 公開時に `draft` を外し(または `false` にし)、commit & push すると自動デプロイされる

OGP 画像は `/og/blog/<slug>.png` としてビルド時に自動生成されるため、記事追加時の個別作業は不要です。

## プロジェクト構成

```
src/
├── content/blog/        # 記事本体(*.mdx)。frontmatter は Zod で検証
├── content.config.ts    # blog コレクション定義(Zod スキーマ)
├── pages/
│   ├── index.astro      # トップページ
│   ├── resume.astro     # レジュメ
│   ├── blog/            # 記事一覧・詳細([...slug].astro)
│   └── og/blog/         # OGP 画像の動的エンドポイント
├── layouts/Layout.astro # 共通レイアウト(ヘッダー・View Transitions)
├── styles/global.css    # Tailwind 読み込み + @theme + ベーススタイル
└── assets/fonts/        # OGP 用 Noto Sans CJK(otf)
docs/draft.md            # サイト仕様書(ドラフト)
```

## 技術スタック

| 項目             | 選定                                                           |
| :--------------- | :------------------------------------------------------------- |
| フレームワーク   | Astro 7.x(SSG、Content Collections + glob loader)              |
| コンテンツ       | MDX(@astrojs/mdx)+ Zod による frontmatter 検証                 |
| スタイリング     | Tailwind CSS 4.x(`@tailwindcss/vite`)+ @tailwindcss/typography |
| コードハイライト | Shiki(ビルド時、ゼロ JS)                                       |
| OGP 画像         | astro-og-canvas(ビルド時に静的 PNG 生成)                       |
| サイトマップ     | @astrojs/sitemap                                               |
| TypeScript       | `astro/tsconfigs/strict` 継承(strict モード)                   |
| ランタイム / PM  | Bun                                                            |
| ホスティング     | Cloudflare Pages(予定)                                         |

> **Note:** `astro.config.mjs` の `site: 'https://example.com'` は独自ドメイン確定までのプレースホルダです。sitemap / OGP / RSS の絶対 URL 生成に使われるため、ドメイン確定後に差し替えます。

## ドキュメント

- サイト仕様書: [docs/draft.md](docs/draft.md)
- 開発ルール(AI エージェント向け含む): [AGENTS.md](AGENTS.md)(`CLAUDE.md` はここへのシンボリックリンク)
