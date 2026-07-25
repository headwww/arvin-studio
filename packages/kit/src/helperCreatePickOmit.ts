import isFunction from './isFunction';
import isArray from './isArray';
import each from './each';
import findIndexOf from './findIndexOf';

/**
 * 创建 pick/omit 函数
 */
function helperCreatePickOmit(
  case1: boolean,
  case2: boolean,
): <T>(obj: T, callback: any, ...args: any[]) => Record<string, any> {
  return function <T>(
    this: any,
    obj: T,
    callback: any,
    ...restArgs: any[]
  ): Record<string, any> {
    let item: any;
    let index: number;
    const rest: Record<string, any> = {};
    const result: any[] = [];
    const context = this;
    let finalCallback: any = callback;
    if (!isFunction(finalCallback)) {
      for (index = 0; index < restArgs.length; index++) {
        item = restArgs[index];
        // oxlint-disable-next-line prefer-spread
        result.push.apply(result, isArray(item) ? item : [item]);
      }
      finalCallback = 0;
    }
    each(obj, function (val: any, key: string) {
      const findResult = finalCallback
        ? finalCallback.call(context, val, key, obj)
        : (findIndexOf(result, function (name: any) {
            return name === key;
          }) as number) > -1;
      if (findResult ? case1 : case2) {
        rest[key] = val;
      }
    });
    return rest;
  };
}

export default helperCreatePickOmit;
