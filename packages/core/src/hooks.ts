import AsStore from './store';

export namespace AsGlobalHooksHandles {
  export interface HookOptions {}
}

export interface AsGlobalHooks {
  add(type: string, options: AsGlobalHooksHandles.HookOptions): AsGlobalHooks;
  delete(type: string): void;
  forEach(
    callback: (options: AsGlobalHooksHandles.HookOptions, type: string) => void,
  ): void;
  get(type: null | string | undefined): AsGlobalHooksHandles.HookOptions;
  has(type: null | string | undefined): boolean;
  mixin(options: {
    [type: string]: AsGlobalHooksHandles.HookOptions;
  }): AsGlobalHooks;
}

export const hooks = new AsStore() as AsGlobalHooks;
