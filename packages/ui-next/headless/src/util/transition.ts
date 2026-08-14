/**
 * 过渡动画工具集（headless UI 共享）
 *
 * 提供组件库过渡动画所需的工具函数，对齐 as 的 motion 类名规范：
 * - getTransitionProps / getTransitionGroupProps：根据过渡名前缀生成 Vue
 *   <Transition> / <TransitionGroup> 的类名组合（enter / leave / appear / move 各阶段）
 * - collapseMotion：折叠/展开动画（高度 + 透明度，JS 驱动起止值、CSS 过渡）
 * - getTransitionDirection / getTransitionName：辅助工具
 *
 *  系组件库把动画拆成「阶段类名」+「全局样式表」两部分。
 * 本文件只负责在正确的时机挂上正确的类名集合，真正的动画 keyframes /
 * transition 定义在样式层（如 motion 样式文件）。
 * Vue 每个阶段只会加一个 from/active/to 类，但 as 样式表同时依赖
 * -enter / -appear / -prepare / -start 等多个类，所以这里把同一阶段的
 * 多个类合并成一个 class 字符串一次性传入。
 */
import type {
  CSSProperties,
  Ref,
  TransitionGroupProps,
  TransitionProps,
} from 'vue';

import { nextTick } from 'vue';

// 将参数数组转换为「字面量元组类型」，用于推导出精确的联合类型
const tuple = <T extends string[]>(...args: T) => args;

// Select 弹层支持的对齐位置（相对触发元素）
const SelectPlacements = tuple(
  'bottomLeft',
  'bottomRight',
  'topLeft',
  'topRight',
);
// 由元组推导出的联合类型：'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
export type SelectCommonPlacement = (typeof SelectPlacements)[number];

/**
 * 根据弹层位置推导滑入动画的方向
 * - 弹层在上方（topLeft / topRight）→ 内容向下滑入（slide-down）
 * - 弹层在下方 → 内容向上滑入（slide-up）
 * 未指定位置时默认按下方（slide-up）处理
 */
function getTransitionDirection(placement: SelectCommonPlacement | undefined) {
  if (
    placement !== undefined &&
    (placement === 'topLeft' || placement === 'topRight')
  ) {
    return `slide-down`;
  }
  return `slide-up`;
}

/**
 * 生成 Vue <Transition> 组件的 props
 *
 * 将 antd 风格各阶段的类名合并到 Vue 的 enterFromClass / enterActiveClass 等属性中：
 * - 类名集合里同时包含基础类（transitionName 本身）和各阶段类，
 *   可同时匹配 `.xxx-enter` 与 `.xxx.xxx-enter` 两种样式选择器写法
 * - enter 阶段合并了 appear 相关类：首次渲染（appear）与后续进入（enter）
 *   共用同一套起始动画
 *
 * @param transitionName 过渡名前缀（如 `ant-slide-up`）
 *                       为空时返回空对象，交由调用方用 JS 钩子控制动画
 * @param opt 调用方覆盖项，最后展开、优先级最高（可覆盖 appear、追加自定义钩子等）
 */
