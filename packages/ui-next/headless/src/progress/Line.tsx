import type { CSSProperties } from 'vue';

import type { ProgressProps } from './interface.ts';

import { defineComponent } from 'vue';

import { getAttrStyleAndClass, getDOM } from '../util';
import { defaultProps, useTransitionDuration } from './common';
import useId from './hooks/useId';
import getIndeterminateLine from './utils/getIndeterminateLine';

const Line = defineComponent<ProgressProps>(
  (props = defaultProps, { attrs }) => {
    const paths = useTransitionDuration();
    const mergedId = useId(props?.id);

    return () => {
      const {
        className,
        percent,
        prefixCls,
        strokeColor,
        strokeLinecap,
        strokeWidth,
        railColor,
        railWidth,
        transition,
        loading,
        ...restProps
      } = props;

      delete restProps.gapPosition;
      const { restAttrs, style } = getAttrStyleAndClass(attrs);
      const percentList = Array.isArray(percent) ? percent : [percent];
      const strokeColorList = Array.isArray(strokeColor)
        ? strokeColor
        : [strokeColor];

      const center = strokeWidth! / 2;
      const right = 100 - strokeWidth! / 2;
      const pathString = `M ${strokeLinecap === 'round' ? center : 0},${center}
         L ${strokeLinecap === 'round' ? right : 100},${center}`;
      const viewBoxString = `0 0 100 ${strokeWidth}`;

      const { indeterminateStyleProps, indeterminateStyleAnimation } =
        getIndeterminateLine({
          id: mergedId,
          loading: loading!,
          percent: percentList[0]!,
          strokeLinecap: strokeLinecap!,
          strokeWidth: strokeWidth!,
        });
      let stackPtg = 0;
      return (
        <svg
          {...restAttrs}
          class={{
            [`${prefixCls}-line`]: true,
            className,
          }}
          preserveAspectRatio="none"
          style={style}
          viewBox={viewBoxString}
          {...restProps}
        >
          <path
            class={[`${prefixCls}-line-rail`]}
            d={pathString}
            fill-opacity="0"
            stroke={railColor}
            stroke-linecap={strokeLinecap}
            stroke-width={railWidth || strokeWidth}
          />
          {percentList.map((ptg, index) => {
            // eslint-disable-next-line no-useless-assignment
            let dashPercent = 1;
            switch (strokeLinecap) {
              case 'round': {
                dashPercent = 1 - strokeWidth! / 100;
                break;
              }
              case 'square': {
                dashPercent = 1 - strokeWidth! / 2 / 100;
                break;
              }
              default: {
                dashPercent = 1;
                break;
              }
            }
            const pathStyle: CSSProperties = {
              strokeDasharray: `${ptg! * dashPercent}px, 100px`,
              strokeDashoffset: `-${stackPtg}px`,
              transition:
                transition ||
                'stroke-dashoffset 0.3s ease 0s, stroke-dasharray .3s ease 0s, stroke 0.3s linear',
              ...indeterminateStyleProps,
            };
            const color =
              strokeColorList[index] ||
              strokeColorList[strokeColorList.length - 1];
            stackPtg += ptg!;
            return (
              <path
                class={`${prefixCls}-line-path`}
                d={pathString}
                fill-opacity="0"
                key={index}
                ref={(elem) => {
                  // https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
                  // React will call the ref callback with the DOM element when the component mounts,
                  // and call it with `null` when it unmounts.
                  // Refs are guaranteed to be up-to-date before componentDidMount or componentDidUpdate fires.
                  paths.value[index] = getDOM(elem) as SVGPathElement;
                }}
                stroke={color as string}
                stroke-linecap={strokeLinecap}
                stroke-width={strokeWidth}
                style={pathStyle}
              />
            );
          })}
          {indeterminateStyleAnimation}
        </svg>
      );
    };
  },
  {
    name: 'Line',
    inheritAttrs: false,
  },
);

export default Line;
