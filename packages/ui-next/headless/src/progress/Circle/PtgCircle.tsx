import type { ProgressProps } from '..';
import type { StrokeColorObject } from '../interface.ts';

import { computed, defineComponent, shallowRef } from 'vue';

interface BlockProps {
  bg: string;
}
const Block = defineComponent<BlockProps>((props, { slots }) => {
  return () => {
    return (
      <div style={{ width: '100%', height: '100%', background: props.bg }}>
        {slots.default?.()}
      </div>
    );
  };
});

function getPtgColors(color: Record<string, boolean | string>, scale: number) {
  // eslint-disable-next-line unicorn/prefer-object-iterable-methods
  return Object.keys(color).map((key) => {
    const parsedKey = parseFloat(key);
    const ptgKey = `${Math.floor(parsedKey * scale)}%`;

    return `${color[key]} ${ptgKey}`;
  });
}

export interface ColorGradientProps {
  className?: string;
  color?: string | StrokeColorObject;
  gapDegree: number;
  gradientId: string;
  prefixCls: string;
  // style: ColorGradientPropsSSProperties;
  ptg: number;
  radius: number;
  size: number;
  strokeLinecap: ProgressProps['strokeLinecap'];
  strokeWidth: ProgressProps['strokeWidth'];
}

const PtgCircle = defineComponent<ColorGradientProps>(
  (props, { expose, attrs }) => {
    const isGradient = computed(
      () => props.color && typeof props.color === 'object',
    );
    const stroke = computed(() => (isGradient.value ? `#FFF` : undefined));

    const circleRef = shallowRef<SVGCircleElement>();
    expose({
      circleRef,
    });
    return () => {
      const {
        prefixCls,
        color,
        gradientId,
        radius,
        ptg,
        strokeLinecap,
        strokeWidth,
        size,
        gapDegree,
        className,
      } = props;
      // ========================== Circle ==========================
      const halfSize = size / 2;

      const circleNode = (
        <circle
          class={[`${prefixCls}-circle-path`, className]}
          cx={halfSize}
          cy={halfSize}
          opacity={ptg === 0 ? 0 : 1}
          r={radius}
          stroke={stroke.value}
          stroke-linecap={strokeLinecap!}
          stroke-width={strokeWidth}
          style={attrs?.style as any}
        />
      );

      // ========================== Render ==========================
      if (!isGradient.value) {
        return circleNode;
      }

      const maskId = `${gradientId}-conic`;

      const fromDeg = gapDegree ? `${180 + gapDegree / 2}deg` : '0deg';

      const conicColors = getPtgColors(color as any, (360 - gapDegree) / 360);
      const linearColors = getPtgColors(color as any, 1);

      const conicColorBg = `conic-gradient(from ${fromDeg}, ${conicColors.join(', ')})`;
      const linearColorBg = `linear-gradient(to ${gapDegree ? 'bottom' : 'top'}, ${linearColors.join(
        ', ',
      )})`;
      return (
        <>
          <mask id={maskId}>{circleNode}</mask>
          <foreignObject
            height={size}
            mask={`url(#${maskId})`}
            width={size}
            x={0}
            y={0}
          >
            <Block bg={linearColorBg}>
              <Block bg={conicColorBg} />
            </Block>
          </foreignObject>
        </>
      );
    };
  },
  {
    name: 'PtgCircle',
    inheritAttrs: false,
  },
);

export default PtgCircle;
