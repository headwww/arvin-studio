import type { SlotsType } from 'vue';

import type { TooltipProps } from '../../tooltip';

import { defineComponent } from 'vue';

import Tooltip from '../../tooltip';

export interface EmptyEmitsProps {}

export interface EllipsisTooltipProps
  /* @vue-ignore */
  extends EmptyEmitsProps {
  /** 是否启用省略号 */
  enableEllipsis: boolean;
  /** 是否实际处于省略态（非省略态悬停不显示） */
  isEllipsis?: boolean;
  /** 是否打开（由父级控制：悬停文字且未悬停操作区时） */
  open: boolean;
  /** tooltip 配置（title 为空时退化为普通渲染） */
  tooltipProps?: TooltipProps;
}

export interface EllipsisTooltipSlots {
  default?: () => any;
}

const EllipsisTooltip = defineComponent<
  EllipsisTooltipProps,
  Record<string, never>,
  string,
  SlotsType<EllipsisTooltipSlots>
>({
  name: 'TypographyEllipsisTooltip',
  inheritAttrs: false,
  setup(props, { slots }) {
    return () => {
      // 无 tooltip 或无省略号 → 直接渲染内容（不引入 Tooltip 层级）
      if (!props.tooltipProps?.title || !props.enableEllipsis) {
        return slots.default?.();
      }

      // 仅在"悬停 + 确实省略"时打开
      const mergedOpen = props.open && props.isEllipsis;
      return (
        <Tooltip open={mergedOpen} {...props.tooltipProps}>
          {slots.default?.()}
        </Tooltip>
      );
    };
  },
});

export default EllipsisTooltip;
