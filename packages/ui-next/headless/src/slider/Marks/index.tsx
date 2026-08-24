import type { CSSProperties } from 'vue';

import { defineComponent } from 'vue';

import Mark from './Mark';

export interface MarkObj {
  label?: any;
  style?: CSSProperties;
}

export interface InternalMarkObj extends MarkObj {
  value: number;
}

export interface MarksProps {
  marks?: InternalMarkObj[];
  onClick?: (value: number) => void;
  prefixCls: string;
}

const Marks = defineComponent<MarksProps>((props, { emit, slots }) => {
  return () => {
    const { prefixCls, marks = [] } = props;

    const markPrefixCls = `${prefixCls}-mark`;

    // Not render mark if empty
    if (marks.length === 0) {
      return null;
    }

    return (
      <div class={markPrefixCls}>
        {marks.map(({ value, style, label }) => (
          <Mark
            key={value}
            onClick={() => emit('click', value)}
            prefixCls={markPrefixCls}
            style={style}
            value={value}
          >
            {slots.mark?.({ point: value, label }) || label}
          </Mark>
        ))}
      </div>
    );
  };
});

export default Marks;
