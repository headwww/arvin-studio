import assign from './assign';

export interface DebounceOptions {
  /** 是否在之前执行 */
  leading?: boolean;
  /** 是否在之后执行 */
  trailing?: boolean;
}

interface DebouncedFunction {
  (this: any, ...args: any[]): void;
  cancel: () => boolean;
}

/**
 * 函数去抖；当被调用 n 毫秒后才会执行，如果在这时间内又被调用则将重新计算执行时间
 *
 * @param callback 回调
 * @param wait 毫秒
 * @param options 可选参数
 */
function debounce<C = any>(
  callback: (this: C, ...args: any[]) => any,
  wait: number,
  options?: DebounceOptions,
): (this: C, ...args: any[]) => any {
  let args: any[] | null = null;
  let context: any = null;
  const opts: DebounceOptions =
    typeof options === 'boolean'
      ? { leading: options, trailing: !options }
      : assign({ leading: false, trailing: true }, options);
  let runFlag = false;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const optLeading = opts.leading;
  const optTrailing = opts.trailing;

  const gcFn = function (): void {
    args = null;
    context = null;
  };

  const runFn = function (): void {
    runFlag = true;
    callback.apply(context, args as any);
    gcFn();
  };

  const endFn = function (): void {
    if (optLeading === true) {
      timeout = null;
    }
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

  const cancelFn = function (): boolean {
    const rest = timeout !== null;
    if (rest) {
      clearTimeout(timeout as ReturnType<typeof setTimeout>);
    }
    gcFn();
    timeout = null;
    runFlag = false;
    return rest;
  };

  const debounced = function (this: any, ...innerArgs: any[]): void {
    runFlag = false;
    args = innerArgs;
    context = this;
    if (timeout === null) {
      if (optLeading === true) {
        runFn();
      }
    } else {
      clearTimeout(timeout as ReturnType<typeof setTimeout>);
    }
    timeout = setTimeout(endFn, wait);
  } as DebouncedFunction;

  debounced.cancel = cancelFn;

  return debounced;
}

export default debounce;
