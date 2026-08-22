import type { CSSProperties } from 'vue';

import type { VueNode } from '../util';
import type { DataDrivenOptionProps, Direction, Placement } from './Mentions';

import { computed, defineComponent, shallowRef } from 'vue';

import Trigger from '../trigger';
import DropdownMenu from './DropdownMenu';

const BUILT_IN_PLACEMENTS = {
  bottomRight: {
    points: ['tl', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomLeft: {
    points: ['tr', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topRight: {
    points: ['bl', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['br', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
};

interface KeywordTriggerProps {
  direction?: Direction;
  getPopupContainer?: () => HTMLElement;
  loading?: boolean;
  options: DataDrivenOptionProps[];
  placement?: Placement;
  popupClassName?: string;
  popupRender?: (menu: VueNode) => VueNode;
  popupStyle?: CSSProperties;
  prefixCls?: string;
  transitionName?: string;
  visible?: boolean;
}

const KeywordTrigger = defineComponent<KeywordTriggerProps>(
  (props, { slots }) => {
    const opened = shallowRef(false);
    const dropdownPlacement = computed(() => {
      if (props.direction === 'rtl') {
        return props.placement === 'top' ? 'topLeft' : 'bottomLeft';
      }
      return props.placement === 'top' ? 'topRight' : 'bottomRight';
    });
    return () => {
      const {
        prefixCls,
        options,
        visible,
        transitionName,
        getPopupContainer,
        popupClassName,
        popupStyle,
        popupRender,
      } = props;

      const dropdownPrefix = `${prefixCls}-dropdown`;

      const dropdownElement = (
        <DropdownMenu
          opened={opened.value}
          options={options}
          prefixCls={dropdownPrefix}
        />
      );

      const dropdownPopup = popupRender
        ? popupRender(dropdownElement)
        : dropdownElement;

      return (
        <Trigger
          afterOpenChange={(nextOpen) => {
            opened.value = nextOpen;
          }}
          builtinPlacements={BUILT_IN_PLACEMENTS}
          getPopupContainer={getPopupContainer}
          popup={dropdownPopup}
          popupClassName={popupClassName}
          popupMotion={{ name: transitionName }}
          popupPlacement={dropdownPlacement.value}
          popupStyle={popupStyle}
          popupVisible={visible}
          prefixCls={dropdownPrefix}
        >
          {slots?.default?.()}
        </Trigger>
      );
    };
  },
  {
    name: 'KeywordTrigger',
    inheritAttrs: false,
  },
);

export default KeywordTrigger;
