import { each, isFunction, remove } from '@arvin-studio/kit';

export namespace AsGlobalInterceptorHandles {
  export interface InterceptorOptions {
    tableInterceptorMethod?: (params: any) => any;
  }

  export type InterceptorCallback = (params: any) => any;
  export interface InterceptorParams {}
}

/**
 * 全局事件拦截器
 */
export interface AsGlobalInterceptor {
  add(
    type: string,
    callback:
      | AsGlobalInterceptorHandles.InterceptorCallback
      | AsGlobalInterceptorHandles.InterceptorOptions,
  ): AsGlobalInterceptor;
  delete(
    type: null | string | undefined,
    callback?:
      | AsGlobalInterceptorHandles.InterceptorCallback
      | AsGlobalInterceptorHandles.InterceptorOptions,
  ): void;
  get(
    type: null | string | undefined,
  ): AsGlobalInterceptorHandles.InterceptorCallback[];
  mixin(options: {
    [type: string]:
      | AsGlobalInterceptorHandles.InterceptorCallback
      | AsGlobalInterceptorHandles.InterceptorOptions;
  }): AsGlobalInterceptor;
}

const storeMap: {
  [type: string]: AsGlobalInterceptorHandles.InterceptorCallback[];
} = {};

export const interceptor: AsGlobalInterceptor = {
  mixin(options: any) {
    each(options, (render, type) => {
      interceptor.add(type, render);
    });
    return interceptor;
  },
  get(type: any) {
    if (type) {
      return storeMap[type] || [];
    }
    return [];
  },
  add(type: any, render: any) {
    // 兼容
    if (isFunction(render)) {
      render = {
        tableInterceptorMethod: render,
      };
    }
    const callback = render.tableInterceptorMethod;

    if (callback) {
      let eList = storeMap[type];
      if (!eList) {
        eList = storeMap[type] = [];
      }

      // 检测重复
      if (eList.includes(callback)) {
        console.warn('Interceptor的参数 type 重复定义，这可能会出现错误');
      }

      eList.push(callback);
    }
    return interceptor;
  },
  delete(type: string, render: any) {
    const eList = storeMap[type];
    if (eList) {
      // 兼容
      if (isFunction(render)) {
        render = {
          tableInterceptorMethod: render,
        };
      }
      const callback = render ? render.tableInterceptorMethod : null;

      if (callback) {
        remove(eList, (fn) => fn === callback);
      } else {
        delete storeMap[type];
      }
    }
  },
};
