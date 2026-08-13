import type { Config } from 'svgo';

/**
 * Base SVGO Config (v4 兼容)
 * inspired by Material UI Icons
 *
 * 浮点精度设为 2 位，绝大多数插件按名称字符串启用，
 * 显式禁用的插件直接从列表中移除即可。
 */
export const base: Config = {
  /**
   * SVG 数值精度的保留位数，例如路径坐标保留 2 位小数，
   * 能显著减小文件体积，且肉眼几乎看不出区别。
   */
  floatPrecision: 2,

  plugins: [
    // ===== 移除冗余文档与声明 =====
    'cleanupAttrs', // 清理多余的属性（如空值属性、命名空间前缀等）
    'removeDoctype', // 移除文档类型声明 <!DOCTYPE …>
    'removeXMLProcInst', // 移除 XML 处理指令 <?xml …?>
    'removeXMLNS', // 移除未使用的 XML 命名空间声明
    'removeComments', // 移除注释 <!-- … -->
    'removeMetadata', // 移除元数据元素 <metadata>
    'removeTitle', // 移除标题元素 <title>
    'removeDesc', // 移除描述元素 <desc>
    'removeEditorsNSData', // 移除编辑器特有的命名空间与数据（如 Adobe 等）

    // ===== 移除非必要或默认属性 =====
    'removeEmptyAttrs', // 移除值为空的属性
    'removeHiddenElems', // 移除隐藏元素（如 display="none" 或 opacity="0"）
    'removeEmptyText', // 移除空白的 <text> 元素
    'removeEmptyContainers', // 移除空的容器元素（如空的 <g>）
    'removeUselessDefs', // 移除未被引用的 <defs> 内容

    // 注意：`removeViewBox` 未启用，即保留 viewBox 属性（通常推荐保留）

    // ===== 清理并优化样式与颜色 =====
    'cleanupEnableBackground', // 清理或移除过时的 enable-background 属性
    'convertStyleToAttrs', // 将内联样式转换为 SVG 属性（在可能时）
    'convertColors', // 优化颜色表示（如 #FF0000 → red，缩短十六进制颜色）

    // ===== 路径与变换优化 =====
    'convertPathData', // 优化路径数据（去除冗余命令、精简小数点）
    'convertTransform', // 合并连续的变换矩阵为一个
    'convertShapeToPath', // 将简单形状（如 <circle>）转为更紧凑的 <path> 数据

    // ===== 移除未知、默认或未使用的属性/元素 =====
    'removeUnknownsAndDefaults', // 移除未知元素与属性，并清除与默认值相同的属性
    'removeNonInheritableGroupAttrs', // 移除 <g> 上那些无法被子元素继承的属性
    'removeUselessStrokeAndFill', // 移除重复或默认的 stroke / fill 属性
    'removeUnusedNS', // 移除未使用的命名空间

    // ===== ID 与数值清理 =====
    'cleanupIds', // （v4 小驼峰）清理或缩短 ID 名，去掉无用或重复的 ID
    'cleanupNumericValues', // 清理无意义的小数（如 3.0 → 3）

    // ===== 结构优化 =====
    'moveElemsAttrsToGroup', // 将多个元素上相同的属性上提至 <g>
    'moveGroupAttrsToElems', // 将 <g> 上的属性下放到子元素（若可行）
    'collapseGroups', // 合并嵌套的 <g> 以减少嵌套层级
    'mergePaths', // 合并具有相同样式的独立 <path> 为一个

    // ===== 排序与尺寸移除 =====
    'sortAttrs', // 按标准顺序给属性排序，便于阅读与压缩
    'removeDimensions' // 移除 width/height 属性（常配合 CSS 做响应式）

    // 注意：`removeRasterImages` 未启用，即允许保留栅格图像（默认行为）
  ]
};
