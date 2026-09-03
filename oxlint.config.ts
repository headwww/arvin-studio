import { oxlintConfig } from '@arvin-studio/oxlint-config';

import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [oxlintConfig],
  rules: {
    'prefer-const': 'off',
    'typescript/consistent-return': 'off',
    'prefer-spread': 'off',
    'unicorn/no-new-array': 'off',
    'typescript/no-useless-default-assignment': 'off',
    'no-prototype-builtins': 'off',
    'array-callback-return': 'off',
    'no-template-curly-in-string': 'off',
  },
  ignorePatterns: [
    'packages/icons/**',
    'packages/ui-next/headless/src/qrcode/libs/qrcodegen.ts',
  ],
});
