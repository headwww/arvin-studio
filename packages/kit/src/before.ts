import slice from './slice';

/**
 * 创建一个函数, 调用次数不超过 count 次之前执行回调并将所有结果记住后返回
 * @param count 次数
 * @param callback 回调
 * @param context 上下文
 */
function before<C = any>(
  count: number,
  callback: (this: C, rests: any[], ...args: any[]) => any,
  context?: C,
): (this: any, ...args: any[]) => any {
  let runCount = 0;
  const rests: any[] = [];
  return function (this: any, ...args: any[]): void {
    runCount++;
    if (runCount < count) {
      rests.push(args[0]);
      callback.apply(context as C, [rests, ...slice(args, 0)]);
    }
  };
}

export default before;
