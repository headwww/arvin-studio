#!/usr/bin/env node
/**
 * @arvin-studio/headless 产物后处理（tsdown 之后执行，构建与 watch 都会调用）
 *
 * tsdown（内部的 rolldown-plugin-dts）产出的 d.ts 有两处需要修正，
 * 否则在"关闭 skipLibCheck 的消费方"或"pnpm 严格 node_modules 布局"下会报错：
 *
 * 1) Vue 的类型实际声明在 @vue/runtime-core、@vue/reactivity 等子包里，
 *    TS 推导 defineComponent / defineSetupFnComponent 返回值时会写成
 *    import("@vue/runtime-core").DefineSetupFnComponent<...>。
 *    这些子包不是本包的依赖，pnpm 消费方解析不到 -> TS2307。
 *    vue 自身 re-export 了这些类型，统一改写成 import("vue")。
 *
 * 2) warningOnce 的"函数 + 静态属性"写法在合并声明时会变成
 *    `var preMessage: typeof preMessage;` 的自引用 -> TS2502。
 *    tsc 原生声明输出是 `typeof import("./warning").preMessage`，这里补回限定路径。
 *
 * 最后做产物卫生检查：d.ts 里不允许残留 pnpm store 路径或内部类型 WithTypedEmits。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Vue 子包 -> vue（已验证这些子包的公开类型 vue 全部 re-export） */
const VUE_SUBPACKAGE_RE =
  /@vue\/(?:runtime-core|runtime-dom|reactivity)(?=["'])/g;
/** d.ts 中不允许出现的内部实现细节 */
const FORBIDDEN = ['node_modules/.pnpm', 'WithTypedEmits'];

function walk(dir) {
  const out = [];
  // eslint-disable-next-line unicorn/no-unreadable-for-of-expression
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/**
 * @param {string} distDir
 * @returns {{ vueRewrites: number, selfRefFixes: number }}
 */
// eslint-disable-next-line unicorn/no-exports-in-scripts
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

  return { vueRewrites, selfRefFixes };
}

// 直接执行：node scripts/postbuild.mjs（tsdown 的 build:done 钩子会导入上面的函数）
if (
  // eslint-disable-next-line n/prefer-global/process
  process.argv[1] &&
  // eslint-disable-next-line n/prefer-global/process
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const distDir = fileURLToPath(new URL('../dist', import.meta.url));
  const { vueRewrites, selfRefFixes } = postbuild(distDir);
  // oxlint-disable-next-line no-console
  console.log(
    `[postbuild] done: vue subpackage rewrites=${vueRewrites}, self-ref fixes=${selfRefFixes}`,
  );
}
