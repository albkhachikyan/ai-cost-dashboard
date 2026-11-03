import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

// .mjs instead of .ts: steiger's TS config loader crashes on Node 22.14 (require(esm) bug).
export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Next routing lives in src/app (the FSD app layer).
    // Our FSD "pages" layer is named `views`; steiger only knows `pages`, so `views` is
    // simply not treated as a layer (not checked). Only rules that complain are disabled below.
    ignores: ['./src/app/**'],
  },
  {
    // Widgets/features are intentionally each used by the single dashboard view.
    rules: { 'fsd/insignificant-slice': 'off' },
  },
]);
