import each from './each';
import findIndexOf from './findIndexOf';
import isArray from './isArray';
import isFunction from './isFunction';

function helperCreatePickOmit(case1: boolean, case2: boolean) {
  return function (
    obj: any,
    callback?:
      | ((val: any, key: string, obj: any) => boolean)
      | string
      | string[],
    ...args: (string | string[])[]
  ) {
    const rest: Record<string, any> = {};
    let resolvedCallback:
      | ((val: any, key: string, obj: any) => boolean)
      | null = null;
    let result: string[] = [];

    if (isFunction(callback)) {
      resolvedCallback = callback as (
        val: any,
        key: string,
        obj: any,
      ) => boolean;
    } else {
      const keys = callback === undefined ? args : [callback, ...args];
      keys.forEach((item) => {
        result.push(...((isArray(item) ? item : [item]) as string[]));
      });
    }

    each(obj, (val: any, key: string) => {
      const matched = resolvedCallback
        ? resolvedCallback(val, key, obj)
        : findIndexOf(result, (name: string) => name === key) > -1;
      if (matched ? case1 : case2) {
        rest[key] = val;
      }
    });

    return rest;
  };
}

export default helperCreatePickOmit;
