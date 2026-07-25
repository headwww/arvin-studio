import template from './template';

/**
 * 字符串格式化占位符
 *
 * @param str - 字符串模板
 * @param obj - 参数对象或数组
 * @returns 格式化后的字符串
 */
function toFormatString(str: string | null | undefined, list: any[]): string;
function toFormatString(str: any, obj: any): string;
function toFormatString(str: any, obj: any): string {
  return template(str, obj, { tmplRE: /\{([.\w[\]\s]+)\}/g });
}

export default toFormatString;
