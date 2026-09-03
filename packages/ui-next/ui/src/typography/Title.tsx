/**
 * Typography.Title（标题）
 *
 * 渲染为 <h1>~<h5> 的标题组件，支持编辑/复制/多行省略（含展开）。
 * 是 Base 的薄包装：通过 level 决定渲染的标题标签。
 */
import type { SlotsType } from 'vue';

import type {
  BlockProps,
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

/** 合法标题级别（antd 支持 1-5，没有 h6） */
const TITLE_ELE_LIST = [1, 2, 3, 4, 5] as const;

export interface TitleProps
  extends
    Omit<BlockProps, 'strong'>,
    /* @vue-ignore */
    TypographyBaseEmitsProps {
  /** 标题级别（1-5），决定渲染 h1~h5 */
  level?: (typeof TITLE_ELE_LIST)[number];
}

const Title = defineComponent<
  TitleProps,
  TypographyBaseEmits,
  string,
  SlotsType<TypographySlots>
>(
  (props, { slots, attrs, emit }) => {
    // 默认级别 1
    const level = computed(() => props.level ?? 1);

    // dev 模式：level 不在 1-5 时告警
    if (isDev) {
      const warning = devUseWarning('Typography.Title');
      watchEffect(() => {
        warning(
          TITLE_ELE_LIST.includes(level.value as any),
          'usage',
          'Title only accept `1 | 2 | 3 | 4 | 5` as `level` value.',
        );
      });
    }

    // 合法级别 → h{level}；非法 → 兜底 h1
    const component = computed(() =>
      TITLE_ELE_LIST.includes(level.value as any) ? `h${level.value}` : 'h1',
    );

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
      // level 由 component 计算得出，不再透传给 Base（避免属性冲突）
      const restProps = omit(props, ['level']) as Record<string, any>;
      return (
        <Base
          {...(restAttrs as any)}
          {...restProps}
          component={component.value as any}
          v-slots={slots}
          {...listeners}
        />
      );
    };
  },
  {
    name: 'AsTypographyTitle',
    inheritAttrs: false,
  },
);

export default Title;
