import { oxlintConfig } from '@arvin-studio/oxlint-config';

import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [oxlintConfig],
  rules: {
    'prefer-const': 'off',
    'typescript/consistent-return': 'off',
    'prefer-spread': 'off',
    'unicorn/no-new-array': 'off',
  },
});
