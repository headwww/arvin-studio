import type { RefOptionListProps } from '../../select';

import { defineComponent, shallowRef } from 'vue';

import { useBaseProps } from '../../select';
import RawOptionList from './List';

const OptionList = defineComponent(
  (_, { expose }) => {
    const baseProps = useBaseProps();
    const listRef = shallowRef<null | RefOptionListProps>(null);

    expose({
      onKeyDown: (event: KeyboardEvent) => listRef.value?.onKeyDown(event),
      onKeyUp: (event: KeyboardEvent) => listRef.value?.onKeyUp(event),
    });

    return () => (
      <RawOptionList
        {...((baseProps.value || {}) as any)}
        lockOptions={baseProps.value?.lockOptions}
        ref={(el: any) => {
          listRef.value = el;
        }}
      />
    );
  },
  {
    name: 'OptionList',
    inheritAttrs: false,
  },
);

export default OptionList;