export function getTransitionProps(
  transitionName?: string,
  opt: TransitionProps = {},
) {
  if (!transitionName) {
    // 未指定过渡名 → 不注入任何类，纯 JS 过渡
    // 注：与 getTransitionGroupProps 的 `{ css: false, ...opt }` 不一致（历史遗留）
    return {};
  }
  // 注：由于上方已对空值提前返回，此三元表达式的 else 分支实际不可达（历史遗留）
  const transitionProps: TransitionProps = transitionName
    ? {
        name: transitionName, // Transition 名称：Vue 会据此自动生成 `{name}-enter-from` 等默认类
        appear: true, // 首次渲染也播放进入动画（appear 阶段）
        // type: 'animation',
        // appearFromClass: `${transitionName}-appear ${transitionName}-appear-prepare`,
        // appearActiveClass: `antdv-base-transtion`,
        // Enter 起始帧：-enter 与 -appear 同挂载以共享动画；
        // -prepare 为 Vue 3.5 的预备阶段类，-enter-start 即 enter-from
        enterFromClass: `${transitionName} ${transitionName}-enter ${transitionName}-appear ${transitionName}-appear-prepare ${transitionName}-enter-prepare ${transitionName}-enter-start`,
        // Enter 过渡进行中：transition / animation 定义在这个类上
        enterActiveClass: `${transitionName} ${transitionName}-enter ${transitionName}-appear ${transitionName}-appear-prepare ${transitionName}-enter-prepare `,
        // Enter 结束帧（Vue 3.5 的 enter-to）
        enterToClass: `${transitionName} ${transitionName}-enter ${transitionName}-appear ${transitionName}-appear-active ${transitionName}-enter-active`,
        // Leave 起始帧
        leaveFromClass: `${transitionName} ${transitionName}-leave`,
        // Leave 过渡进行中
        leaveActiveClass: `${transitionName} ${transitionName}-leave ${transitionName}-leave-active`,
        // Leave 结束帧
        leaveToClass: `${transitionName} ${transitionName}-leave ${transitionName}-leave-active`,
        ...opt,
      }
    : { css: false, ...opt };
  return transitionProps;
}

/**
 * 生成 Vue <TransitionGroup> 组件的 props
 *
 * 与 getTransitionProps 相同，额外补充：
 * - appear-start：appear 阶段专用的起始类（列表项首次渲染）
 * - moveClass：列表内元素因增删而「位移」时的过渡类（TransitionGroup 特有）
 *
 * 未指定过渡名时返回 `{ css: false, ...opt }` —— 关闭 CSS 过渡，仅保留 JS 钩子
 */
export function getTransitionGroupProps(
  transitionName?: string,
  opt: TransitionProps = {},
) {
  if (!transitionName) {
    return { css: false, ...opt };
  }
  const transitionProps: TransitionGroupProps = {
    name: transitionName,
    appear: true,
    // Enter 阶段（包含首次渲染的 appear；appear-start 仅 appear 阶段挂载）
    enterFromClass: `${transitionName} ${transitionName}-enter ${transitionName}-appear ${transitionName}-appear-prepare ${transitionName}-appear-start ${transitionName}-enter-prepare ${transitionName}-enter-start`,
    enterActiveClass: `${transitionName} ${transitionName}-enter ${transitionName}-appear ${transitionName}-appear-prepare ${transitionName}-enter-prepare`,
    enterToClass: `${transitionName} ${transitionName}-enter ${transitionName}-appear ${transitionName}-appear-active ${transitionName}-enter-active`,
    // Leave 阶段（元素离开）
    leaveFromClass: `${transitionName} ${transitionName}-leave`,
    leaveActiveClass: `${transitionName} ${transitionName}-leave ${transitionName}-leave-active`,
    leaveToClass: `${transitionName} ${transitionName}-leave ${transitionName}-leave-active`,
    // Move 阶段（元素位置移动，TransitionGroup 特有）
    moveClass: `${transitionName} ${transitionName}-move`,
    ...opt,
  };
  return transitionProps;
}

/**
 * 过渡事件对象：动画/过渡事件，可能带 deadline 标记
 * deadline 表示事件由「超时兜底」触发（而非真实动画结束），
 * 用于 JS 驱动的动画在没有 animationend 事件时的收尾
 */
export declare type MotionEvent = (AnimationEvent | TransitionEvent) & {
  deadline?: boolean;
};

/**
 * 过渡「进行中」的事件处理器
 * 返回目标 CSSProperties（如折叠动画的高度/透明度），
 * 由调用方写入元素内联样式
 */
export declare type MotionEventHandler = (
  element: Element,
  done?: () => void,
) => CSSProperties;

/**
 * 过渡「结束」的事件处理器
 * 返回值表示是否接管结束逻辑：
 * - 返回 true → 调用方自行处理结束（如跳过透明度过渡），不再调用 done
 * - 返回 false / void → 走正常结束流程
 */
