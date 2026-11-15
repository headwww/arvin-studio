import type { ComponentPublicInstance, DefineComponent, VNode } from 'vue';

/**
 * 组件配置
 */
export type DefineAsComponentOptions<P, E> = DefineComponent<E & P>;

/**
 * 组件实例
 */
export type DefineAsComponentInstance<P, M> = ComponentPublicInstance<P, M>;

/**
 * 组件通用的基础参数
 */
export interface AsComponentBaseOptions {
  xID: string;
}

/**
 * 组件事件参数
 */
export interface AsComponentEventParams {
  $event: Event;
}

/**
 * 全局事件默认参数
 */
export interface AsComponentEvent<E = Event> {
  $event: E;
  preventDefault(): void;
  stopPropagation(): void;
}

/**
 * 组件尺寸类型：特大xlarge，大号large，默认default，中号medium，小号small，最小mini
 */
export type AsComponentSizeType =
  | ''
  | 'default'
  | 'large'
  | 'medium'
  | 'mini'
  | 'small'
  | 'xlarge'
  | null;

/**
 * 组件对齐方式
 */
export type AsComponentAlignType = '' | 'center' | 'left' | 'right' | null;

/**
 * 组件状态
 */
export type AsComponentStatusType =
  | ''
  | 'danger'
  | 'error'
  | 'info'
  | 'perfect'
  | 'primary'
  | 'success'
  | 'warning'
  | null;

/**
 * 组件样式类型
 */
export type AsComponentStyleType = Record<string, number | string>;

/**
 * 组件 className 类型
 */
export type AsComponentClassNameType = Record<string, boolean>;

/**
 * 组件插槽类型
 */
export type AsComponentSlotType = string | VNode;

/**
 * 权限码类型
 */
export type AsComponentPermissionCodeType = number | string;

/**
 * 权限码判断结果
 */
export type AsComponentPermissionResult =
  | boolean
  | {
      disabled: boolean;
      visible: boolean;
    };

/**
 * 权限码判断方法
 */
export type AsComponentPermissionMethod = (params: {
  code: AsComponentPermissionCodeType;
}) => AsComponentPermissionResult;

/**
 * 权限码信息
 */
export interface AsComponentPermissionInfo {
  code?: AsComponentPermissionCodeType;
  disabled: boolean;
  visible: boolean;
}

type CamelToKebabRest<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? `${First extends Lowercase<First> ? '' : '-'}${Lowercase<First>}${CamelToKebabRest<Rest>}`
    : S;
type CamelToKebab<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Lowercase<First>}${CamelToKebabRest<Rest>}`
  : S;

/**
 * 将带驼峰字符串转成字符串,例如： ProjectName 转为 project-name
 */
export type AsComponentKebabCaseKeys<T> = {
  [K in keyof T as K extends string ? CamelToKebab<K> : K]: T[K];
};

/**
 * 将指定的属性设置为必选类型
 */
export type AsWithRequired<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};
