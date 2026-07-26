/**
 * 创建一个绑定上下文的函数
 *
 * @param callback 函数
 * @param context 上下文
 * @param args 额外的参数
 */
function bind<C = any>(
  callback: (this: C, ...args: any[]) => any,
  context: C,
  ...extraArgs: any[]
): (this: C, ...args: any[]) => any {
  const args = extraArgs;
  return function (this: any, ...innerArgs: any[]): any {
    return callback.apply(context, innerArgs.concat(args));
  };
}

export default bind;
