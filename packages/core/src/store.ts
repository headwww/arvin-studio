import { each, keys, merge, objectEach } from '@arvin-studio/kit';

/**
 * 创建数据仓库
 */
export class Store {
  private store: any = {};

  add(name: string, options: any): Store {
    const conf = this.store[name];
    // 检测是否覆盖
    const confKeys = keys(conf);
    each(options, (item, key) => {
      if (confKeys.includes(key)) {
        console.warn(
          `[arvin-studio] Store "${name}" 中的属性 "${key}" 已被覆盖，请检查是否存在重复注册`,
        );
      }
    });
    this.store[name] = conf ? merge(conf, options) : options;
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

  mixin(options: any): Store {
    each(options, (item, key) => {
      this.add(key, item);
    });
    return this;
  }
}

export default Store;
