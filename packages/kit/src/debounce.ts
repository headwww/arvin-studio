import assign from './assign';

export interface DebounceOptions {
  /** 是否在之前执行 */
  leading?: boolean;
  /** 是否在之后执行 */
  trailing?: boolean;
}

interface DebouncedFunction {
  (...args: any[]): void;
  cancel: () => boolean;
}

/**
 * 函数去抖；当被调用 n 毫秒后才会执行，如果在这时间内又被调用则将重新计算执行时间
 *
 * @param callback 回调
 * @param wait 毫秒
 * @param options 可选参数
 */
function debounce(
  callback: (...args: any[]) => any,
  wait: number,
  options?: DebounceOptions,
): (...args: any[]) => any {
  let args: any[] | null = null;
  const opts: DebounceOptions =
    typeof options === 'boolean'
      ? { leading: options, trailing: !options }
      : assign({ leading: false, trailing: true }, options);
  let runFlag = false;
  let timeout: null | ReturnType<typeof setTimeout> = null;
  const optLeading = opts.leading;
  const optTrailing = opts.trailing;

  const gcFn = (): void => {
    args = null;
  };

  const runFn = (): void => {
    runFlag = true;
    callback(...(args as any[]));
    gcFn();
  };

  const endFn = (): void => {
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

  const cancelFn = (): boolean => {
    const rest = timeout !== null;
    if (rest) {
      clearTimeout(timeout as ReturnType<typeof setTimeout>);
    }
    gcFn();
    timeout = null;
    runFlag = false;
    return rest;
  };

  const debounced = Object.assign(
    (...innerArgs: any[]): void => {
      runFlag = false;
      args = innerArgs;
      if (timeout === null) {
        if (optLeading === true) {
          runFn();
        }
      } else {
        clearTimeout(timeout as ReturnType<typeof setTimeout>);
      }
      timeout = setTimeout(endFn, wait);
    },
    { cancel: cancelFn },
  ) as DebouncedFunction;

  return debounced;
}

export default debounce;
