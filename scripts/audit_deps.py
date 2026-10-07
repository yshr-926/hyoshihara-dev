#!/usr/bin/env python3
"""依存の脆弱性検査(CI の audit ジョブから呼ぶ)。

`bun audit` をそのまま CI に置くと、上流が固定ピンしている開発ツール由来の指摘で
**常に赤になり、本物の脆弱性が入っても気づけない**(赤が常態化すると誰も見なくなる)。
そこで `bun audit` の結果を**既知リスト(下の ACCEPTED)と突き合わせる**。

1. 既知リストに載っている指摘 → 通す
2. 載っていない指摘 → **落とす**。新しい脆弱性が出た合図
3. 既知リストにあるのに報告されなくなった指摘 → **落とす**。上流で直ったので
   リストから外す(放置すると例外が形骸化する)

## 既知リストに載せてよい条件

このサイトは静的生成(Astro の `output: 'static'`、アダプタなし)で、`dist/` の静的
ファイルだけを配信する。**node_modules のコードは本番で一切実行されない**。
依存が触る入力は、ビルド時のこのリポジトリ自身のソース(MDX / CSS / 設定)に限られ、
攻撃者が制御できる入力は無い。したがって「細工された入力による DoS / 情報漏えい」の
類は、この前提のもとでは影響しない。

前提が崩れる(SSR 化・アダプタ導入)と例外の根拠が無くなるので、`astro.config.mjs` に
`output: 'server'` / `adapter:` が現れたら検査を落とす(下の `assert_static_site`)。

## 使い方

    python3 scripts/audit_deps.py           # 検査
    python3 scripts/audit_deps.py --list    # 既知リストを表示
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


@dataclass(frozen=True)
class Accepted:
    """例外として通す指摘。"""

    #: 対象パッケージ名
    package: str
    #: GitHub Advisory の ID(GHSA-...)。同じ理由で通すものはまとめる
    ghsas: tuple[str, ...]
    #: 依存経路(bun pm why <package> の要約)と、なぜ通してよいのか
    reason: str
    #: どうなったら外すか
    review: str


#: 例外として通す指摘の一覧。
#:
#: **足すときは「なぜ本番に影響しないか」と「いつ外すか」を必ず書く。** 書かずに足すと
#: 暗黙の例外になる。外すのは、`bun update` で消えたとき(消えた指摘が残っていると
#: 検査が落ちて教えてくれる)。
ACCEPTED = (
    Accepted(
        package="brace-expansion",
        ghsas=(
            "GHSA-rgw5-rvv9-x895",
            "GHSA-qhr7-859c-m2p7",
            "GHSA-6j4f-fj2g-mc7p",
            "GHSA-q2hr-2g5m-vwhr",
        ),
        reason=(
            "minimatch 経由で eslint(開発依存)が引く。細工された glob パターンでの DoS。"
            "glob を渡すのは eslint.config.js(このリポジトリ)だけ"
        ),
        review="eslint / minimatch が brace-expansion を上げたら bun update で外す",
    ),
    Accepted(
        package="http-cache-semantics",
        ghsas=("GHSA-ch52-4w7c-c8xp",),
        reason=(
            "astro が引く HTTP クライアントのキャッシュ実装。複数ユーザーの応答を共有する"
            "サーバーで起きる問題で、ビルド時に手元で動くだけのこのサイトには当たらない"
        ),
        review="astro が http-cache-semantics を上げたら bun update で外す",
    ),
    Accepted(
        package="js-yaml",
        ghsas=("GHSA-5p4m-2wfm-xmqj", "GHSA-2883-xcg3-v3hh"),
        reason=(
            "@astrojs/internal-helpers(frontmatter の YAML 解析)が引く。"
            "細工された YAML での CPU 消費。解析対象はこのリポジトリの MDX の frontmatter だけ"
        ),
        review="@astrojs/internal-helpers が js-yaml を上げたら bun update で外す",
    ),
    Accepted(
        package="nanoid",
        ghsas=("GHSA-2v37-7h3g-55p8",),
        reason=(
            "postcss が引く。size=0 のカスタム生成器が無限ループする問題で、"
            "そのような呼び出しはこのビルドに無い"
        ),
        review="postcss が nanoid を上げたら bun update で外す",
    ),
    Accepted(
        package="postcss",
        ghsas=("GHSA-fxqj-rqcc-2cmp",),
        reason=(
            "vite / eslint-plugin-astro が引く。細工された sourceMappingURL で任意の .map を"
            "読む問題。処理対象の CSS はこのリポジトリのものだけ"
        ),
        review="vite / eslint-plugin-astro が postcss 8.5.23 以降に上げたら bun update で外す",
    ),
    Accepted(
        package="postcss-selector-parser",
        ghsas=("GHSA-rj75-hqrm-r3gf",),
        reason=(
            "@tailwindcss/typography と eslint-plugin-astro(ともに開発依存)が引く。"
            "細工されたセレクタでの CPU 消費。解析対象はこのリポジトリの CSS だけ"
        ),
        review="両パッケージが postcss-selector-parser を上げたら bun update で外す",
    ),
    Accepted(
        package="smol-toml",
        ghsas=("GHSA-7w5x-hrqm-74c2", "GHSA-r4xh-jqrq-34v2"),
        reason=(
            "@astrojs/internal-helpers(TOML frontmatter の解析)が引く。"
            "細工された TOML での DoS。TOML frontmatter はこのサイトでは使っていない"
        ),
        review="@astrojs/internal-helpers が smol-toml を上げたら bun update で外す",
    ),
    Accepted(
        package="source-map-js",
        ghsas=("GHSA-68fv-2mgg-jv7q",),
        reason=(
            "@tailwindcss/node と svgo(astro 経由)が引く。細工された source map での"
            "イベントループ占有。source map はこのビルドが自分で生成するものだけ"
        ),
        review="tailwind / svgo が source-map-js を上げたら bun update で外す",
    ),
)


def ghsa_of(url: str) -> str:
    """アドバイザリ URL から GHSA ID を取り出す。"""
    match = re.search(r"(GHSA-[0-9a-z-]+)", url)
    return match.group(1) if match else url


def run_audit() -> dict[str, list[dict]]:
    """bun audit --json の結果を返す。"""
    result = subprocess.run(
        ["bun", "audit", "--json"],
        capture_output=True,
        text=True,
        check=False,
        cwd=REPO_ROOT,
    )

    # 脆弱性が 1 件でもあると終了コードは 1 になる。ここでは結果を判定に使うので、
    # 終了コードそのものは見ない。先頭にバナーが出ることがあるので、最初の { から読む
    start = result.stdout.find("{")
    if start < 0:
        print("bun audit の出力を解釈できなかった:", file=sys.stderr)
        print(result.stdout or result.stderr, file=sys.stderr)
        sys.exit(1)

    return json.loads(result.stdout[start:])


def assert_static_site() -> list[str]:
    """既知リストの前提(静的生成、本番で依存コードを実行しない)が崩れていないか確かめる。"""
    config = (REPO_ROOT / "astro.config.mjs").read_text(encoding="utf-8")
    problems = []
    if re.search(r"output\s*:\s*['\"](server|hybrid)['\"]", config):
        problems.append("astro.config.mjs に output: 'server' / 'hybrid' がある")
    if re.search(r"^\s*adapter\s*:", config, re.M):
        problems.append("astro.config.mjs に adapter がある")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description="依存の脆弱性検査")
    parser.add_argument("--list", action="store_true", help="例外として通す指摘を一覧する")
    args = parser.parse_args()

    if args.list:
        print("例外として通す指摘(静的生成のため本番で実行されない依存)")
        for item in ACCEPTED:
            print(f"  {item.package}  {', '.join(item.ghsas)}")
            print(f"    理由: {item.reason}")
            print(f"    見直し: {item.review}")
        return 0

    if shutil.which("bun") is None:
        print("bun が見つからない", file=sys.stderr)
        return 1

    print("依存の脆弱性を検査する(bun audit + 既知リストとの突き合わせ)")

    broken = assert_static_site()
    if broken:
        print("\n既知リストの前提(静的生成)が崩れている:")
        for line in broken:
            print(f"  {line}")
        print("\nSSR 化するなら、本番で実行される依存を基準に既知リストを作り直すこと。")
        return 1

    findings = run_audit()
    accepted = {ghsa: item for item in ACCEPTED for ghsa in item.ghsas}

    unknown: list[str] = []
    seen: set[str] = set()

    for package, advisories in sorted(findings.items()):
        for advisory in advisories:
            ghsa = ghsa_of(advisory.get("url", ""))
            severity = advisory.get("severity", "unknown")
            title = advisory.get("title", "")
            item = accepted.get(ghsa)
            if item is None or item.package != package:
                unknown.append(f"  {severity}: {package} {ghsa}\n    {title}")
                continue
            seen.add(ghsa)

    stale = sorted(set(accepted) - seen)

    if unknown:
        print(f"\n既知リストに無い指摘が {len(unknown)} 件ある:")
        print("\n".join(unknown))
        print(
            "\nまず bun update で解消するか確かめる。解消しないなら、本番に影響しない理由と"
            "\n外す条件を書いたうえで scripts/audit_deps.py の ACCEPTED に足すこと。"
        )

    if stale:
        print(f"\n既知リストにあるが報告されなくなった指摘が {len(stale)} 件ある:")
        for ghsa in stale:
            print(f"  {accepted[ghsa].package} {ghsa}")
        print("\n上流で解消済み。scripts/audit_deps.py の ACCEPTED から外すこと。")

    if unknown or stale:
        return 1

    print(f"既知の指摘 {len(seen)} 件のみ(すべてビルド時にだけ使う依存)")
    print("詳細は python3 scripts/audit_deps.py --list")
    return 0


if __name__ == "__main__":
    sys.exit(main())
