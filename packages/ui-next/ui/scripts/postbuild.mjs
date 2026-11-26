#!/usr/bin/env node
/**
 * @arvin-studio/ui 产物后处理（tsdown 的 build:done 钩子会调用）
 *
 * tsdown 产出的 d.ts 里有两处不适合直接发布：
 *
 * 1) Vue 的类型实际声明在 @vue/runtime-core、@vue/reactivity 等子包里，
 *    这些子包不是本包的依赖，pnpm 严格布局下消费方会报 TS2307。
 *    vue 自身 re-export 了这些类型，统一改写成 vue。
 *
 * 2) src/table/module/extend-cell-area/extend-cell-area.d.ts 是手写声明，
 *    但 entry 排除了所有 .d.ts，tsdown 不会把它复制到 dist。
 *
 * 最后做产物卫生检查：不允许残留 pnpm store 路径、WithTypedEmits 或 @vue/ 引用。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_ROOT = fileURLToPath(new URL('..', import.meta.url));
const VUE_SUBPACKAGE_RE = /@vue\/(?:runtime-core|runtime-dom|reactivity)/g;
const FORBIDDEN = ['node_modules/.pnpm', 'WithTypedEmits', '@vue/'];
const HANDWRITTEN_DTS =
  'src/table/module/extend-cell-area/extend-cell-area.d.ts';

/** tsdown 可能把 config 连同本文件打包到临时目录，此时 import.meta.url 不可靠 */
function resolvePackageRoot() {
  if (fs.existsSync(path.join(SCRIPT_ROOT, HANDWRITTEN_DTS))) {
    return SCRIPT_ROOT;
  }
  return process.cwd();
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/**
 * @param {string} distDir
 * @returns {{ copiedDts: number, selfRefFixes: number, vueRewrites: number }}
 */
export function postbuild(distDir) {
  if (!fs.existsSync(distDir)) {
    throw new Error(`[postbuild] dist not found: ${distDir}`);
  }

  let vueRewrites = 0;
  let selfRefFixes = 0;

  for (const file of walk(distDir)) {
    if (!file.endsWith('.d.ts')) continue;

    const original = fs.readFileSync(file, 'utf8');
    let next = original;

    // 1) @vue/<subpkg> -> vue
    if (VUE_SUBPACKAGE_RE.test(next)) {
      next = next.replaceAll(VUE_SUBPACKAGE_RE, 'vue');
      vueRewrites += 1;
    }

    // 2) var X: typeof X -> var X: typeof import("./file.js").X
    const base = path.basename(file, '.d.ts');
    next = next.replaceAll(
      /var (\w+): typeof (\w+);/g,
      (match, name, target) =>
        name === target
          ? `var ${name}: typeof import("./${base}.js").${name};`
          : match,
    );
    if (
      next !== original &&
      /var \w+: typeof import\("\.\/[\w.-]+\.js"\)\.\w+;/.test(next)
    ) {
      selfRefFixes += 1;
    }

    if (next !== original) fs.writeFileSync(file, next);
  }

  // 手写声明不参与 entry，单独复制。
  const handwrittenSource = path.join(resolvePackageRoot(), HANDWRITTEN_DTS);
  if (!fs.existsSync(handwrittenSource)) {
    throw new Error(`[postbuild] handwritten d.ts not found: ${handwrittenSource}`);
  }
  const handwrittenTarget = path.join(
    distDir,
    'table/module/extend-cell-area/extend-cell-area.d.ts',
  );
  fs.mkdirSync(path.dirname(handwrittenTarget), { recursive: true });
  fs.copyFileSync(handwrittenSource, handwrittenTarget);
  const copiedDts = 1;

  const problems = [];
  for (const file of walk(distDir)) {
    if (!file.endsWith('.d.ts')) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const token of FORBIDDEN) {
      if (content.includes(token))
        problems.push(`${path.relative(distDir, file)}: contains "${token}"`);
    }
  }
  for (const required of ['index.js', 'index.d.ts']) {
    if (!fs.existsSync(path.join(distDir, required)))
      problems.push(`missing ${required}`);
  }
  if (problems.length > 0) {
    throw new Error(
      `[postbuild] dist sanity check failed:\n  - ${problems.join('\n  - ')}`,
    );
  }

  return { copiedDts, selfRefFixes, vueRewrites };
}

// 直接执行：node scripts/postbuild.mjs
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const distDir = fileURLToPath(new URL('../dist', import.meta.url));
  const { copiedDts, selfRefFixes, vueRewrites } = postbuild(distDir);
  console.log(
    `[postbuild] done: vue subpackage rewrites=${vueRewrites}, self-ref fixes=${selfRefFixes}, handwritten d.ts=${copiedDts}`,
  );
}
