/**
 * Form 相关注入上下文（provide / inject）
 *
 * 按用途分为三组：
 * 1. Variant 上下文：Form 把 variant 下发给子树内的所有表单控件，
 *    控件通过 useVariant hook 的优先级链消费；
 * 2. FormItem 状态上下文：Form.Item 把校验状态（status / hasFeedback / 反馈图标等）
 *    下发给内部输入控件，用于渲染错误/成功样式与反馈图标；
 * 3. FormItem 命令式上下文：Form.Item 把 triggerChange / clearValidate 等命令式
 *    方法暴露给内部输入控件，控件在事件回调中调用以联动 Form.Item。
 *
 * 每组都采用「Provider 注入 / useXxx 读取」配对导出：
 * 组件树上层（Form / Form.Item）调用 Provider，输入类控件调用 useXxx。
 */
import type { InjectionKey, Ref } from 'vue';

import type { ValidateStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider/context';

import { inject, provide, ref } from 'vue';

// ---------- 1. Variant 上下文：Form 下发 variant 给子树内所有表单控件 ----------

const VariantContextKey: InjectionKey<Ref<undefined | Variant>> =
  Symbol('VariantContextKey');

/** 注入 variant 上下文：Form 组件调用，把当前 variant 下发给子树 */
export function useVariantContextProvider(variant: Ref<undefined | Variant>) {
  provide(VariantContextKey, variant);
}

/** 读取 variant 上下文：输入控件调用，未设置时返回 ref(undefined)（走组件默认值） */
export function useVariantContext() {
  return inject(VariantContextKey, ref(undefined));
}

// ---------- 2. FormItem 状态上下文：Form.Item 把校验状态下发给内部输入控件 ----------

export interface FormItemStatusContextProps {
  /** 校验错误信息列表 */
  errors?: any[];
  /** 自定义反馈图标节点（校验通过/失败时的图标） */
  feedbackIcon?: any;
  /** 是否展示反馈图标 */
  hasFeedback?: boolean;
  /** 是否为 Form.Item 内部的实际输入元素（用于区分 addon 等辅助节点） */
  isFormItemInput?: boolean;
  // TODO name?: NamePath;
  /** 校验状态（success / warning / error 等），决定输入框的错误/成功样式 */
  status?: ValidateStatus;
  /** 校验警告信息列表 */
  warnings?: any[];
}

const FormItemInputContextKey: InjectionKey<Ref<FormItemStatusContextProps>> =
  Symbol('FormItemInputContextKey');

/** 注入 FormItem 状态上下文：Form.Item 调用，把校验状态下发给内部输入控件 */
export function useFormItemInputContextProvider(
  value: Ref<FormItemStatusContextProps>,
) {
  provide(FormItemInputContextKey, value);
}

/** 读取 FormItem 状态上下文：输入控件（Input / TextArea / InputNumber 等）调用 */
export function useFormItemInputContext() {
  return inject(FormItemInputContextKey, ref({} as FormItemStatusContextProps));
}

// ---------- 3. FormItem 命令式上下文：Form.Item 把命令式方法暴露给内部输入控件 ----------

export interface FormItemProviderProps {
  /** 清空该校验项的校验状态 */
  clearValidate: () => void;
  /** Form.Item 生成的表单项 id，用于 label 与输入框的关联 */
  fieldId: Ref<string | undefined>;
  /** 触发 Form.Item 的失焦联动（如触发校验） */
  triggerBlur: () => void;
  /** 触发 Form.Item 的值变更联动（如触发校验） */
  triggerChange: () => void;
  /** 触发 Form.Item 的聚焦联动 */
  triggerFocus: () => void;
}

const FormItemProviderContextKey: InjectionKey<FormItemProviderProps> = Symbol(
  'FormItemProviderContextKey',
);

/** 注入命令式上下文：Form.Item 调用，把联动方法暴露给内部输入控件 */
export function useFormItemProvider(value: FormItemProviderProps) {
  provide(FormItemProviderContextKey, value);
}

/**
 * 读取命令式上下文：输入控件调用。
 * @param rest 为 true 时先注入一份空实现（useFormItemProviderRest），
 *             用于输入控件不在 Form.Item 内的场景，保证调用不报空指针
 */
export function useFormItemContext(rest = false) {
  if (rest) {
    useFormItemProviderRest();
  }
  return inject(FormItemProviderContextKey, undefined);
}

/** 注入一份空实现（no-op）的命令式上下文，作为非 Form.Item 场景的兜底 */
export function useFormItemProviderRest() {
  return provide(FormItemProviderContextKey, {
    fieldId: ref(undefined),
    triggerChange: () => {},
    triggerBlur: () => {},
    clearValidate: () => {},
    triggerFocus: () => {},
  });
}
