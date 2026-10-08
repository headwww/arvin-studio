import { each, eqNull, objectEach } from '@arvin-studio/kit';

export interface AsGlobalRendererOptions {}

export namespace AsGlobalRendererHandles {}

/**
 * 渲染器
 */
export interface AsGlobalRenderer {
  add(name: string, options: AsGlobalRendererOptions): AsGlobalRenderer;
  delete(name: null | string | undefined): void;
  forEach(
    callback: (
      item: AsGlobalRendererOptions,
      name: string,
      renderMap: Record<string, AsGlobalRendererOptions>,
    ) => void,
  ): AsGlobalRenderer;
  get(name: null | string | undefined): AsGlobalRendererOptions;
  mixin(options: Record<string, AsGlobalRendererOptions>): AsGlobalRenderer;
}

/**
 * 内置的组件渲染
 */
const renderMap: Record<string, AsGlobalRendererOptions> = {};

/**
 * 全局渲染器
 */
export const renderer: AsGlobalRenderer = {
  mixin(opts) {
    each(opts, (options: any, name: any) => renderer.add(name, options));
    return renderer;
  },
  get(name: null | string | undefined) {
    return (renderMap[name as string] || null) as any;
  },
  add(name, options) {
    if (name && options) {
      const renders: any = renderMap[name];
      if (renders) {
        // 检测是否覆盖
        each(options, (val: any, key: any) => {
          if (!eqNull(renders[key]) && renders[key] !== val) {
            console.warn(
              `[arvin-studio] 渲染器 "${name}" 中的属性 "${key}" 已被覆盖，请检查是否存在重复注册`,
            );
          }
        });

        Object.assign(renders, options);
      } else {
        renderMap[name] = options;
      }
    }
    return renderer;
  },
  forEach(callback) {
    objectEach(renderMap, callback);
    return renderer;
  },
  delete(name: string) {
    delete renderMap[name];
    return renderer;
  },
};
