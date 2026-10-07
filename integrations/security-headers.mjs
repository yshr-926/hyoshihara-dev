// @ts-check
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * ビルド後の dist/ にあるインラインスクリプトの sha256 を集め、CSP を含むセキュリティヘッダーを
 * dist/_headers に書き出す。Cloudflare Workers の静的アセット配信がこのファイルを読んで応答に付ける。
 *
 * ハッシュを手で書かずビルド時に計算するのは、インラインスクリプト(is:inline のものに加え、
 * Astro が小さいバンドルを自動でインライン化したもの)が変わるたびに CSP が壊れるのを防ぐため。
 * Astro 組み込みの security.csp は <meta> で出すため frame-ancestors を指定できず、ヘッダーで出す。
 *
 * style-src の 'unsafe-inline' は、Shiki のコードハイライトが style 属性で色を付けるため。
 * CSS からスクリプトは動かせないので、script-src ほどの危険はない。
 * HSTS は Cloudflare のゾーン設定が付けるので、ここでは出さない(二重になるため)。
 *
 * @returns {import('astro').AstroIntegration}
 */
export default function securityHeaders() {
  return {
    name: 'hyoshihara:security-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const hashes = new Set();

        for (const file of await listHtml(outDir)) {
          const html = await readFile(file, 'utf8');
          for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
            if (/\bsrc=/.test(attrs) || !isJavaScript(attrs)) continue;
            hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
          }
        }

        const csp = [
          "default-src 'self'",
          `script-src 'self' ${[...hashes].sort().join(' ')}`.trim(),
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
          "font-src 'self'",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'none'",
          "frame-ancestors 'none'",
          'upgrade-insecure-requests',
        ].join('; ');

        const headers = [
          '/*',
          `  Content-Security-Policy: ${csp}`,
          '  X-Frame-Options: DENY',
          '  Referrer-Policy: strict-origin-when-cross-origin',
          '  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          '  Cross-Origin-Opener-Policy: same-origin',
          '',
        ].join('\n');

        await writeFile(join(outDir, '_headers'), headers);
        logger.info(`_headers を書き出した(インラインスクリプト ${hashes.size} 件)`);
      },
    },
  };
}

/** type 属性が無いか JavaScript を指すものだけが CSP の対象(application/ld+json などのデータは除く) */
function isJavaScript(attrs) {
  const type = attrs.match(/\btype=["']?([^"'\s>]+)/)?.[1]?.toLowerCase();
  return (
    !type || type === 'module' || type === 'text/javascript' || type === 'application/javascript'
  );
}

/** @param {string} dir */
async function listHtml(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => join(e.parentPath, e.name));
}
