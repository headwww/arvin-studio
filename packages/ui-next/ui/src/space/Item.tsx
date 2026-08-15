import type { CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit } from '../_util';

import { defineComponent } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';

import { useSpaceContext } from './context'; // 读取父级下发的 latestIndex

export interface ItemProps {
  classes: {
    separator?: string;
  };
  className: string;
  index: number;
  styles: {
    separator?: CSSProperties;
  };
}

export interface ItemSlots {
  /** 子项内容 */
  default?: () => any;
  /** 分隔符插槽（内容为空则不渲染分隔符） */
  separator?: () => any;
}

const Item = defineComponent<
  ItemProps,
  EmptyEmit,
  string,
  SlotsType<ItemSlots>
>((props, { slots, attrs }) => {
  // 父级（Space）provide 的上下文，latestIndex = 最后一个有效子项索引
  const spaceContext = useSpaceContext();
  return () => {
    const { index, className, classes, styles } = props;
    const { latestIndex } = spaceContext.value;
    // 双重过滤：内容与分隔符都剔除空 vnode
    const children = filterEmpty(slots?.default?.());
    const separator = filterEmpty(slots?.separator?.());
    // 子项为空 → 不渲染任何东西（避免空 div 破坏间距）
    if (children.length === 0) {
      return null;
    }
    return (
      <>
        {/* 子项内容容器；attrs 透传（用户对 Item 的 class/style 落在这里） */}
        <div class={className} {...attrs}>
          {children}
        </div>
        {/* 分隔符：非最后一个子项（index < latestIndex）且分隔符非空才渲染 */}
        {index < latestIndex && separator.length > 0 && (
          <span
            class={[`${className}-item-separator`, classes.separator]}
            style={styles.separator}
          >
            {separator}
          </span>
        )}
      </>
    );
  };
});

export default Item;
