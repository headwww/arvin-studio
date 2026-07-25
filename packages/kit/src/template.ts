import setupDefaults from './setupDefaults';
import toValueString from './toValueString';
import trim from './trim';
import get from './get';

export interface TemplateOptions {
  tmplRE?: RegExp;
}

/**
 * 解析动态字符串模板
 *
 * @param str - 字符串模板
 * @param args - 参数对象
 * @param options - 配置项 { tmplRE: 正则表达式 }
 * @returns 解析后的字符串
 */
function template(str: string | null | undefined, args: any | any[]): string;
function template(str: any, args: any | any[]): string;
function template(
  str: string | null | undefined,
  args: any | any[],
  options: TemplateOptions,
): string;
function template(
  str: any,
  args: any | any[],
  options?: TemplateOptions,
): string;
function template(
  str: any,
  args: any | any[],
  options?: TemplateOptions,
): string {
  const tmplRE =
    (options || setupDefaults).tmplRE || /\{{2}([.\w[\]\s]+)\}{2}/g;
  return toValueString(str).replace(tmplRE, function (_: string, key: string) {
    return get(args, trim(key));
  });
}

export default template;
