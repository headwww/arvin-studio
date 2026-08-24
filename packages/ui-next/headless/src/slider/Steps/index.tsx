import type { CSSProperties } from 'vue';

import type { InternalMarkObj } from '../Marks';

import { computed, defineComponent } from 'vue';

import { useInjectSlider } from '../context';
import Dot from './Dot';

export interface StepsProps {
  activeStyle?: ((dotValue: number) => CSSProperties) | CSSProperties;
  dots?: boolean;
  marks: InternalMarkObj[];
  prefixCls: string;
  style?: ((dotValue: number) => CSSProperties) | CSSProperties;
}

const Steps = defineComponent<StepsProps>((props, { attrs }) => {
  const sliderContext = useInjectSlider();

  const stepDots = computed<number[]>(() => {
    const { max, min, step } = sliderContext.value;
    const { marks, dots } = props;

    const dotSet = new Set<number>();

    // Add marks
    marks.forEach((mark) => {
      dotSet.add(mark.value);
    });

    // Fill dots
    if (dots && step !== null) {
      let current = min;
      while (current <= max) {
        dotSet.add(current);
        current += step!;
      }
    }

    return Array.from(dotSet);
  });

  return () => {
    const { prefixCls, activeStyle } = props;

    return (
      <div class={`${prefixCls}-step`}>
        {stepDots.value.map((dotValue) => (
          <Dot
            activeStyle={activeStyle}
            key={dotValue}
            prefixCls={prefixCls}
            style={{ ...(attrs.style as CSSProperties) }}
            value={dotValue}
          />
        ))}
      </div>
    );
  };
});
export default Steps;
