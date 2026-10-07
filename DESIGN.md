# DESIGN.md — hirotoyoshihara.dev

値の一次ソースは `src/styles/global.css`(`@theme`)と `src/components/descent/descent.css`。ここはその要約と方針。

## 1. Visual Theme & Atmosphere

- デザイン方針: 「図面」を薄く残した紙面に、トップだけ「降下ログ」を重ねる。損失曲面の等高線と SGD の軌跡を画面全体の背景にし、その上に学習ジョブの出力として組んだプロフィールを左寄せで置く
- 密度: 情報は少なく、余白で階層を作る。メタ情報(epoch・step・loss・日付)だけ等幅で詰める
- キーワード: 精密 / 静か / 研究者の手つき / 遊び心は一点だけ
- 参照: 論文の Figure(図番 + キャプション、等高線の細線)/ tmux のステータス行(セクション移動)/ W&B の train/loss パネル(曲線と現在値)
- Signature moment: 最下部まで読むと SGD の点が大域最小 θ\* に収束し、θ\* で朱の波紋が 1 回広がる。ステータス行は `running` → `converged`、本文の最終行の ✓ が朱に点く

## 2. Color Palette & Roles

すべて `light-dark()`。ダークは同じ役割の値に置き換えるだけ。

| 役割       | Light     | Dark      | 用途                                                         |
| ---------- | --------- | --------- | ------------------------------------------------------------ |
| paper      | `#f5f7f8` | `#0e151c` | 地(トップ以外は方眼つき。トップは等高線が地を兼ねるので無地) |
| surface    | `#ffffff` | `#172029` | 紙の面(設定ブロック・連絡先)                                 |
| ink        | `#1f2e3a` | `#dbe4ec` | 本文                                                         |
| ink-muted  | `#5d6d7a` | `#8da0af` | 補助文・メタ情報                                             |
| line       | ink 16%   | ink 18%   | 罫線                                                         |
| cobalt     | `#1a56b0` | `#7aa9e8` | リンク・等高線・設定のキー・focus                            |
| shu        | `#c43a1e` | `#f0693f` | 現在地だけ(ナビの現在地、地図の軌跡・現在の点、現在の epoch) |
| status bar | `#1f2e3a` | `#172029` | ステータス行の帯(文字 `#dbe4ec`)。両テーマとも暗い帯         |

## 3. Typography Rules

- 和文: システムのゴシック(Hiragino / Yu Gothic / Noto Sans JP)。CJK の Web フォントは載せない
- 等幅: IBM Plex Mono 400 / 500(@fontsource)。epoch・step・loss・日付・プロンプト・ステータス行だけ
- 本文は等幅にしない(候補 10 の「等幅の和文は長文で読みにくい」を解消)。和文は `word-break: auto-phrase`

| Role               | Size                                    | Weight    | Line height               | Letter spacing |
| ------------------ | --------------------------------------- | --------- | ------------------------- | -------------- |
| Display(氏名)      | clamp(2.75rem, 1.5rem + 4.4vw, 4.75rem) | 700       | 1.05                      | -0.02em        |
| H2(epoch の見出し) | 1.5rem                                  | 700       | 1.35                      | 0.01em         |
| Lead(肩書き)       | 1.125rem                                | 600       | 1.5                       | —              |
| Body               | 0.9375rem                               | 400       | 1.85(自己紹介)/ 1.6(一覧) | 0.02em(和文)   |
| Meta(等幅)         | 12–13px                                 | 400 / 500 | 1.5                       | 0              |

## 4. Component Stylings

- 連絡先: アイコン + サービス名だけ(役割の説明は出さない)。高さ 44px、角丸 2px、1px 罫。主連絡先(LinkedIn)だけ ink の塗り。hover は罫線を ink に、押下は `scale(.97)`
- epoch の見出し: メタ行(`epoch i/E`・進み具合の 12×4px のセグメント・`step=`・`loss=`)+ h2。本文は左に 1px 罫、現在の epoch は罫が朱
- 設定ブロック(`config/profile.yaml`): objective・affiliation・languages の実データだけを載せる。surface + 1px 罫、等幅 13px、キーはコバルト
- 背景の地図: 等高線はコバルトの細線(主曲線 1px / 副曲線 0.6px、谷ほど濃い)。軌跡は朱 2px、これから通る道は点線。通過点は 8px の角印、θ\* は十字。本文の側には紙のベール(paper 72%)をかけ、軌跡の側へ 14rem で消す
- ステータス行: 画面下端に固定。左にセクションのタブ、右に train/loss の小さな曲線・step・L(θ)・実行状態

## 5. Layout Principles

- 本文は左寄せ(左余白 clamp(2.5rem, 7vw, 7.5rem)、1 行最大 40rem)。ヘッダーは全幅
- 本文の右に 260px 以上の空きがあれば、軌跡をそこへ収める(side)。足りなければ軌跡を本文の後ろに通し、全面に薄いベール(paper 58%)をかけて通過点は出さない(full)。どちらにするかは画面幅から実行時に決める
- ステータス行の高さ: PC 2rem / 狭い画面 2.75rem(44px)
- セクション間 3.5rem(PC 4.5rem)、セクション内 1.25rem
- 記事などトップ以外のページは従来どおり `max-w-site`(60rem)の 1 枠

## 6. Depth & Elevation

影は使わない。面の差は surface と 1px 罫だけで出す。

## 7. Motion

- イージング: `--ease-out-strong` cubic-bezier(.23,1,.32,1)(UI 全般)、easeOutExpo cubic-bezier(.16,1,.3,1)(収束の波紋)、easeOutBack cubic-bezier(.34,1.56,.64,1)(✓ の点灯)
- 時間: hover・押下 120ms / 状態の切替 200–280ms / 収束の点灯 600ms / 波紋 1200ms
- スクロール連動(軌跡・現在の点・損失曲線)は linear で、rAF で 1 フレームに 1 回だけ描く
- `prefers-reduced-motion: reduce` では波紋を出さない(global.css の一括規則で transition も止まる)

## 8. Do's and Don'ts

- Do: 朱は「現在地」の意味でだけ使う
- Do: 等高線はビルド時に SVG にする(ブラウザに d3 を送らない)
- Don't: 本文を等幅で組まない。メタ情報だけ等幅
- Don't: 空のセクションを出さない(記事 0 件なら記事の epoch も、ヘッダー・404 の記事への導線も消える)
- Don't: 設定ブロックに実データでない値を混ぜない(SGD の設定は図のキャプションで伝える)
- Don't: トップに方眼を敷かない(等高線と線が二重になる)

## 9. Responsive Behavior

- Breakpoints: sm 40rem(行が 2 カラムになる)/ lg 64rem(ステータス行に train/loss の曲線が出る)
- タッチターゲット 44px(連絡先・ステータス行)。地図の通過点はマウス用の近道で、キーボードと読み上げはステータス行で移動する

## 10. Agent Prompt Guide

Primary(操作)= cobalt / 現在地 = shu / Text = ink / Background = paper / Font = システムゴシック + IBM Plex Mono / Body 15px / Line height 1.85(和文の長文)
