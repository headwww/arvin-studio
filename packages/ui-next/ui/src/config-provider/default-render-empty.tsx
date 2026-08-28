import type { VNodeChild } from 'vue';

import { defineComponent } from 'vue';

import Empty from '../empty';
import { useBaseConfig } from './context';

type ComponentName =
  | 'Cascader'
  | 'List'
  | 'Mentions'
  | 'Select'
  | 'Table'
  | 'Table.filter' /* 👈 5.20.0+ */
  | 'Transfer'
  | 'TreeSelect';

interface EmptyProps {
  componentName?: ComponentName;
}

export const DefaultRenderEmpty = defineComponent<EmptyProps>(
  (props) => {
    const { prefixCls } = useBaseConfig('empty');
    return () => {
      const { componentName } = props;
      const prefix = prefixCls.value;
      switch (componentName) {
        case 'Cascader':
        case 'Mentions':
        case 'Select':
        case 'Transfer':
        case 'TreeSelect': {
          return (
            <Empty
              class={`${prefix}-small`}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          );
        }
        case 'List':
        case 'Table': {
          return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        }
        /**
         * This type of component should satisfy the nullish coalescing operator(??) on the left-hand side.
         * to let the component itself implement the logic.
         * For example `Table.filter`.
         */
        case 'Table.filter': {
          // why `null`? legacy react16 node type `undefined` is not allowed.
          return null;
        }
        default: {
          // Should never hit if we take all the component into consider.
          return <Empty />;
        }
      }
    };
  },
  {
    name: 'ADefaultRenderEmpty',
    inheritAttrs: false,
  },
);
export type RenderEmptyHandler = (componentName?: ComponentName) => VNodeChild;
