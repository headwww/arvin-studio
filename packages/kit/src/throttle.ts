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
function throttle(
  callback: (...args: any[]) => any,
  wait: number,
  options?: ThrottleOptions,
): (...args: any[]) => any {
  let args: any[] | null = null;
  let runFlag = false;
  let timeout: null | ReturnType<typeof setTimeout> = null;
  const opts = assign({ leading: true, trailing: true }, options);
  const optLeading = opts.leading;
  const optTrailing = opts.trailing;

  const gcFn = (): void => {
    args = null;
  };

  const runFn = (): void => {
    runFlag = true;
    callback(...(args as any[]));
    timeout = setTimeout(endFn, wait);
    gcFn();
  };

  const endFn = (): void => {
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

  const cancelFn = (): boolean => {
    const rest = timeout !== null;
    if (rest) {
      clearTimeout(timeout!);
    }
    gcFn();
    timeout = null;
    runFlag = false;
    return rest;
  };

  const throttled = Object.assign(
    (...callArgs: any[]): void => {
      args = callArgs;
      runFlag = false;
      if (timeout === null && optLeading === true) {
        runFn();
        return;
      }
      if (optTrailing === true) {
        timeout = setTimeout(endFn, wait);
      }
    },
    { cancel: cancelFn },
  );

  return throttled;
}

export default throttle;
