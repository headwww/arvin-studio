import type { CSSProperties } from 'vue';

import type { VueNode } from '../../util';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

export interface CloseBtnProps {
  className?: string;
  icon?: VueNode;
  onClick: (e: MouseEvent) => void;
  prefixCls: string;
  style?: CSSProperties;
}

const CloseBtn = defineComponent<CloseBtnProps>(
  (props) => {
    return () => {
      const { prefixCls, icon, onClick, className, style } = props;
      return (
        <button
          class={clsx(`${prefixCls}-close`, className)}
          onClick={onClick}
          style={style}
          type="button"
        >
          {icon}
        </button>
      );
    };
  },
  { name: 'ImagePreviewCloseBtn' },
);

export default CloseBtn;
