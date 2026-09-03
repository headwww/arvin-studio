import type { CSSProperties } from 'vue';

/**
 * Typography 类型定义（共享契约）
 *
 * 定义 Typography 全家桶（Typography/Text/Title/Paragraph/Link）共用的
 * props 类型与配置结构：editable（编辑）、copyable（复制）、ellipsis（省略号）、
 * actions（操作区）、语义化类名/样式等。
 */
import type { TextAreaProps as VcTextAreaProps } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type {
  ComponentBaseProps,
  DirectionType,
} from '../config-provider/context';
import type { TooltipProps } from '../tooltip';

/** 语义化文字类型（仅影响颜色） */
export type BaseType = 'danger' | 'secondary' | 'success' | 'warning';

/** 复制配置 */
export interface CopyConfig {
  /** 剪贴板格式：纯文本 / HTML */
  format?: 'text/html' | 'text/plain';
  /** 复制图标（[默认, 成功] 两个状态，或单个） */
  icon?: VueNode | VueNode[];
  /** 复制成功后的回调 */
  onCopy?: (event?: MouseEvent) => void;
  /** 复制按钮的 tab 顺序 */
  tabIndex?: number;
  /** 复制的文本；缺省时取组件内容文本；可为异步函数 */
  text?: (() => Promise<string> | string) | string;
  /** tooltip 文案（[默认, 已复制] 两个状态），false 表示不显示 */
  tooltips?: false | VueNode | VueNode[];
}

/** 编辑配置 */
export interface EditConfig {
  /** 文本域自适应高度 */
  autoSize?: boolean | VcTextAreaProps['autoSize'];
  /** 是否处于编辑态（受控） */
  editing?: boolean;
  /** 确认（回车）图标 */
  enterIcon?: VueNode;
  /** 编辑图标 */
  icon?: VueNode;
  /** 输入最大长度 */
  maxLength?: number;
  /** 取消编辑回调 */
  onCancel?: () => void;
  /** 内容变化回调 */
  onChange?: (value: string) => void;
  /** 编辑结束回调（确认或取消后） */
  onEnd?: () => void;
  /** 开始编辑回调 */
  onStart?: () => void;
  /** 编辑按钮的 tab 顺序 */
  tabIndex?: number;
  /** 编辑初始文本 */
  text?: string;
  /** 编辑按钮 tooltip */
  tooltip?: VueNode;
  /** 触发编辑的方式：图标和/或点击文本 */
  triggerType?: ('icon' | 'text')[];
}

/** 省略号配置 */
export interface EllipsisConfig {
  /** 初始展开态 */
  defaultExpanded?: boolean;
  /** 是否可展开/收起（'collapsible' 表示展开后可再收起） */
  expandable?: 'collapsible' | boolean;
  /** 展开态（受控） */
  expanded?: boolean;
  /** 是否处于省略态的回调 */
  onEllipsis?: (ellipsis: boolean) => void;
  /** 展开/收起回调 */
  onExpand?: (e: MouseEvent, info: { expanded: boolean }) => void;
  /** 最大行数 */
  rows?: number;
  /** 省略号后的后缀文本 */
  suffix?: string;
  /** 展开/收起按钮的符号（可为函数，接收当前展开态） */
  symbol?: ((expanded: boolean) => VueNode) | VueNode;
  /** 悬停时的 tooltip（省略内容预览） */
  tooltip?: TooltipProps | VueNode;
}

/**
 * 操作区（expand/edit/copy 按钮容器）配置
 * @since 1.3.0 (mirrors ant-design 6.4 ActionsConfig)
 */
export interface ActionsConfig {
  /** 操作区位置：文本前（start）或文本后（end，默认） */
  placement?: 'end' | 'start';
}

/** 语义化类名：按部件名追加自定义类 */
export interface TypographySemanticClassNames {
  action?: string;
  actions?: string;
  root?: string;
  textarea?: string;
}

/** 语义化样式：按部件名追加自定义样式 */
export interface TypographySemanticStyles {
  action?: CSSProperties;
  actions?: CSSProperties;
  root?: CSSProperties;
  textarea?: CSSProperties;
}

/** 合并全局后完整类名/样式类型 */
export type TypographyClassNamesType = SemanticClassNamesType<
  BlockProps,
  TypographySemanticClassNames
>;
export type TypographyStylesType = SemanticStylesType<
  BlockProps,
  TypographySemanticStyles
>;

/** 块级文字组件（Text/Title/Paragraph/Link 共用）的 props */
export interface BlockProps extends ComponentBaseProps {
  /** 透传 data-* 自定义属性 */
  [key: `data-${string}`]: number | string | undefined;
  /**
   * 操作区配置（expand/edit/copy 的位置）
   * @since 1.3.0
   */
  actions?: ActionsConfig;
  /** 语义化类名 */
  classes?: TypographyClassNamesType;
  /** 行内代码样式 */
  code?: boolean;
  /** 渲染的标签类型（如 'a' / 'span' / 'div'） */
  component?: keyof HTMLElementTagNameMap | string;
  /** 可复制配置 */
  copyable?: boolean | CopyConfig;
  /** 删除线样式 */
  delete?: boolean;
  /** 方向（局部覆盖全局 rtl/ltr） */
  direction?: DirectionType;
  /** 禁用态 */
  disabled?: boolean;
  /** 可编辑配置 */
  editable?: boolean | EditConfig;
  /** 省略号配置 */
  ellipsis?: boolean | EllipsisConfig;
  id?: string;
  /** 斜体样式 */
  italic?: boolean;
  /** 键盘按键样式 */
  keyboard?: boolean;
  /** 高亮标记样式 */
  mark?: boolean;
  /** 加粗样式 */
  strong?: boolean;
  /** 语义化样式 */
  styles?: TypographyStylesType;
  /** 原生 title 属性 */
  title?: string;
  /** 语义化文字类型 */
  type?: BaseType;
  /** 下划线样式 */
  underline?: boolean;
}

/** 插槽：默认内容 */
export interface TypographySlots {
  default?: () => any;
}

/** Typography 家族事件（Base 及四个变体统一 emit 这些事件） */
export interface TypographyBaseEmits {
  click: (e: MouseEvent) => void;
  /** 复制完成 */
  copy: (e?: MouseEvent) => void;
  /** 取消编辑 */
  'edit:cancel': () => void;
  /** 编辑内容变化 */
  'edit:change': (value: string) => void;
  /** 编辑结束 */
  'edit:end': () => void;
  /** 开始编辑 */
  'edit:start': () => void;
  /** 展开/收起 */
  expand: (expanded: boolean, e: MouseEvent) => void;
  /** 编辑态更新（受控） */
  'update:editing': (editing: boolean) => void;
  /** 展开态更新（受控） */
  'update:expanded': (expanded: boolean) => void;
}

/** Typography 根容器的最小 props（ATypography 使用） */
export interface TypographyBaseProps extends ComponentBaseProps {
  component?: keyof HTMLElementTagNameMap | string;
  direction?: DirectionType;
  prefixCls?: string;
  rootClass?: string;
  // classes?: TypographyClassNamesType
  // styles?: TypographyStylesType
  title?: string;
}
