import { AbstractNode, IconDefinition } from './types';

// 默认的双色图标颜色（主体色 + 辅助色）
const defaultColors = {
  primaryColor: '#333',
  secondaryColor: '#E6E6E6',
};

// renderIconDefinitionToSVGElement 的配置选项
export interface HelperRenderOptions {
  // 额外附加到根 <svg> 标签上的属性（如 class、data-* 等）
  extraSVGAttrs?: {
    [key: string]: string;
  };
  // 双色图标的颜色占位符，替换 icon 函数中的 primaryColor 和 secondaryColor
  placeholders?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

// 将 IconDefinition 渲染为 SVG 字符串
// 支持两种图标类型：
//   - 函数类型（双色）：调用 icon 函数传入颜色，生成 AbstractNode 再渲染
//   - 普通类型（单色/轮廓）：直接渲染 AbstractNode
export function renderIconDefinitionToSVGElement(
  icond: IconDefinition,
  options: HelperRenderOptions = {},
): string {
  if (typeof icond.icon === 'function') {
    // two-tone（双色）图标：传入颜色值生成 AST
    const placeholders = options.placeholders || defaultColors;
    return renderAbstractNodeToSVGElement(
      icond.icon(placeholders.primaryColor, placeholders.secondaryColor),
      options,
    );
  }
  // fill（填充）或 outlined（轮廓）图标：直接渲染
  return renderAbstractNodeToSVGElement(icond.icon, options);
}

// 递归将 AbstractNode 树渲染为 SVG 字符串
// 对根 <svg> 节点会合并 extraSVGAttrs，自闭合或包含子节点
function renderAbstractNodeToSVGElement(
  node: AbstractNode,
  options: HelperRenderOptions,
): string {
  // 根 svg 节点需要合并额外的属性
  const targetAttributes =
    node.tag === 'svg'
      ? {
          ...node.attrs,
          ...options.extraSVGAttrs,
        }
      : node.attrs;
  // 将属性对象转为 key="value" 形式的字符串数组
  const attributes = Object.keys(targetAttributes).reduce(
    (accumulator: string[], nextKey) => {
      const key = nextKey;
      const value = targetAttributes[key];
      const token = `${key}="${value}"`;
      accumulator.push(token);
      return accumulator;
    },
    [],
  );
  const attributesToken =
    attributes.length > 0 ? ' ' + attributes.join(' ') : '';
  // 递归渲染子节点
  const children = (node.children || [])
    .map((child) => renderAbstractNodeToSVGElement(child, options))
    .join('');

  if (children && children.length > 0) {
    return `<${node.tag}${attributesToken}>${children}</${node.tag}>`;
  }
  return `<${node.tag}${attributesToken} />`;
}
