import type { CSSProperties } from 'vue';

import type { VueNode } from '../_util';
import type { Key, MasonryProps } from './Masonry';

import { defineComponent, shallowRef, watch } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

export interface MasonryItemType<T = any> {
  children?: VueNode;
  class?: string;
  column?: number;
  data: T;
  height?: number;
  key: Key;
  style?: CSSProperties;
}

interface MasonryItemProps extends Pick<MasonryProps, 'itemRender'> {
  class?: string;
  column: number;
  index: number;
  item: MasonryItemType;
  onResize?: null | VoidFunction;
  prefixCls: string;
  style: CSSProperties;
}

const MasonryItem = defineComponent<MasonryItemProps>(
  (props, { slots }) => {
    const domRef = shallowRef<HTMLDivElement>();
    let observer: null | ResizeObserver = null;
    const onResize = () => {
      const onResize = props?.onResize;
      if (onResize) {
        onResize();
      }
    };

    // Listen for resize
    watch(
      [() => props.onResize, domRef],
      (_n, _o, onCleanup) => {
        const _onResize = props.onResize;
        // 赋值的情况下的处理方案
        if (_onResize && domRef.value) {
          observer = new ResizeObserver(onResize);
          observer.observe(domRef.value);
        }
        onCleanup(() => {
          if (!observer) {
            return;
          }

          observer.disconnect();
          observer = null;
        });
      },
      {
        immediate: true,
        flush: 'post',
      },
    );
    return () => {
      const {
        item,
        style,
        prefixCls,
        class: className,
        itemRender,
        index,
        column,
      } = props;
      const itemPrefix = `${prefixCls}-item`;
      // ====================== Render ======================
      const children = filterEmpty(slots?.default?.() ?? []);
      const renderNode =
        children.length > 0
          ? children
          : itemRender?.({
              ...item,
              index,
              column,
            });

      return (
        <div class={clsx(itemPrefix, className)} ref={domRef} style={style}>
          {renderNode}
        </div>
      );
    };
  },
  {
    name: 'AsMasonryItem',
    inheritAttrs: false,
  },
);

export default MasonryItem;
