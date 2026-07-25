import hasOwnProp from './hasOwnProp';

/**
 * 对象迭代器，对对象中的每一项执行回调
 *
 * @param obj 对象
 * @param iterate 回调函数
 * @param context 回调函数的上下文（this 指向）
 */
function objectEach<T>(
  obj: T,
  iterate: (item: any, key: string, obj: T) => void,
  context?: any,
): void;
function objectEach(
  obj: any,
  iterate: (item: any, key: string, obj: any) => void,
  context?: any,
): void;
function objectEach(obj: any, iterate: any, context?: any): void {
  if (obj) {
    for (const key in obj) {
      if (hasOwnProp(obj, key)) {
        iterate.call(context, obj[key], key, obj);
      }
    }
  }
}

export default objectEach;