export declare type MotionEndEventHandler = (
  element: Element,
  done?: () => void,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => boolean | void;

// ================== Collapse Motion ==================
// 折叠动画的三个关键状态（高度 + 透明度）
// 折叠态：高度 0、完全透明
const getCollapsedHeight: MotionEventHandler = () => ({
  height: 0,
  opacity: 0,
});
// 展开态：高度为内容真实高度（scrollHeight）、不透明
const getRealHeight: MotionEventHandler = (node) => ({
  height: `${node.scrollHeight}px`,
  opacity: 1,
});
// 当前实际渲染高度（offsetHeight）：用于离开前「固定」当前高度，避免过渡跳变
const getCurrentHeight: MotionEventHandler = (node: any) => ({
  height: `${node.offsetHeight}px`,
});
// const skipOpacityTransition: MotionEndEventHandler = (_, event) =>
//   (event as TransitionEvent).propertyName === 'height';

/**
 * 折叠/展开过渡的 props 类型
 * 在 Vue TransitionProps 基础上增加 css 开关与 name，供 collapseMotion 使用
 */
export interface CSSMotionProps extends Partial<TransitionProps> {
  css?: boolean;
  name?: string;
}

/**
 * 生成「折叠/展开」过渡配置（供 <Collapse> 等组件复用）
 *
 * 动画流程（JS 设定起止值 + CSS transition 平滑过渡）：
 *   展开：onBeforeEnter 设 height:0 / opacity:0
 *         → onEnter 在 nextTick 后设为 scrollHeight / opacity:1
 *         （nextTick 保证起始帧已渲染，随后修改才会触发过渡）
 *   收起：onBeforeLeave 固定为当前 offsetHeight
 *         → onLeave 在 setTimeout(0) 后收为 0（同样先渲染起始帧再变）
 *   结束：onAfterEnter / onAfterLeave 清空内联样式，恢复 CSS 默认值
 *
 * @param name 过渡类名前缀（默认 `ant-motion-collapse`）
 * @param style 外部持有的内联样式 ref，过渡期间由本函数写入
 * @param className 外部持有的类名 ref，过渡期间挂上 name 类（用于样式定位）
 */
function collapseMotion(
  name = 'ant-motion-collapse',
  style: Ref<CSSProperties>,
  className: Ref<string>,
): CSSMotionProps {
  return {
    name,
    appear: true, // 首次渲染也执行折叠动画（配合默认折叠/展开状态）
    css: true, // 使用 CSS transition 做平滑过渡
    onBeforeEnter: (node) => {
      // 进入起始帧：先压缩到折叠态
      className.value = name;
      // eslint-disable-next-line unicorn/no-invalid-argument-count
      style.value = getCollapsedHeight(node);
    },
    onEnter: (node) => {
      // 下一帧再展开到真实高度，触发 height/opacity 过渡
      nextTick(() => {
        style.value = getRealHeight(node);
      });
    },
    onAfterEnter: () => {
      // 过渡结束：清理过渡期间的内联样式与类名
      className.value = '';
      style.value = {};
    },
    onBeforeLeave: (node) => {
      // 离开起始帧：固定当前高度（否则高度未知，无法平滑收起）
      className.value = name;
      style.value = getCurrentHeight(node);
    },
    onLeave: (node) => {
      // 延迟一帧后收为折叠态，触发收起过渡
      setTimeout(() => {
        // eslint-disable-next-line unicorn/no-invalid-argument-count
        style.value = getCollapsedHeight(node);
      }, 0);
    },
    onAfterLeave: () => {
      // 离开结束：清理内联样式与类名
      className.value = '';
      style.value = {};
    },
  };
}

/**
 * 生成组件过渡类名
 * - 显式传入 transitionName 时优先使用
 * - 否则由「根前缀 + 动画名」拼接，如 ('ant', 'slide-up') → 'ant-slide-up'
 */
function getTransitionName(
  rootPrefixCls: string,
  motion: string,
  transitionName?: string,
) {
  if (transitionName !== undefined) {
    return transitionName;
  }
  return `${rootPrefixCls}-${motion}`;
}

export { collapseMotion, getTransitionDirection, getTransitionName };
