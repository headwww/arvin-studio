/**
 * Typography.Paragraph（段落）
 *
 * 渲染为 <div> 的段落文本，支持编辑/复制/多行省略（含展开）。
 * 是 Base 最直接的薄包装：仅固定 component="div" 并透传所有 props。
 */
import type { SlotsType } from 'vue';

import type {
  BlockProps,
  TypographyBaseEmits,
  TypographySlots,
} from './interface';

import { defineComponent } from 'vue';

import { omit } from '@arvin-studio/kit';

import Base from './Base';

/** 将 emits 映射为 onXxx 监听器 prop 类型 */
export type TypographyBaseEmitsProps = {
  [K in keyof TypographyBaseEmits as `on${Capitalize<K & string>}`]?: TypographyBaseEmits[K];
};

export interface ParagraphProps
  extends
    BlockProps,
    /* @vue-ignore */
    TypographyBaseEmitsProps {}

const Paragraph = defineComponent<
  ParagraphProps,
  TypographyBaseEmits,
  string,
  SlotsType<TypographySlots>
>(
  (props, { slots, attrs, emit }) => {
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
      // 剔除监听器，避免与 listeners 重复
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
          component="div" // Paragraph 固定渲染为 div
          v-slots={slots}
          {...listeners}
        />
      );
    };
  },
  {
    name: 'AsTypographyParagraph',
    inheritAttrs: false,
  },
);

export default Paragraph;
