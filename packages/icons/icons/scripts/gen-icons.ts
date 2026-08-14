/**
 * @file 图标生成脚本：从 `@arvin-studio/icons-svg` 读取图标定义，
 * 为每个图标生成独立的 Vue 3 TSX 组件与统一入口文件（`src/icons`）。
 * 生成产物已纳入版本管理，文件头标注"自动生成"，请勿手动编辑。
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import allIconDefs from '@arvin-studio/icons-svg';
import { isNil, template } from 'es-toolkit/compat';
import { findPackage } from 'pkg-types';

import type { IconDefinition } from '@arvin-studio/icons-svg/es/types';

/**
 * 生成上下文中的图标定义：在原定义基础上补充生成所需字段。
 * @interface
 */
interface IconDefinitionWithIdentifier extends IconDefinition {
  /** 图标标识符（对象 key），同时用作生成组件名与文件名 */
  svgIdentifier: string;
  /** SVG 预览图（base64 data URL）；缺少真实 SVG 源文件时为 `null` */
  svgBase64: string | null;
}

/** ESM 环境下构造 `require`，用于解析 CommonJS 风格的包入口路径 */
const require = createRequire(import.meta.url);
/** `@arvin-studio/icons-svg` 包入口文件的绝对路径（经 pnpm 链接解析） */
const svgPkg = require.resolve('@arvin-studio/icons-svg');
/** `@arvin-studio/icons-svg` 包根目录（`package.json` 所在目录） */
const svgPkgDir = path.dirname(await findPackage(svgPkg));
/** 图标真实 SVG 源文件目录，按 `<theme>/<name>.svg` 结构存放 */
const inlineSvgDir = path.join(svgPkgDir, 'inline-namespaced-svg');

/**
 * 检测图标是否存在真实 SVG 源文件。
 * 组件渲染需要真实 SVG，缺失时返回 `null`，调用方仅跳过预览图生成。
 * @param icon - 图标定义，需含 `theme` 与 `name`
 * @returns 真实 SVG 文件路径；图标数据不完整或文件不存在时返回 `null`
 */
async function detectRealPath(icon: IconDefinition) {
  try {
    // theme/name 任一缺失则无法定位文件，直接视为无真实 SVG
    if ([icon, icon?.theme, icon?.name].some(isNil)) return null;

    const _path = path.join(inlineSvgDir, icon.theme, `${icon.name}.svg`);

    return fs.existsSync(_path) ? _path : null;
  } catch {
    // 路径拼接/访问异常按"无真实文件"处理，避免中断整体生成流程
    return null;
  }
}

/**
 * 将 SVG 文件转为 base64 data URL，并注入样式覆盖。
 * 生成结果用于组件文档注释中的预览图（Markdown 图片语法），
 * 统一宽高、填充色与主题色，保证预览图与品牌视觉一致。
 * @param svgPath - SVG 文件绝对路径
 * @param size - 注入的宽高（px），默认 `50`
 * @returns `data:image/svg+xml;base64,...` 形式的预览图 URL
 */
function svg2base64(svgPath: string, size = 50) {
  const svg = fs.readFileSync(svgPath, 'utf-8');
  // 覆盖宽高与默认填充色，并将主色/浅色背景替换为品牌色（蓝色系）
  const svgWithStyle = svg
    .replace(/<svg/, `<svg width="${size}" height="${size}" fill="#cacaca"`)
    .replace(/#333/g, '#1677ff')
    .replace(/#E6E6E6/gi, '#e6f4ff');

  // eslint-disable-next-line node/prefer-global/buffer
  const base64 = Buffer.from(svgWithStyle).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * 遍历全部图标定义，为每个图标补充真实 SVG 路径与预览图后执行回调。
 * 所有图标并行处理，单个图标的解析/预览失败不影响其他图标。
 * @param fn - 处理函数，接收补充了 `svgIdentifier`/`svgBase64` 的图标定义
 * @returns 每个图标回调结果的 Promise 数组
 */
function walk<T>(fn: (iconDef: IconDefinitionWithIdentifier) => Promise<T>) {
  return Promise.all(
    Object.keys(allIconDefs).map(async (svgIdentifier) => {
      const iconDef = (allIconDefs as { [id: string]: IconDefinition })[
        svgIdentifier
      ];

      const realSvgPath = await detectRealPath(iconDef!);
      let svgBase64 = null;
      if (realSvgPath) {
        try {
          svgBase64 = svg2base64(realSvgPath!);
        } catch {
          /** 预览图生成失败时降级为无预览，不阻断生成 */
        }
      }

      return fn({
        svgIdentifier,
        svgBase64,
        ...iconDef,
      } as any);
    }),
  );
}

/**
 * 生成图标组件：为每个图标写出独立 TSX 组件，并生成统一入口 `index.tsx`。
 * 组件模板引用 `@arvin-studio/icons-svg/es/asn/<name>.js` 的 SVG 资源，
 * 经 `AsIcon` 统一渲染；文件头标注"自动生成，勿手动编辑"。
 */
async function generateIcons() {
  // 以脚本所在目录为基准定位输出目录，与脚本位置解耦
  const baseDir = fileURLToPath(new URL('.', import.meta.url));
  const iconsDir = path.join(baseDir, '../src/icons');
  // 输出目录可能不存在，先创建再写入
  try {
    await fsp.access(iconsDir);
  } catch {
    await fsp.mkdir(iconsDir);
  }
  const render = template(
    `
// GENERATE BY ./scripts/gen-icons.ts
// DON NOT EDIT IT MANUALLY

import type { AsIconProps } from '../components/AsIcon'
import <%= svgIdentifier %>Svg from '@arvin-studio/icons-svg/es/asn/<%= svgIdentifier %>.js'
import { defineComponent } from 'vue'
import AsIcon from '../components/AsIcon'

<% if (svgBase64) { %> /**![<%= name %>](<%= svgBase64 %>) */ <% } %>
const <%= svgIdentifier %> = defineComponent<AsIconProps>(
  (props) => {
    return () => {
      return <AsIcon {...props} icon={<%= svgIdentifier %>Svg} />
    }
  },
  {
    name: '<%= svgIdentifier %>',
  },
)

export default <%= svgIdentifier %>`.trim(),
  );

  // 逐图标渲染并写出组件文件
  await walk(async (item) => {
    // 单个图标对应一个 `.tsx` 文件
    await fsp.writeFile(
      path.resolve(baseDir, `../src/icons/${item.svgIdentifier}.tsx`),
      render(item),
    );
  });
  // 生成统一入口：按标识符排序，保证导出顺序稳定、diff 友好
  const entryText = Object.keys(allIconDefs)
    .sort()
    .map(
      (svgIdentifier) =>
        `export { default as ${svgIdentifier} } from './${svgIdentifier}';`,
    )
    .join('\n');
  await fsp.writeFile(
    path.resolve(baseDir, '../src/icons/index.tsx'),
    entryText,
  );
}

generateIcons().then(() => {
  console.log('Generate icons successfully.');
});
