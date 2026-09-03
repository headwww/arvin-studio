/**
 * Typography.Text（行内文本）
 *
 * 渲染为 <span> 的排版文本，支持类型/禁用/复制/编辑/单行省略号。
 * 是 Base 的薄包装：ellipsis 只支持布尔或"不含 expandable/rows"的配置
 * （Text 场景下不需要多行省略/展开）。
 */
import type { SlotsType } from 'vue';

import type {
  BlockProps,
  EllipsisConfig,
  TypographyBaseEmits,
  TypographySlots,
} from './interface';

import { computed, defineComponent, watchEffect } from 'vue';

import { omit } from '@arvin-studio/kit';

import { devUseWarning, isDev } from '../_util/warning';
import Base from './Base';

/** 将 emits 映射为 onXxx 监听器 prop 类型 */
export type TypographyBaseEmitsProps = {
  [K in keyof TypographyBaseEmits as `on${Capitalize<K & string>}`]?: TypographyBaseEmits[K];
};

export interface TextProps
  extends
    BlockProps,
    /* @vue-ignore */
    TypographyBaseEmitsProps {
  /** 省略号配置：Text 不支持 expandable / rows（与 antd 行为一致） */
  ellipsis?: boolean | Omit<EllipsisConfig, 'expandable' | 'onExpand' | 'rows'>;
}

const Text = defineComponent<
  TextProps,
  TypographyBaseEmits,
  string,
  SlotsType<TypographySlots>
>(
  (props, { slots, attrs, emit }) => {
    // Text 的省略号只保留单行能力：剔除 expandable/rows
    const mergedEllipsis = computed(() => {
      const ellipsis = props.ellipsis;
      if (ellipsis && typeof ellipsis === 'object') {
        return omit(ellipsis as EllipsisConfig, ['expandable', 'rows']);
      }
      return ellipsis;
    });

    // dev 模式：传入 expandable/rows 时告警（Text 不支持）
    if (isDev) {
      const warning = devUseWarning('Typography.Text');
      watchEffect(() => {
        const ellipsis = props.ellipsis as any;
        warning(
          typeof ellipsis !== 'object' ||
            !ellipsis ||
            (!('expandable' in ellipsis) && !('rows' in ellipsis)),
          'usage',
          '`ellipsis` do not support `expandable` or `rows` props.',
        );
      });
    }

    // 统一把 emits 转成 Base 的 onXxx 监听器
    const listeners = {
      onClick: (e: MouseEvent) => emit('click', e),
      onCopy: (e?: MouseEvent) => emit('copy', e as any),
      onExpand: (expanded: boolean, e: MouseEvent) =>
        emit('expand', expanded, e),
      onEditStart: () => emit('edit:start'),
      onEditChange: (val: string) => emit('edit:change', val),
      onEditCancel: () => emit('edit:cancel'),
      onEditEnd: () => emit('edit:end'),
      'onUpdate:expanded': (val: boolean) => emit('update:expanded', val),
      'onUpdate:editing': (val: boolean) => emit('update:editing', val),
    };

    return () => {
      // 监听器已由 listeners 显式传递，从 attrs 中剔除避免重复/冲突
      const restAttrs = omit(attrs as any, [
        'onClick',
        'onCopy',
        'onExpand',
        'onEditStart',
        'onEditChange',
        'onEditCancel',
        'onEditEnd',
        'onUpdate:expanded',
        'onUpdate:editing',
      ]);
      return (
        <Base
          {...(restAttrs as any)}
          {...props}
          component="span" // Text 固定渲染为 span
          ellipsis={mergedEllipsis.value as any}
          v-slots={slots}
          {...listeners}
        />
      );
    };
  },
  {
    name: 'AsTypographyText',
    inheritAttrs: false,
  },
);

export default Text;
