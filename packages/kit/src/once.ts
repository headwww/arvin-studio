/**
 * 创建一个只能调用一次的函数，只会返回第一次执行后的结果
 *
 * @param callback - 回调函数
 * @param context - 上下文对象
 * @param params - 额外的参数
 * @returns 只能调用一次的函数
 */
function once<S, C = any>(
  callback: (this: S, ...args: any[]) => any,
  context?: C,
  ...params: any[]
): (this: C | S, ...args: any[]) => any;
function once(callback: any, context?: any, ...params: any[]): any {
  let done = false;
  let rest: any = null;
  const args = params;

  return function (this: any, ...callArgs: any[]) {
    if (done) {
      return rest;
    }
    // slice(arguments) 用于捕获调用时的参数，与 params 合并后传给 callback
    rest = callback.apply(context, callArgs.concat(args));
    done = true;
    return rest;
  };
}

export default once;
