import { defineConfig, globalIgnores } from 'eslint/config';
import { configs, plugins } from 'eslint-config-airbnb-extended';
import prettier from 'eslint-config-prettier/flat';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import checkFile from 'eslint-plugin-check-file';

export default defineConfig([
  globalIgnores(['.next/**', 'node_modules/**', 'coverage/**', 'next-env.d.ts']),
  plugins.stylistic,
  plugins.importX,
  plugins.react,
  plugins.reactHooks,
  plugins.reactA11y,
  plugins.next,
  plugins.typescriptEslint,
  ...configs.base.recommended,
  ...configs.base.typescript,
  ...configs.react.recommended,
  ...configs.react.typescript,
  ...configs.next.recommended,
  ...configs.next.typescript,
  {
    rules: {
      'import-x/prefer-default-export': 'off',
      'import-x/no-default-export': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
    },
  },
  {
    files: ['src/app/**/{page,layout,error,loading,not-found}.tsx', '**/*.config.*'],
    rules: { 'import-x/no-default-export': 'off' },
  },
  {
    files: ['**/*.config.*', '**/*.test.{ts,tsx}', 'vitest.setup.ts'],
    rules: { 'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }] },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { 'src/**/*.{ts,tsx}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/folder-naming-convention': [
        'error',
        { 'src/app/**/': 'NEXT_JS_APP_ROUTER_CASE', 'src/!(app)/**/': 'KEBAB_CASE' },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: { 'better-tailwindcss': { entryPoint: 'src/app/globals.css' } },
    rules: {
      'better-tailwindcss/no-unknown-classes': 'error',
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/no-restricted-classes': [
        'error',
        {
          restrict: [
            {
              // Only the utility segment (after the last variant colon) may not contain [...];
              // attribute variants such as data-[level=4]: and aria-[current=page]: are allowed.
              pattern: String.raw`(^|:)[^:]*\[[^:]*$`,
              message: 'No arbitrary values; add a token (DESIGN.md §6).',
            },
            {
              pattern: '^text-(xs|sm|base|lg|xl|[2-9]xl)$',
              message: 'Use the type scale: text-display|kpi|title|body|label|caption.',
            },
            { pattern: '^shadow-(?!popover$|none$)', message: 'No shadows except shadow-popover.' },
            { pattern: '^dark:', message: 'No dark: utilities; tokens switch with .dark.' },
            {
              pattern: '(^|:)(text|border|outline|decoration)-brand$',
              message: 'Brand green is never text or a border (DESIGN.md §2.1).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/ui/shadcn/**'],
    rules: { 'better-tailwindcss/no-restricted-classes': 'off' },
  },
  prettier,
]);
