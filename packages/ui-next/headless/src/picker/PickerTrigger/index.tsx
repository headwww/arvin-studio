import type { CSSProperties } from 'vue';

import type { AlignType, BuildInPlacements } from '../../trigger';

import { computed, defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { Trigger } from '../../trigger';
import { usePickerContext } from '../PickerInput/context';
import { getRealPlacement } from '../utils/uiUtil';

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
};

export interface PickerTriggerProps {
  builtinPlacements?: BuildInPlacements;
  direction?: 'ltr' | 'rtl';
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  onClose?: () => void;
  placement?: string;
  popupAlign?: AlignType;
  popupClassName?: string;
  popupElement?: any;
  popupStyle?: CSSProperties;
  range?: boolean;
  transitionName?: string;
  visible?: boolean;
}

const PickerTrigger = defineComponent<PickerTriggerProps>(
  (props, { slots }) => {
    const ctx = usePickerContext();
    const dropdownPrefixCls = computed(() => `${ctx.value.prefixCls}-dropdown`);

    const realPlacement = computed(() =>
      getRealPlacement(props.placement, props.direction === 'rtl'),
    );

    return () => {
      return (
        <Trigger
          builtinPlacements={props.builtinPlacements || BUILT_IN_PLACEMENTS}
          getPopupContainer={props.getPopupContainer}
          hideAction={['click']}
          onPopupVisibleChange={(nextVisible: boolean) => {
            if (!nextVisible) {
              props.onClose?.();
            }
          }}
          popup={props.popupElement}
          popupAlign={props.popupAlign}
          popupClassName={clsx(props.popupClassName, {
            [`${dropdownPrefixCls.value}-range`]: props.range,
            [`${dropdownPrefixCls.value}-rtl`]: props.direction === 'rtl',
          })}
          popupMotion={
            props.transitionName
              ? ({ motionName: props.transitionName } as any)
              : undefined
          }
          popupPlacement={realPlacement.value}
          popupStyle={props.popupStyle}
          popupVisible={props.visible}
          prefixCls={dropdownPrefixCls.value}
          showAction={[]}
          stretch="minWidth"
        >
          {slots.default?.()}
        </Trigger>
      );
    };
  },
  {
    name: 'PickerTrigger',
    inheritAttrs: false,
  },
);

export default PickerTrigger;
