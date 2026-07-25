import setupDefaults from './setupDefaults';
import arrayEach from './arrayEach';
import each from './each';
import isFunction from './isFunction';
import assign from './assign';
/**
 * JavaScript 函数库、工具类
 */
const ASKit: any = function (this: any) {};

/**
 * 版本信息
 */
const version = '@VERSION';

/**
 * 版本信息
 */
export const VERSION: string = version;

/**
 * 将您自己的实用函数扩展到 ASKit
 * @param methods 函数集
 */
export function mixin(...methods: { [key: string]: any }[]): void {
  arrayEach(methods, function (mod: any) {
    each(mod, function (fn: any, name: string) {
      ASKit[name] = isFunction(fn)
        ? function (this: any, ...args: any[]): any {
            const result = fn.apply(ASKit.$context, args);
            ASKit.$context = null;
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

ASKit.VERSION = version;
ASKit.version = version;
ASKit.mixin = mixin;
ASKit.setup = setup;
ASKit.setConfig = setConfig;
ASKit.getConfig = getConfig;

export default ASKit;
