import * as config from '@lvce-editor/eslint-config'
import * as actions from '@lvce-editor/eslint-plugin-github-actions'

export default [
  ...config.default,
  ...config.recommendedVirtualDom,
  ...actions.default,
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      'unicorn/prefer-number-coercion': 'off',
    },
  },
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
]
