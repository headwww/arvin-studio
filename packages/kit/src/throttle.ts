import assign from './assign';

export interface ThrottleOptions {
  /** 是否在之前执行 */
  leading?: boolean;
  /** 是否在之后执行 */
  trailing?: boolean;
}

/**
 * 节流函数；当被调用 n 毫秒后才会执行，如果在这时间内又被调用则至少每隔 n 秒毫秒调用一次该函数
 *
 * @param callback - 回调函数
 * @param wait - 等待毫秒数
 * @param options - 可选参数 { leading: 是否在之前执行, trailing: 是否在之后执行 }
 * @returns 节流后的函数
 */
function throttle<C = any>(
  callback: (this: C, ...args: any[]) => any,
  wait: number,
  options?: ThrottleOptions,
): (this: C, ...args: any[]) => any;
function throttle(callback: any, wait: number, options?: any): any {
  let args: IArguments | null | any = null;
  let context: any = null;
  let runFlag = false;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const opts = assign({ leading: true, trailing: true }, options);
  const optLeading = opts.leading;
  const optTrailing = opts.trailing;

  const gcFn = function () {
    args = null;
    context = null;
  };

  const runFn = function () {
    runFlag = true;
    callback.apply(context, args);
    timeout = setTimeout(endFn, wait);
    gcFn();
  };

  const endFn = function () {
    timeout = null;
    if (runFlag) {
      gcFn();
      return;
    }
    if (optTrailing === true) {
      runFn();
      return;
    }
    gcFn();
  };

  const cancelFn = function () {
    const rest = timeout !== null;
    if (rest) {
      clearTimeout(timeout!);
    }
    gcFn();
    timeout = null;
    runFlag = false;
    return rest;
  };

  const throttled = function (this: any, ...callArgs: any[]) {
    args = callArgs;
    context = this;
    runFlag = false;
    if (timeout === null && optLeading === true) {
      runFn();
      return;
    }
    if (optTrailing === true) {
      timeout = setTimeout(endFn, wait);
    }
  };

  throttled.cancel = cancelFn;

  return throttled;
}

export default throttle;
