import type { ListRef } from '../virtual-list';
import type { ListComponentProps, ListyProps } from './interface';

import { computed, defineComponent, ref } from 'vue';

import RawList from './RawList';
import VirtualList from './VirtualList';

export default defineComponent<ListyProps>((props, { expose }) => {
  const data = computed(() => props.items || []);

  const listRef = ref<ListRef | null>(null);

  expose({
    scrollTo: (config?: any) => {
      listRef.value?.scrollTo(config);
    },
  });
  return () => {
    const {
      virtual = true,
      prefixCls = 'headless-listy',
      ...restProps
    } = props;
    // ============================== Render ===============================
    const sharedListProps = {
      ...restProps,
      data: data.value,
      prefixCls,
    } as ListComponentProps;
    const listNode = virtual ? (
      <VirtualList ref={listRef} {...sharedListProps} />
    ) : (
      <RawList ref={listRef} {...sharedListProps} />
    );
    return listNode;
  };
});
