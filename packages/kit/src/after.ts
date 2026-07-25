import slice from './slice';

/**
 * 创建一个函数, 调用次数超过 count 次之后执行回调并将所有结果记住后返回
 *
 * @param count 调用次数
 * @param callback 完成回调
 * @param context 上下文
 */
function after<C = any>(
  count: number,
  callback: (this: C, ...args: any[]) => any,
  context?: C,
): (this: any, ...args: any[]) => any {
  let runCount = 0;
  const rests: any[] = [];
  return function (this: any, ...args: any[]) {
    runCount++;
    if (runCount <= count) {
      rests.push(args[0]);
    }
    if (runCount >= count) {
      callback.apply(context as C, [rests].concat(slice(args, 0)));
    }
  };
}

export default after;
