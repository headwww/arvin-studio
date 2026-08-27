import type { CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit } from '../_util';

import { cloneVNode, computed, defineComponent } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { useConfig } from '../config-provider/context';
import SingleNumber from './SingleNumber';

export interface ScrollNumberProps {
  component?: object | string;
  count?: null | number | string;
  prefixCls?: string;
  show: boolean;
  title?: null | number | string;
}

export interface ScrollNumberSlots {
  default?: () => any;
}

export default defineComponent<
  ScrollNumberProps,
  EmptyEmit,
  string,
  SlotsType<ScrollNumberSlots>
>(
  (props, { slots, attrs }) => {
    const configContext = useConfig();
    const prefixCls = computed(() =>
      configContext.value.getPrefixCls('scroll-number', props.prefixCls),
    );

    return () => {
      const { component = 'sup', count, show, title } = props;
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs as any;
      const children = filterEmpty(slots.default?.() ?? []);

      const styleWithBorder = attrStyle?.borderColor
        ? {
            ...attrStyle,
            boxShadow: `0 0 0 1px ${attrStyle.borderColor} inset`,
          }
        : attrStyle;
      const mergedStyleList = [styleWithBorder, attrStyle].filter(
        Boolean,
      ) as CSSProperties[];

      if (children.length > 0) {
        const child = children[0];
        return cloneVNode(child, {
          class: clsx(
            `${prefixCls.value}-custom-component`,
            child.props?.class,
          ),
        });
      }

      let numberNodes: any = count;
      const numericValue = Number(count);
      if (
        count !== null &&
        count !== undefined &&
        !Number.isNaN(numericValue) &&
        // eslint-disable-next-line unicorn/prefer-number-is-safe-integer
        numericValue % 1 === 0
      ) {
        const numberList = String(count).split('');
        numberNodes = (
          <bdi>
            {numberList.map((num, index) => (
              <SingleNumber
                count={numericValue}
                key={numberList.length - index}
                prefixCls={prefixCls.value}
                value={num}
              />
            ))}
          </bdi>
        );
      }

      const ComponentTag = component as any;

      return (
        <ComponentTag
          {...restAttrs}
          class={clsx(prefixCls.value, attrClass)}
          data-show={show}
          style={mergedStyleList.length > 0 ? mergedStyleList : undefined}
          title={title as any}
        >
          {numberNodes}
        </ComponentTag>
      );
    };
  },
  {
    name: 'AScrollNumber',
    inheritAttrs: false,
  },
);
