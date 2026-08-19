import type { CSSProperties, InputHTMLAttributes } from 'vue';

import type {
  ChangeEventHandler,
  CompositionEventHandler,
  FocusEventHandler,
  InputFocusOptions,
  KeyboardEventHandler,
  MouseEventHandler,
  VueNode,
} from '../util';
/**
 *  类型定义
 *
 * 分层结构：
 * - CommonInputProps：布局相关公共 props（prefix/suffix/addon/classNames/styles/allowClear）
 * - BaseInputProps：布局组件（BaseInput）的 props（在 CommonInputProps 之上加回调/ref 类）
 * - InputProps：完整输入框 props（原生 input 属性 + 事件 + count/showCount 等）
 * - InputRef：对外暴露的实例方法
 */
import type { LiteralUnion } from './utils/types';

/** 布局相关公共 props（Input 与 BaseInput 共用） */
export interface CommonInputProps {
  /** 后 addon（输入框外右侧，如 ".com"） */
  addonAfter?: VueNode;
  /** 前 addon（输入框外左侧，如 "http://"） */
  addonBefore?: VueNode;
  /** 清除按钮：布尔开启，或对象（自定义图标 / 禁用） */
  allowClear?: boolean | { clearIcon?: VueNode; disabled?: boolean };
  /** @deprecated Use `classNames` instead */
  /** @deprecated 请使用 `classNames` */
  classes?: {
    affixWrapper?: string;
    group?: string;
    wrapper?: string;
  };
  /** 各结构层级的自定义类名（affix 包裹层/前缀/后缀/分组等） */
  classNames?: {
    affixWrapper?: string;
    clear?: string;
    groupWrapper?: string;
    prefix?: string;
    suffix?: string;
    variant?: string;
    wrapper?: string;
  };
  /** 前缀内容（输入框内左侧） */
  prefix?: VueNode;
  /** 各结构层级的自定义样式 */
  styles?: {
    affixWrapper?: CSSProperties;
    clear?: CSSProperties;
    prefix?: CSSProperties;
    suffix?: CSSProperties;
  };
  /** 后缀内容（输入框内右侧，可叠加字数统计/清除按钮） */
  suffix?: VueNode;
}

/** data-* 自定义属性 */
type DataAttr = Record<`data-${string}`, string>;

/** 输入值类型：原生 input value 或 bigint */
export type ValueType = bigint | InputHTMLAttributes['value'];

/** BaseInput（布局容器）的 props */
export interface BaseInputProps extends CommonInputProps {
  /** 各结构层级渲染的标签类型（span/div）——部分场景（如 form 布局）需要块级 */
  components?: {
    affixWrapper?: 'div' | 'span';
    groupAddon?: 'div' | 'span';
    groupWrapper?: 'div' | 'span';
    wrapper?: 'div' | 'span';
  };
  /** 透传给 affix-wrapper 层的 data-* 属性 */
  dataAttrs?: {
    affixWrapper?: DataAttr;
  };
  disabled?: boolean;
  /** 是否聚焦（用于 affix-wrapper 的 focused 样式） */
  focused?: boolean;
  /** 清除时重置值/事件的回调（由 Input 提供） */
  handleReset?: MouseEventHandler;
  hidden?: boolean;
  onClear?: () => void;
  prefixCls?: string;
  readOnly?: boolean;
  /** 点击容器时聚焦 input 的回调 */
  triggerFocus?: () => void;
  /** 当前值（透传给 input 节点） */
  value?: ValueType;
}

/** 字数统计展示格式化器：接收 { value, count, maxLength } 返回展示内容 */
export type ShowCountFormatter = (args: {
  count: number;
  maxLength?: number;
  value: string;
}) => any;

/** 超长截断格式化器：当内容超过 max 时把 value 截断/格式化 */
export type ExceedFormatter = (
  value: string,
  config: { max: number },
) => string;

/** 字数统计配置 */
export interface CountConfig {
  /** 内容超过 max 时的截断格式化器 */
  exceedFormatter?: ExceedFormatter;
  /** 最大长度（独立于原生 maxlength；配合 strategy 按"字符数"而非 UTF-16 码元计数） */
  max?: number;
  /** 是否显示计数：布尔开启，或传入格式化器自定义展示 */
  show?: boolean | ShowCountFormatter;
  /** 计数策略：如何统计 value 的长度（如按 Unicode 码点、去除空白等） */
  strategy?: (value: string) => number;
}

/** 完整输入框的 props */
export interface InputProps extends Omit<
  CommonInputProps,
  'classNames' | 'styles'
> {
  autoComplete?: string;
  /**
   * 输入法组合期间是否触发 onChange：
   * - false（默认）：组合期间的中间值不触发，compositionEnd 后只触发一次最终值
   * - true：每次按键（含组合中间态）都触发
   */
  changeOnComposing?: boolean;
  /** 在公共 classNames 基础上追加 input / count 层级 */
  classNames?: CommonInputProps['classNames'] & {
    count?: string;
    input?: string;
  };
  components?: BaseInputProps['components'];
  count?: CountConfig;
  dataAttrs?: BaseInputProps['dataAttrs'];
  defaultValue?: any;
  disabled?: boolean;
  hidden?: boolean;
  htmlSize?: number;
  maxLength?: number;
  onBlur?: FocusEventHandler;
  onChange?: ChangeEventHandler;
  onClear?: () => void;
  onCompositionEnd?: CompositionEventHandler;
  onCompositionStart?: CompositionEventHandler;
  onFocus?: FocusEventHandler;
  onKeyDown?: KeyboardEventHandler;
  onKeyUp?: KeyboardEventHandler;
  onPressEnter?: KeyboardEventHandler;
  placeholder?: string;
  prefixCls?: string;
  readOnly?: boolean;
  showCount?:
    | boolean
    | {
        formatter: ShowCountFormatter;
      };
  styles?: CommonInputProps['styles'] & {
    count?: CSSProperties;
    input?: CSSProperties;
  };
  type?: LiteralUnion<
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week',
    string
  >;
  value?: ValueType;
}

/** 对外暴露的实例方法（通过 ref 获取） */
export interface InputRef {
  blur: () => void;
  focus: (options?: InputFocusOptions) => void;
  /** 原生 input 元素 */
  input: HTMLInputElement | null;
  /** 最外层可聚焦元素（有 affix/group 包裹时是容器，否则是 input 本身） */
  nativeElement: HTMLElement | null;
  select: () => void;
  setSelectionRange: (
    start: number,
    end: number,
    direction?: 'backward' | 'forward' | 'none',
  ) => void;
}
