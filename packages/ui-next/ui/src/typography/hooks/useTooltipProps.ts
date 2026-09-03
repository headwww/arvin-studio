/**
 * useTooltipProps：省略号 tooltip 配置解析钩子
 *
 * ellipsis.tooltip 支持多种形态，统一解析为 TooltipProps：
 * - true → 显示完整内容（编辑文本优先，缺省取子节点）
 * - VNode → 直接用该节点作为 title
 * - 对象 → TooltipProps + 默认 title（完整内容）
 * - undefined/null/字符串 → 原样作为 title（undefined 时 title 为 undefined，不显示）
 */
import type { TooltipProps } from '../../tooltip';

import { computed, isVNode, unref } from 'vue';

function useTooltipProps(tooltip: any, editConfigText: any, children: any) {
  return computed<TooltipProps | undefined>(() => {
    const mergedTooltip = unref(tooltip);
    const mergedEditText = unref(editConfigText);
    const mergedChildren = unref(children);

    // true：显示完整内容（编辑文本优先）
    if (mergedTooltip === true) {
      return { title: mergedEditText ?? mergedChildren };
    }
    // VNode：直接用节点
    if (isVNode(mergedTooltip)) {
      return { title: mergedTooltip };
    }
    // 对象：TooltipProps 展开，title 兜底为完整内容
    if (typeof mergedTooltip === 'object') {
      return {
        title: mergedEditText ?? mergedChildren,
        ...(mergedTooltip as TooltipProps),
      };
    }
    // 其他（undefined/null/字符串）：原样作为 title
    if (mergedTooltip === undefined || mergedTooltip === null) {
      return { title: mergedTooltip as any };
    }
    return { title: mergedTooltip as any };
  });
}

export default useTooltipProps;
