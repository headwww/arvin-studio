import type { App, CSSProperties, SlotsType } from 'vue';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type {
  TooltipEmits,
  TooltipProps,
  TooltipRef,
  TooltipSemanticClassNames,
  TooltipSemanticStyles,
} from '../tooltip';

import { computed, createVNode, defineComponent, shallowRef, watch } from 'vue';

import {
  filterEmpty,
  getTransitionName,
  removeUndefined,
} from '@arvin-studio/headless';
import KeyCode from '@arvin-studio/headless/src/util/KeyCode';
import { clsx } from '@arvin-studio/kit';

import { useMergeSemantic, useToArr, useToProps } from '../_util/hooks';
import { isRenderable } from '../_util/is';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import Tooltip from '../tooltip';
import useMergedArrow from '../tooltip/hooks/useMergedArrow';
import PurePanel, { Overlay } from './PurePanel';
// CSSINJS
import useStyle from './style';

export type PopoverSemanticName = keyof PopoverSemanticClassNames &
  keyof PopoverSemanticStyles;

export type PopoverSemanticClassNames = TooltipSemanticClassNames & {
  content?: string;
  title?: string;
};

export type PopoverSemanticStyles = TooltipSemanticStyles & {
  content?: CSSProperties;
  title?: CSSProperties;
};

export type PopoverClassNamesType = SemanticClassNamesType<
  PopoverProps,
  PopoverSemanticClassNames
>;

export type PopoverStylesType = SemanticStylesType<
  PopoverProps,
  PopoverSemanticStyles
>;

export interface PopoverProps
  extends
    Omit<TooltipProps, 'onOpenChange'>,
    /* @vue-ignore */
    PopoverEmitsProps {
  classes?: PopoverClassNamesType;
  content?: VueNode;
  styles?: PopoverStylesType;
  title?: VueNode;
}

export interface PopoverRef extends TooltipRef {}
export interface PopoverEmits extends TooltipEmits {
  openChange: (open: boolean, e?: KeyboardEvent | MouseEvent) => void;
}
export interface PopoverEmitsProps {
  onOpenChange?: PopoverEmits['openChange'];
}

export interface PopoverSlots {
  content: () => any;
  default: () => any;
  title: () => any;
}

const defaults = {
  placement: 'top',
  mouseEnterDelay: 0.1,
  mouseLeaveDelay: 0.1,
} as any;
const InternalPopover = defineComponent<
  PopoverProps,
  PopoverEmits,
  string,
  SlotsType<PopoverSlots>
>(
  (props = defaults, { slots, attrs, expose, emit }) => {
    const {
      getPrefixCls,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      arrow: contextArrow,
      trigger: contextTrigger,
      prefixCls,
    } = useComponentBaseConfig('popover', props, ['arrow', 'trigger']);
    const {
      arrow: popoverArrow,
      classes,
      styles,
    } = toPropsRefs(props, 'arrow', 'classes', 'styles');
    const rootCls = computed(() => getPrefixCls());
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const mergedArrow = useMergedArrow(popoverArrow, contextArrow);
    const mergedTrigger = computed(
      () => props?.trigger ?? contextTrigger.value ?? 'hover',
    );
    const popoverRef = shallowRef();

    const forceAlign = () => {
      popoverRef.value?.forceAlign?.();
    };
    expose({
      forceAlign,
      nativeElement: computed(() => popoverRef.value?.nativeElement),
      popupElement: computed(() => popoverRef.value?.popupElement),
    });

    // ============================= Styles =============================
    const mergedProps = computed(() => ({
      ...props,
      trigger: mergedTrigger.value,
    }));
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      PopoverClassNamesType,
      PopoverStylesType,
      PopoverProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );
    const open = shallowRef(props?.open ?? props?.defaultOpen ?? false);
    watch(
      () => props.open,
      (val, prevVal) => {
        if (val !== undefined) {
          open.value = val;
        } else if (prevVal !== undefined) {
          open.value = false;
        }
      },
      { immediate: true },
    );

    const settingOpen = (value: boolean, e?: KeyboardEvent | MouseEvent) => {
      if (props.open === undefined) {
        open.value = value;
      }
      emit('openChange', value, e);
      emit('update:open', value);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // eslint-disable-next-line unicorn/prefer-keyboard-event-key
      if (e.keyCode === KeyCode.ESC) {
        settingOpen(false, e);
      }
    };

    const onInternalOpenChange = (value: boolean) => {
      settingOpen(value);
    };

    return () => {
      const children = filterEmpty(slots?.default?.() ?? [])?.[0];
      const {
        placement,
        mouseLeaveDelay,
        mouseEnterDelay,
        motion,
        ...restProps
      } = props;
      const titleNode = getSlotPropsFnRun(slots, props, 'title');
      const contentNode = getSlotPropsFnRun(slots, props, 'content');
      const rootClassNames = clsx(
        hashId.value,
        cssVarCls.value,
        contextClassName.value,
        mergedClassNames.value.root,
      );
      return (
        <Tooltip
          {...attrs}
          arrow={mergedArrow.value}
          mouseEnterDelay={mouseEnterDelay}
          mouseLeaveDelay={mouseLeaveDelay}
          placement={placement}
          trigger={mergedTrigger.value}
          unique={false}
          {...removeUndefined(restProps)}
          classes={{
            root: rootClassNames,
            container: mergedClassNames.value?.container,
            arrow: mergedClassNames.value?.arrow,
          }}
          dataPopoverInject={true}
          motion={{
            name: getTransitionName(
              rootCls.value,
              'zoom-big',
              typeof motion?.name === 'string' ? motion?.name : undefined,
            ),
          }}
          onOpenChange={onInternalOpenChange}
          open={open.value}
          overlay={
            isRenderable(titleNode) || isRenderable(contentNode) ? (
              <Overlay
                classes={mergedClassNames.value}
                content={contentNode}
                prefixCls={prefixCls.value}
                styles={mergedStyles.value}
                title={titleNode}
              />
            ) : null
          }
          prefixCls={prefixCls.value}
          ref={popoverRef}
          styles={{
            root: { ...mergedStyles.value?.root, ...contextStyle.value },
            container: mergedStyles.value?.container,
            arrow: mergedStyles.value?.arrow,
          }}
        >
          {children ? createVNode(children, { onKeydown: onKeyDown }) : null}
        </Tooltip>
      );
    };
  },
  {
    name: 'AsPopover',
    inheritAttrs: false,
  },
);

const Popover = InternalPopover as typeof InternalPopover & {
  _InternalPanelDoNotUseOrYouWillBeFired: any;
  install: (app: App) => void;
};

Popover.install = (app: App) => {
  app.component(Popover.name, Popover);
};

Popover._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

export default Popover;
