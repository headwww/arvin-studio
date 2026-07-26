import arrayEach from './arrayEach';
import assign from './assign';
import each from './each';
import isFunction from './isFunction';
import setupDefaults from './setupDefaults';
/**
 * JavaScript 函数库、工具类
 */
const AsKit: any = function (this: any) {};

/**
 * 版本信息
 */
const version = '@VERSION';

/**
 * 版本信息
 */
export const VERSION: string = version;

/**
 * 将您自己的实用函数扩展到 AsKit
 * @param methods 函数集
 */
export function mixin(...methods: { [key: string]: any }[]): void {
  arrayEach(methods, (mod: any) => {
    each(mod, (fn: any, name: string) => {
      AsKit[name] = isFunction(fn)
        ? function (this: any, ...args: any[]): any {
            const result = fn.apply(AsKit.$context, args);
            AsKit.$context = null;
            return result;
          }
        : fn;
    });
  });
}

/**
 * 设置全局配置
 * @param options 全局参数
 */
export function setConfig(options: any): any {
  return assign(setupDefaults, options);
}

/**
 * 获取全局配置
 */
export function getConfig(): any {
  return setupDefaults;
}

/**
 * 设置全局配置
 */
export function setup(options: any): any {
  return assign(setupDefaults, options);
}

AsKit.VERSION = version;
AsKit.version = version;
AsKit.mixin = mixin;
AsKit.setup = setup;
AsKit.setConfig = setConfig;
AsKit.getConfig = getConfig;

export default AsKit;
