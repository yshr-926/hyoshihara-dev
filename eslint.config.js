import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  {
    // 型検証・生成物・ロックファイル・デザイン比較用の試作(design-explorations/)は lint 対象外
    ignores: ['dist/', '.astro/', 'node_modules/', 'public/', 'design-explorations/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
);
