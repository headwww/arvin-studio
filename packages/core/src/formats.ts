import { each, isFunction, keys, merge, objectEach } from '@arvin-studio/kit';

export namespace AsGlobalFormatsHandles {
  export interface FormatsOptions {}
}

/**
 * 全局格式化
 */
export interface AsGlobalFormats {
  add(
    name: string,
    options:
      | ((params: any, ...args: any[]) => number | string)
      | AsGlobalFormatsHandles.FormatsOptions,
  ): AsGlobalFormats;
  delete(name: null | string | undefined): void;
  forEach(
    callback: (
      options: AsGlobalFormatsHandles.FormatsOptions,
      name: string,
    ) => void,
  ): void;
  get(name: null | string | undefined): AsGlobalFormatsHandles.FormatsOptions;
  has(name: null | string | undefined): boolean;
  mixin(opts: {
    [name: string]:
      | ((params: any, ...args: any[]) => number | string)
      | AsGlobalFormatsHandles.FormatsOptions;
  }): AsGlobalFormats;
}

class ASFormatsStore {
  private store: any = {};

  add(name: string, render: any): ASFormatsStore {
    const conf = this.store[name];
    // 兼容
    if (isFunction(render)) {
      console.warn(
        `参数 "formats -> callback" 已废弃，请使用 "cellFormatMethod"`,
      );
      render = {
        cellFormatMethod: render,
      };
    }

    // 检测是否覆盖
    const confKeys = keys(conf);
    each(render, (item, key) => {
      if (confKeys.includes(key)) {
        console.warn(
          `" ${name} " 的参数 "  ${key} " 重复定义，这可能会出现错误`,
        );
      }
    });
    this.store[name] = conf ? merge(conf, render) : render;
    return this;
  }

  delete(name: string): void {
    delete this.store[name];
  }

  forEach(callback: any): void {
    objectEach(this.store, callback);
  }

  get(name: string): any {
    return this.store[name];
  }

  has(name: string): boolean {
    return !!this.get(name);
  }

  mixin(options: any): ASFormatsStore {
    each(options, (item, key) => {
      this.add(key, item);
    });
    return this;
  }
}

export const formats = new ASFormatsStore() as AsGlobalFormats;

Object.assign(formats, { _name: 'Formats' });
