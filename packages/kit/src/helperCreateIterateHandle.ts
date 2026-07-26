import hasOwnProp from './hasOwnProp';
import isArray from './isArray';

/**
 * 创建迭代器处理函数
 */
function helperCreateIterateHandle(
  prop: string,
  useArray: boolean,
  restIndex: number,
  matchValue: boolean,
  defaultValue: any,
): <T, C = any>(
  obj: T,
  iterate: (this: C, item: any, index: any, obj: T) => any,
  context?: C,
) => any {
  return function <T, C = any>(
    obj: T,
    iterate: (this: C, item: any, index: any, obj: T) => any,
    context?: C,
  ): any {
    if (obj && iterate) {
      if (prop && (obj as any)[prop]) {
        return (obj as any)[prop](iterate, context);
      }
      if (useArray && isArray(obj)) {
        for (let index = 0, len = (obj as any).length; index < len; index++) {
          if (
            !!iterate.call(context!, (obj as any)[index], index, obj) ===
            matchValue
          ) {
            return [true, false, index, (obj as any)[index]][restIndex];
          }
        }
      } else {
        for (const key in obj) {
          if (
            hasOwnProp(obj, key) &&
            !!iterate.call(context!, (obj as any)[key], key, obj) === matchValue
          ) {
            return [true, false, key, (obj as any)[key]][restIndex];
          }
        }
      }
    }
    return defaultValue;
  };
}

export default helperCreateIterateHandle;
