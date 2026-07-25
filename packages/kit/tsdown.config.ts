import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,

  entry: ['src/**/*.ts'],

  format: ['esm'],

  bundle: false,

  outDir: 'dist',

  outExtensions: () => ({
    js: '.js',
    dts: '.d.ts',
  }),
});
