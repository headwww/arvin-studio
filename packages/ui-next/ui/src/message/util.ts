import type { CSSMotionProps } from '@arvin-studio/headless';

import type { MessageType } from './interface';

export function getMotion(
  prefixCls: string,
  transitionName?: string,
): CSSMotionProps {
  return {
    name: transitionName ?? `${prefixCls}-fade`,
  };
}

/** Wrap message open with promise like function */
export function wrapPromiseFn(
  openFn: (resolve: VoidFunction) => VoidFunction,
): MessageType {
  let closeFn: undefined | VoidFunction;

  const closePromise = new Promise<boolean>((resolve) => {
    closeFn = openFn(() => {
      resolve(true);
    });
  });

  const result: any = () => {
    closeFn?.();
  };

  // eslint-disable-next-line unicorn/no-thenable
  result.then = (filled: VoidFunction, rejected: VoidFunction) =>
    // eslint-disable-next-line unicorn/prefer-then-catch
    closePromise.then(filled, rejected);
  result.promise = closePromise;

  return result as MessageType;
}
