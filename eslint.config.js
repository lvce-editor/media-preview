import * as config from '@lvce-editor/eslint-config'
import * as actions from '@lvce-editor/eslint-plugin-github-actions'

export default [
  ...config.default,
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
    files: ['packages/integration/**/*.ts', '**/*.test.ts'],
    rules: {
      '@cspell/spellchecker': 'off',
      'sonarjs/no-floating-point-equality': 'off',
      'sonarjs/no-identical-functions': 'off',
      'unicorn/no-global-object-property-assignment': 'off',
      'unicorn/numeric-separators-style': 'off',
    },
  },
]
