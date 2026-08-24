import type { CSSProperties } from 'vue';

import type { Status } from './Steps';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

export interface RailProps {
  className: string;
  prefixCls: string;
  status: Status;
  style?: CSSProperties;
}

const Rail = defineComponent<RailProps>(
  (props) => {
    return () => {
      const { prefixCls, className, status, style } = props;
      const railCls = `${prefixCls}-rail`;

      // ============================= render =============================
      return (
        <div
          class={clsx(railCls, `${railCls}-${status}`, className)}
          style={style}
        />
      );
    };
  },
  {
    name: 'StepsRail',
    inheritAttrs: false,
  },
);

export default Rail;
