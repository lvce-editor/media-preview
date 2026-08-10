import * as config from '@lvce-editor/eslint-config'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...config.default,
  ...config.recommendedVirtualDom,
  ...config.recommendedActions,
  ...config.recommendedTsconfig,
  {
    files: ['**/*.test.ts'],
    rules: {
      '@cspell/spellchecker': 'off',
      'sonarjs/no-floating-point-equality': 'off',
      'sonarjs/no-identical-functions': 'off',
      'unicorn/no-global-object-property-assignment': 'off',
      'unicorn/numeric-separators-style': 'off',
      'virtual-dom/no-inline-event-handlers': 'off',
      'virtual-dom/no-inline-style': 'off',
    },
  },
  {
    files: ['packages/extension/src/parts/Main/Main.ts'],
    rules: {
      'virtual-dom/prefer-state-destructuring': 'off',
    },
  },
  {
    files: ['packages/extension/src/parts/RenderMediaPreview/RenderMediaPreview.ts'],
    rules: {
      'virtual-dom/no-inline-style': 'off',
    },
  },
])
