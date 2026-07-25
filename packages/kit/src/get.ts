import staticHGKeyRE from './staticHGKeyRE';
import helperGetHGSKeys from './helperGetHGSKeys';
import hasOwnProp from './hasOwnProp';
import isUndefined from './isUndefined';
import eqNull from './eqNull';

type PropertyPath = undefined | null | number | number[] | string | string[];

function getDeepProps(obj: any, key: string): any {
  const matchs = key ? key.match(staticHGKeyRE) : '';
  return matchs
    ? matchs[1]
      ? obj[matchs[1]]
        ? obj[matchs[1]][matchs[2] as any]
        : undefined
      : obj[matchs[2] as any]
    : obj[key];
}

// oxlint-disable-next-line typescript/consistent-return
function getValueByPath(obj: any, property: PropertyPath): any {
  if (obj) {
    if (obj[property as any] || hasOwnProp(obj, property as any)) {
      return obj[property as any];
    }
    const props = helperGetHGSKeys(property);
    const len = props.length;
    if (len) {
      let rest = obj;
      for (let index = 0; index < len; index++) {
        rest = getDeepProps(rest, props[index] as any);
        if (eqNull(rest)) {
          if (index === len - 1) {
            return rest;
          }
          return undefined;
        }
      }
      return rest;
    }
  }
}

/**
 * 获取对象的属性的值，如果值为 undefined，则返回默认值
 * @param obj 对象
 * @param property 键、路径
 * @param defaultValue 默认值
 */
function get<T extends object, K extends keyof T>(
  obj: T,
  property: PropertyPath,
  defaultValue?: any,
): T[K];
function get(obj: any, property: PropertyPath, defaultValue?: any): any;
function get(obj: any, property: PropertyPath, defaultValue?: any): any {
  if (eqNull(obj)) {
    return defaultValue;
  }
  const result = getValueByPath(obj, property);
  return isUndefined(result) ? defaultValue : result;
}

export default get;
