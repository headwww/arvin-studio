/* eslint-disable unicorn/no-unreadable-array-destructuring */
// oxlint-disable unicorn/no-process-exit
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { createServer, defineConfig } from 'vite';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

async function run() {
  const [, , entry, exportName = 'main'] = process.argv;
  if (!entry) {
    console.error('Usage: tsx ./scripts/vite-ssr-run.ts <module> [exportName]');
    process.exit(1);
  }

  const baseConfig = defineConfig({
    define: {
      CSSINJS_STATISTIC: JSON.stringify(
        process.env.CSSINJS_STATISTIC || 'undefined',
      ),
    },
    plugins: [
      tsxResolveTypes({
        defaultPropsToUndefined: ['Boolean'],
      }),
      vue(),
      vueJsx({}),
      {
        name: 'vue-docs-block',
        transform(_code, id) {
          if (id.includes('?vue&type=docs')) {
            return { code: 'export default {}', map: null };
          }
        },
      },
    ],
    optimizeDeps: {
      include: [
        '@arvin-studio/icons',
        '@arvin-studio/icons > @arvin-studio/icons-svg',
      ],
    },
    resolve: {
      alias: [
        {
          find: /^@arvin-studio\/ui(?=\/|$)/,
          replacement: path.resolve(repoRoot, 'src'),
        },
        {
          find: /^@arvin-studio\/cssinjs(?=\/|$)/,
          replacement: path.resolve(repoRoot, '../cssinjs/src'),
        },
      ],
    },
  });

  const server = await createServer({
    ...baseConfig,
    configFile: false,
    root: repoRoot,
    logLevel: 'warn',
    // SSR 加载用不到客户端依赖预构建，关闭以避免无谓的解析告警
    optimizeDeps: { noDiscovery: true, include: [] },
    server: {
      middlewareMode: true,
      hmr: false,
      watch: null,
    },
  });

  try {
    const mod = await server.ssrLoadModule(path.resolve(process.cwd(), entry));
    const fn = mod[exportName];
    if (typeof fn !== 'function')
      throw new TypeError(
        `Export "${exportName}" of ${entry} is not a function`,
      );
    await fn();
  } finally {
    await server.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
