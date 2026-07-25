import { defineConfig } from '@arvin-studio/eslint-config';

export default defineConfig([
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/one-component-per-file': 'off',
      'vue/require-default-prop': 'off',
    },
  },
]);
