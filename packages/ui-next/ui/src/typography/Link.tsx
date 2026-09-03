/**
 * Typography.Link（链接）
 *
 * 渲染为 <a> 的链接文本，支持类型/禁用/复制/编辑/单行省略。
 * 是 Base 的薄包装：
 * - 固定 component="a"；
 * - target="_blank" 且未显式提供 rel 时，自动补 `noopener noreferrer`（安全）；
 * - ellipsis 只支持布尔（与 antd 一致，Link 不支持省略号配置对象）。
 */
import type { SlotsType } from 'vue';

import type {
  BlockProps,
  TypographyBaseEmits,
  TypographySlots,
} from './interface';

import { defineComponent } from 'vue';

import { omit } from '@arvin-studio/kit';

import { devUseWarning, isDev } from '../_util/warning';
import Base from './Base';

/** 将 emits 映射为 onXxx 监听器 prop 类型 */
export type TypographyBaseEmitsProps = {
  [K in keyof TypographyBaseEmits as `on${Capitalize<K & string>}`]?: TypographyBaseEmits[K];
};

export interface LinkProps
  extends
    BlockProps,
    /* @vue-ignore */
    TypographyBaseEmitsProps {
  /** 省略号：Link 仅支持布尔值 */
  ellipsis?: boolean;
  /** 链接地址 */
  href?: string;
  /** rel 属性（新窗口时自动补 noopener noreferrer） */
  rel?: string;
  /** 打开方式（_blank 等） */
  target?: string;
}

const Link = defineComponent<
  LinkProps,
  TypographyBaseEmits,
  string,
  SlotsType<TypographySlots>
>(
  (props, { slots, attrs, emit }) => {
    // dev 模式：ellipsis 传对象时告警（Link 不支持）
    if (isDev) {
      const warning = devUseWarning('Typography.Link');
      warning(
        typeof props.ellipsis !== 'object',
        'usage',
        '`ellipsis` only supports boolean value.',
      );
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
      // 新窗口打开且未指定 rel → 自动补安全 rel（防 tabnabbing）
      const rel =
        props.rel === undefined &&
        (props.target || (attrs as any).target) === '_blank'
          ? 'noopener noreferrer'
          : props.rel;
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
          component="a" // Link 固定渲染为 a 标签
          ellipsis={!!props.ellipsis} // 归一化为布尔
          rel={rel}
          v-slots={slots}
          {...listeners}
        />
      );
    };
  },
  {
    name: 'AsTypographyLink',
    inheritAttrs: false,
  },
);

export default Link;
