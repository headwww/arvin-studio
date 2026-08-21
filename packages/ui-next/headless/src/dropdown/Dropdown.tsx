import type { CSSProperties } from 'vue';

import type {
  ActionType,
  AlignType,
  AnimationType,
  BuildInPlacements,
  TriggerProps,
} from '../trigger';
import type { VueNode } from '../util';

import { computed, createVNode, defineComponent, shallowRef } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { Trigger } from '../trigger';
import { filterEmpty, removeUndefined, toPropsRefs } from '../util';
import useAccessibility from './hooks/useAccessibility';
import Overlay from './Overlay';
import Placements from './placements';

export interface DropdownProps extends Pick<
  TriggerProps,
  | 'autoDestroy'
  | 'builtinPlacements'
  | 'getPopupContainer'
  | 'mouseEnterDelay'
  | 'mouseLeaveDelay'
  | 'onPopupAlign'
> {
  align?: AlignType;
  alignPoint?: boolean;
  animation?: AnimationType;
  arrow?: boolean;
  autoFocus?: boolean;
  hideAction?: ActionType[];
  minOverlayWidthMatchTrigger?: boolean;
  onOverlayClick?: (e: Event) => void;
  onVisibleChange?: (visible: boolean) => void;
  openClassName?: string;
  overlay?: (() => VueNode) | VueNode;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
  placement?: keyof typeof Placements;
  placements?: BuildInPlacements;
  prefixCls?: string;
  showAction?: ActionType[];
  transitionName?: string;
  trigger?: ActionType | ActionType[];
  visible?: boolean;
}

const defaults = {
  prefixCls: 'headless-dropdown',
  arrow: false,
  placement: 'bottomLeft',
  placements: Placements,
  trigger: ['hover'],
} as any;

const Dropdown = defineComponent<DropdownProps>(
  (props = defaults, { expose, slots }) => {
    const { autoFocus } = toPropsRefs(props, 'autoFocus');
    const triggerVisible = shallowRef<boolean>();
    const mergedVisible = computed(() => {
      return props?.visible ?? triggerVisible.value;
    });
    const mergedMotionName = computed(() => {
      const { prefixCls, transitionName, animation } = props;
      return animation ? `${prefixCls}-${animation}` : transitionName;
    });
    const triggerRef = shallowRef();
    const overlayRef = shallowRef();
    const childRef = shallowRef();
    expose({
      triggerRef,
    });
    const handleVisibleChange = (visible: boolean) => {
      triggerVisible.value = visible;
      props.onVisibleChange?.(visible);
    };

    useAccessibility({
      visible: mergedVisible as any,
      triggerRef: childRef,
      onVisibleChange: handleVisibleChange,
      autoFocus: autoFocus as any,
      overlayRef,
    });

    const onClick = (e: any) => {
      const { onOverlayClick } = props;
      triggerVisible.value = false;

      if (onOverlayClick) {
        onOverlayClick(e);
      }
    };
    return () => {
      const {
        overlay,
        prefixCls,
        arrow,
        hideAction,
        trigger,
        placement,
        placements,
        overlayClassName,
        getPopupContainer,
        showAction,
        overlayStyle,
        align,
        // Pulled out so it is not forwarded to Trigger: Trigger's own `disabled`
        // suppresses the popup entirely, which is not what a disabled Dropdown
        // means.
        disabled: _disabled,
        ...otherProps
      } = props as typeof props & { disabled?: boolean };

      const getMenuElement = () => (
        <Overlay
          arrow={arrow}
          overlay={overlay as any}
          prefixCls={prefixCls}
          ref={overlayRef}
        />
      );

      const getMenuElementOrLambda = () => {
        if (typeof overlay === 'function') {
          return getMenuElement;
        }
        return getMenuElement();
      };

      const getMinOverlayWidthMatchTrigger = () => {
        const { minOverlayWidthMatchTrigger, alignPoint } = props;
        if (minOverlayWidthMatchTrigger !== undefined) {
          return minOverlayWidthMatchTrigger;
        }

        return !alignPoint;
      };

      const getOpenClassName = () => {
        const { openClassName } = props;
        if (openClassName !== undefined) {
          return openClassName;
        }
        return `${prefixCls}-open`;
      };

      const childArr = filterEmpty(slots?.default?.() ?? []);
      const children = childArr?.[0];
      const childrenNode = createVNode(children, {
        class: clsx(mergedVisible.value && getOpenClassName()),
        ref: childRef,
      });

      let triggerHideAction = hideAction;
      if (!triggerHideAction && trigger?.includes('contextMenu')) {
        triggerHideAction = ['click'];
      }
      return (
        <Trigger
          builtinPlacements={placements}
          {...removeUndefined(otherProps)}
          action={trigger}
          getPopupContainer={getPopupContainer}
          hideAction={triggerHideAction}
          onOpenChange={handleVisibleChange}
          onPopupClick={onClick}
          popup={getMenuElementOrLambda()}
          popupAlign={align}
          popupClassName={clsx(overlayClassName, {
            [`${prefixCls}-show-arrow`]: arrow,
          })}
          popupMotion={{ name: mergedMotionName.value }}
          popupPlacement={placement}
          popupStyle={overlayStyle}
          popupVisible={mergedVisible.value}
          prefixCls={prefixCls}
          ref={triggerRef}
          showAction={showAction}
          stretch={getMinOverlayWidthMatchTrigger() ? 'minWidth' : ''}
        >
          {childrenNode}
        </Trigger>
      );
    };
  },
);

export default Dropdown;
