import type { VueNode } from '../../util';
import type { OperationIcons } from './index';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

export interface PrevNextProps {
  count: number;
  current: number;
  icons: OperationIcons;
  onActive: (offset: number) => void;
  prefixCls: string;
}

const PrevNext = defineComponent<PrevNextProps>(
  (props) => {
    return () => {
      const { prefixCls, onActive, current, count, icons } = props;
      const switchCls = `${prefixCls}-switch`;

      const prevIcon = (icons.prev ?? icons.left) as VueNode;
      const nextIcon = (icons.next ?? icons.right) as VueNode;

      const prevDisabled = current === 0;
      const nextDisabled = current === count - 1;

      return (
        <>
          <button
            class={clsx(switchCls, `${switchCls}-prev`, {
              [`${switchCls}-disabled`]: prevDisabled,
            })}
            onClick={() => {
              if (!prevDisabled) {
                onActive(-1);
              }
            }}
            type="button"
          >
            {prevIcon}
          </button>
          <button
            class={clsx(switchCls, `${switchCls}-next`, {
              [`${switchCls}-disabled`]: nextDisabled,
            })}
            onClick={() => {
              if (!nextDisabled) {
                onActive(1);
              }
            }}
            type="button"
          >
            {nextIcon}
          </button>
        </>
      );
    };
  },
  { name: 'ImagePreviewPrevNext' },
);

export default PrevNext;
