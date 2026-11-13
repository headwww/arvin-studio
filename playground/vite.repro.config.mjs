import { mergeConfig } from 'vite';

import base from './vite.config';

export default mergeConfig(base, {
  build: {
    outDir: '/tmp/repro-dist',
    emptyOutDir: true,
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      treeshake: false,
      input: '/Users/shuwen/WorkSpace-Web/arvin-studio/playground/repro.html',
      output: {
        entryFileNames: 'repro.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
