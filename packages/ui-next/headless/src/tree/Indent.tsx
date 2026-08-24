import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

export interface IndentProps {
  isEnd?: boolean[];
  isStart?: boolean[];
  level: number;
  prefixCls: string;
}

const Indent = defineComponent<IndentProps>(
  (props) => {
    return () => {
      const { prefixCls, level, isStart, isEnd } = props;
      const baseClassName = `${prefixCls}-indent-unit`;
      const list = [];

      for (let i = 0; i < level; i += 1) {
        list.push(
          <span
            class={clsx(baseClassName, {
              [`${baseClassName}-start`]: isStart?.[i],
              [`${baseClassName}-end`]: isEnd?.[i],
            })}
            key={i}
          />,
        );
      }

      return (
        <span aria-hidden="true" class={`${props.prefixCls}-indent`}>
          {list}
        </span>
      );
    };
  },
  {
    name: 'Indent',
    inheritAttrs: false,
  },
);

export default Indent;
