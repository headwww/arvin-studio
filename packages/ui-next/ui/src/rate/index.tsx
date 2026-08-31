import type { App } from 'vue';

import type { RateProps as VcRateProps } from '@arvin-studio/headless';

import type { SizeType } from '../config-provider/size-context';
import type { TooltipProps } from '../tooltip';

import { defineComponent, shallowRef } from 'vue';

import { Rate as VcRate } from '@arvin-studio/headless';
import { StarFilled } from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import { useSize } from '../config-provider/hooks/useSize';
import Tooltip from '../tooltip';
import useStyle from './style';

function isTooltipProps(item: string | TooltipProps): item is TooltipProps {
  return typeof item === 'object' && item !== null;
}

const defaults = {
  character: <StarFilled />,
} as any;
export interface RateProps
  extends
    Omit<
      VcRateProps,
      | 'onBlur'
      | 'onChange'
      | 'onFocus'
      | 'onHoverChange'
      | 'onKeyDown'
      | 'onMouseLeave'
      | 'onUpdate:value'
    >,
    /* @vue-ignore */
    RateEmitsProps {
  rootClass?: string;
  size?: SizeType;
  tooltips?: (string | TooltipProps)[];
}

export interface RateEmits {
  blur: () => void;
  change: (value: number) => void;
  focus: () => void;
  hoverChange: (value: number) => void;
  keydown: (e: KeyboardEvent) => void;
  mouseleave: (e: FocusEvent) => void;
  'update:value': (value: number) => void;
}
export interface RateEmitsProps {
  onBlur?: RateEmits['blur'];
  onChange?: RateEmits['change'];
  onFocus?: RateEmits['focus'];
  onHoverChange?: RateEmits['hoverChange'];
  onKeydown?: RateEmits['keydown'];
  onMouseleave?: RateEmits['mouseleave'];
  'onUpdate:value'?: RateEmits['update:value'];
}

const Rate = defineComponent<RateProps, RateEmits, string>(
  (props = defaults, { attrs, emit, expose }) => {
    const rateRef = shallowRef();
    const characterRender: VcRateProps['characterRender'] = (
      node,
      { index },
    ) => {
      const { tooltips } = props;
      if (!tooltips) {
        return node;
      }

      const tooltipsItem = tooltips[index as number]!;

      if (isTooltipProps(tooltipsItem)) {
        return <Tooltip {...tooltipsItem}>{node}</Tooltip>;
      }
      return <Tooltip title={tooltipsItem as string}>{node}</Tooltip>;
    };
    const {
      prefixCls: ratePrefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
    } = useComponentBaseConfig('rate', props);

    // Style
    const [hashId, cssVarCls] = useStyle(ratePrefixCls);

    const disabled = useDisabledContext();
    const mergedSize = useSize((ctx) => props.size ?? ctx);
    expose({
      focus: () => {
        rateRef.value?.focus?.();
      },
      blur: () => {
        rateRef.value?.blur?.();
      },
    });
    return () => {
      const {
        character,
        disabled: customDisabled,
        rootClass,
        ...restProps
      } = props;
      const mergedDisabled = customDisabled ?? disabled.value;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      return (
        <VcRate
          character={character}
          characterRender={characterRender}
          disabled={mergedDisabled}
          ref={rateRef}
          {...restAttrs}
          {...omit(restProps, ['characterRender'])}
          class={clsx(
            {
              [`${ratePrefixCls.value}-large`]: mergedSize.value === 'large',
              [`${ratePrefixCls.value}-small`]: mergedSize.value === 'small',
            },
            className,
            rootClass,
            hashId.value,
            cssVarCls.value,
            contextClassName.value,
          )}
          direction={direction.value}
          onBlur={() => {
            emit('blur');
          }}
          onChange={(...args: any) => {
            emit('change', args);
            emit('update:value', args);
          }}
          onFocus={() => {
            emit('focus');
          }}
          onHoverChange={(...args: any) => {
            emit('hoverChange', args);
          }}
          onKeyDown={(e: any) => {
            emit('keydown', e);
          }}
          onMouseLeave={(e: any) => {
            emit('mouseleave', e);
          }}
          prefixCls={ratePrefixCls.value}
          style={{
            ...contextStyle.value,
            ...style,
          }}
        />
      );
    };
  },
  {
    name: 'AsRate',
    inheritAttrs: false,
  },
);
(Rate as any).install = (app: App) => {
  app.component(Rate.name, Rate);
};

export default Rate;
