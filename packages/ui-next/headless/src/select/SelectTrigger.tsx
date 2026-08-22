import type { CSSProperties } from 'vue';

import type { AlignType, BuildInPlacements } from '../trigger/interface';
import type { Placement, RenderDOMFunc } from './interface';

import { computed, defineComponent, shallowRef } from 'vue';

import { clsx } from '@arvin-studio/kit';

import Trigger from '../trigger';

function getBuiltInPlacements(
  popupMatchSelectWidth: boolean | number,
): Record<string, AlignType> {
  // Enable horizontal overflow auto-adjustment when a custom dropdown width is provided
  const adjustX = popupMatchSelectWidth === true ? 0 : 1;
  return {
    bottomLeft: {
      points: ['tl', 'bl'],
      offset: [0, 4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
    bottomRight: {
      points: ['tr', 'br'],
      offset: [0, 4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
    topLeft: {
      points: ['bl', 'tl'],
      offset: [0, -4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
    topRight: {
      points: ['br', 'tr'],
      offset: [0, -4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
  };
}

export interface SelectTriggerProps {
  animation?: string;
  builtinPlacements?: BuildInPlacements;
  direction?: string;
  disabled: boolean;

  empty: boolean;
  getPopupContainer?: RenderDOMFunc;
  onPopupBlur?: (event: FocusEvent) => void;
  onPopupMouseDown: (event: MouseEvent) => void;
  onPopupMouseEnter: () => void;
  onPopupVisibleChange?: ((visible: boolean) => void) | null;
  placement?: Placement;
  popupAlign?: AlignType;
  popupClassName?: string;
  popupElement: any;
  popupMatchSelectWidth?: boolean | number;
  popupRender?: (menu: any) => any;

  popupStyle?: CSSProperties;

  prefixCls: string;
  transitionName?: string;
  visible: boolean;
}

const defaults = {
  direction: 'ltr',
} as any;

const SelectTrigger = defineComponent<SelectTriggerProps>(
  (props = defaults, { slots, attrs, expose }) => {
    const mergedBuiltinPlacements = computed(() => {
      return (
        props?.builtinPlacements ||
        getBuiltInPlacements(props.popupMatchSelectWidth!)
      );
    });

    // =================== Popup Width ===================
    const isNumberPopupWidth = computed(
      () => typeof props.popupMatchSelectWidth === 'number',
    );

    const stretch = computed(() => {
      // A numeric `popupMatchSelectWidth` should stretch the popup to at least the
      // trigger width (`minWidth`) rather than leave it unstretched (`null`).
      // sync ant-design#58511 / rc-select
      return props.popupMatchSelectWidth === false || isNumberPopupWidth.value
        ? 'minWidth'
        : 'width';
    });

    // ======================= Ref =======================
    const triggerPopupRef = shallowRef();
    expose({
      getPopupElement: () => triggerPopupRef.value?.popupElement,
    });
    return () => {
      const {
        prefixCls,
        popupElement,
        popupRender,
        animation,
        transitionName,
        popupStyle,
        popupMatchSelectWidth,
        onPopupVisibleChange,
        placement,
        direction = 'ltr',
        // oxlint-disable-next-line no-unused-vars
        builtinPlacements,
        onPopupMouseEnter,
        onPopupMouseDown,
        onPopupBlur,
        popupAlign,
        visible,
        getPopupContainer,
        popupClassName,
        empty,
        ...restProps
      } = props;
      const popupNode: any = popupRender
        ? popupRender(popupElement)
        : popupElement;
      const popupPrefixCls = `${prefixCls}-dropdown`;

      // ===================== Motion ======================
      const mergedTransitionName = animation
        ? `${popupPrefixCls}-${animation}`
        : transitionName;

      const mergedPopupStyle = popupStyle ?? {};
      if (isNumberPopupWidth.value) {
        mergedPopupStyle.width = `${popupMatchSelectWidth}px`;
      }

      return (
        <Trigger
          {...attrs}
          {...restProps}
          builtinPlacements={mergedBuiltinPlacements.value}
          getPopupContainer={getPopupContainer}
          hideAction={onPopupVisibleChange ? ['click'] : []}
          onPopupVisibleChange={onPopupVisibleChange ?? undefined}
          popup={
            <div
              onBlur={onPopupBlur}
              onMousedown={onPopupMouseDown}
              onMouseenter={onPopupMouseEnter}
            >
              {popupNode}
            </div>
          }
          popupAlign={popupAlign}
          popupClassName={clsx(popupClassName, {
            [`${popupPrefixCls}-empty`]: empty,
          })}
          popupMotion={{
            name: mergedTransitionName,
          }}
          popupPlacement={
            placement || (direction === 'rtl' ? 'bottomRight' : 'bottomLeft')
          }
          popupStyle={mergedPopupStyle}
          popupVisible={visible}
          prefixCls={popupPrefixCls}
          ref={triggerPopupRef as any}
          showAction={onPopupVisibleChange ? ['click'] : []}
          stretch={stretch.value!}
        >
          {slots?.default?.()}
        </Trigger>
      );
    };
  },
  {
    name: 'SelectTrigger',
    inheritAttrs: false,
  },
);

export default SelectTrigger;
