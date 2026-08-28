import type { CSSProperties, SlotsType } from 'vue';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';
import type { GroupContextProps } from './context';
import type {
  FloatButtonGroupTrigger,
  FloatButtonProps,
  FloatButtonShape,
} from './FloatButton';

import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  Transition,
  watch,
} from 'vue';

import { filterEmpty, getTransitionProps } from '@arvin-studio/headless';
import { CloseOutlined, FileTextOutlined } from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import {
  pureAttrs,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { useZIndex } from '../_util/hooks/useZIndex';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import Flex from '../flex';
import { SpaceCompact } from '../space';
import { GroupContextProvider } from './context';
import FloatButton, { floatButtonPrefixCls } from './FloatButton';
import useStyle from './style';

const VALID_PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const;

export type FloatButtonGroupSemanticName =
  keyof FloatButtonGroupSemanticClassNames &
    keyof FloatButtonGroupSemanticStyles;

export interface FloatButtonGroupSemanticClassNames {
  item?: string;
  itemContent?: string;
  itemIcon?: string;
  list?: string;
  root?: string;
  trigger?: string;
  triggerContent?: string;
  triggerIcon?: string;
}

export interface FloatButtonGroupSemanticStyles {
  item?: CSSProperties;
  itemContent?: CSSProperties;
  itemIcon?: CSSProperties;
  list?: CSSProperties;
  root?: CSSProperties;
  trigger?: CSSProperties;
  triggerContent?: CSSProperties;
  triggerIcon?: CSSProperties;
}

export type FloatButtonGroupClassNamesType = SemanticClassNamesType<
  FloatButtonGroupProps,
  FloatButtonGroupSemanticClassNames
>;

export type FloatButtonGroupStylesType = SemanticStylesType<
  FloatButtonGroupProps,
  FloatButtonGroupSemanticStyles
>;

export interface FloatButtonGroupProps
  extends
    ComponentBaseProps /* @vue-ignore */,
    FloatButtonGroupEmitsProps,
    Omit<FloatButtonProps, 'classes' | 'styles'> {
  // Styles
  classes?: FloatButtonGroupClassNamesType;
  // UI
  closeIcon?: VueNode;
  defaultOpen?: boolean;
  open?: boolean;
  placement?: 'bottom' | 'left' | 'right' | 'top';

  style?: CSSProperties;
  styles?: FloatButtonGroupStylesType;
  // Control
  trigger?: FloatButtonGroupTrigger;
}

export interface FloatButtonGroupSlots {
  closeIcon?: () => any;
  default?: () => any;
  icon?: () => any;
}

export interface FloatButtonGroupEmits {
  click: (e: MouseEvent) => void;
  openChange: (open: boolean) => void;
  'update:open': (open: boolean) => void;
}
export interface FloatButtonGroupEmitsProps {
  onClick?: FloatButtonGroupEmits['click'];
  onOpenChange?: FloatButtonGroupEmits['openChange'];
  'onUpdate:open'?: FloatButtonGroupEmits['update:open'];
}

const groupOmittedProps: (keyof FloatButtonGroupProps)[] = [
  'classes',
  'styles',
  'trigger',
  'open',
  'defaultOpen',
  'closeIcon',
  'placement',
  'style',
  'rootClass',
];

const defaults = {
  shape: 'circle',
  type: 'default',
  icon: () => <FileTextOutlined />,
} as any;

const InternalFloatButtonGroup = defineComponent<
  FloatButtonGroupProps,
  FloatButtonGroupEmits,
  string,
  SlotsType<FloatButtonGroupSlots>
>(
  (props = defaults, { slots, attrs, emit }) => {
    const componentConfig = useComponentBaseConfig(
      'floatButtonGroup',
      props,
      ['closeIcon'],
      floatButtonPrefixCls,
    );
    const {
      class: contextClassName,
      style: contextStyle,
      classes: contextClasses,
      styles: contextStyles,
      direction,
      closeIcon: contextCloseIcon,
      prefixCls,
    } = componentConfig;

    const groupPrefixCls = computed(() => `${prefixCls.value}-group`);
    const listCls = computed(() => `${groupPrefixCls.value}-list`);
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const { classes, styles, trigger, placement, shape, type, style } =
      toPropsRefs(
        props,
        'classes',
        'styles',
        'trigger',
        'placement',
        'shape',
        'type',
        'style',
      );

    const mergedPlacement = computed(() => {
      return VALID_PLACEMENTS.includes(placement.value as any)
        ? placement.value
        : 'top';
    });

    const mergedShape = computed<FloatButtonShape>(
      () => shape.value ?? 'circle',
    );
    const individual = computed(() => mergedShape.value === 'circle');
    const mergedType = computed(() => type.value ?? 'default');

    // ============================ zIndex ============================
    const [zIndex] = useZIndex(
      'FloatButton',
      computed(() => style.value?.zIndex as number | undefined),
    );
    const zIndexStyle = computed(() =>
      zIndex.value === undefined ? undefined : { zIndex: zIndex.value },
    );

    const open = shallowRef(props.open ?? props.defaultOpen ?? false);
    watch(
      () => props.open,
      (val) => {
        open.value = !!val;
      },
    );

    const triggerMode = computed(
      () => trigger.value && ['click', 'hover'].includes(trigger.value),
    );
    const hoverTrigger = computed(() => trigger.value === 'hover');
    const clickTrigger = computed(() => trigger.value === 'click');

    // ============================ Disabled ============================
    const disabledContext = useDisabledContext();
    const mergedDisabled = computed(
      () => props.disabled ?? disabledContext.value,
    );

    const triggerOpen = (nextOpen: boolean) => {
      if (mergedDisabled.value) {
        return;
      }
      emit('update:open', nextOpen);
      if (props.open !== undefined) {
        return;
      }
      if (open.value === nextOpen) {
        return;
      }
      open.value = nextOpen;
      emit('openChange', nextOpen);
    };

    const groupRef = shallowRef<HTMLElement>();

    const handleDocClick = (event: MouseEvent) => {
      if (!clickTrigger.value) {
        return;
      }
      if (groupRef.value?.contains(event.target as Node)) {
        return;
      }
      triggerOpen(false);
    };

    const canUseDocument = typeof document !== 'undefined';

    const setupDocListener = () => {
      if (clickTrigger.value && canUseDocument) {
        document.addEventListener('click', handleDocClick, { capture: true });
      }
    };

    const removeDocListener = () => {
      if (canUseDocument) {
        document.removeEventListener('click', handleDocClick, {
          capture: true,
        });
      }
    };

    watch(clickTrigger, async (_n, _o, onCleanup) => {
      await nextTick();
      setupDocListener();
      onCleanup(() => {
        removeDocListener();
      });
    });

    onMounted(() => {
      setupDocListener();
    });

    onBeforeUnmount(() => {
      removeDocListener();
    });

    const onMouseEnter = () => {
      if (hoverTrigger.value) {
        triggerOpen(true);
      }
    };

    const onMouseLeave = () => {
      if (hoverTrigger.value) {
        triggerOpen(false);
      }
    };

    const mergedProps = computed(() => ({
      ...props,
      type: mergedType.value,
      shape: mergedShape.value,
      placement: mergedPlacement.value,
    }));

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      FloatButtonGroupClassNamesType,
      FloatButtonGroupStylesType,
      FloatButtonGroupProps
    >(
      useToArr(contextClasses, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    const listContext = computed<GroupContextProps>(() => ({
      shape: mergedShape.value,
      individual: individual.value,
      classNames: {
        root: mergedClassNames.value.item,
        icon: mergedClassNames.value.itemIcon,
        content: mergedClassNames.value.itemContent,
      },
      styles: {
        root: mergedStyles.value.item,
        icon: mergedStyles.value.itemIcon,
        content: mergedStyles.value.itemContent,
      },
    }));

    const triggerContext = computed<GroupContextProps>(() => ({
      shape: mergedShape.value,
      individual: true,
      classNames: {
        root: mergedClassNames.value.trigger,
        icon: mergedClassNames.value.triggerIcon,
        content: mergedClassNames.value.triggerContent,
      },
      styles: {
        root: mergedStyles.value.trigger,
        icon: mergedStyles.value.triggerIcon,
        content: mergedStyles.value.triggerContent,
      },
    }));

    const restButtonProps = computed(() => {
      return omit(props, groupOmittedProps) as FloatButtonProps;
    });

    return () => {
      const closeIcon = getSlotPropsFnRun(slots, props, 'closeIcon');
      const icon = getSlotPropsFnRun(slots, props, 'icon');
      const _contextCloseIcon = getSlotPropsFnRun(
        {},
        {
          closeIcon: contextCloseIcon?.value,
        },
        'closeIcon',
      );
      const mergedCloseIcon = closeIcon ?? _contextCloseIcon ?? (
        <CloseOutlined />
      );
      const mergedTriggerIcon = icon ?? <FileTextOutlined />;
      const motionName = `${listCls.value}-motion`;
      const transitionProps = getTransitionProps(motionName);

      const renderList = () => {
        const children = filterEmpty(slots.default?.() ?? []);
        if (children.length === 0) {
          return null;
        }
        const vertical =
          mergedPlacement.value === 'top' || mergedPlacement.value === 'bottom';
        const sharedClass = clsx(
          listCls.value,
          `${listCls.value}-motion`,
          mergedClassNames.value.list,
        );
        const sharedStyle = mergedStyles.value.list;

        return individual.value ? (
          <Flex class={sharedClass} style={sharedStyle} vertical={vertical}>
            {children}
          </Flex>
        ) : (
          <SpaceCompact
            class={sharedClass}
            direction={vertical ? 'vertical' : 'horizontal'}
            style={sharedStyle}
          >
            {children}
          </SpaceCompact>
        );
      };

      const renderTrigger = () => {
        if (!triggerMode.value) {
          return null;
        }
        return (
          <GroupContextProvider value={triggerContext.value}>
            <FloatButton
              {...restButtonProps.value}
              ariaLabel={props.ariaLabel}
              classes={undefined}
              disabled={mergedDisabled.value}
              icon={open.value ? mergedCloseIcon : mergedTriggerIcon}
              onClick={(e: MouseEvent) => {
                if (clickTrigger.value) {
                  triggerOpen(!open.value);
                }
                emit('click', e);
              }}
              rootClass={clsx(
                `${groupPrefixCls.value}-trigger`,
                mergedClassNames.value.trigger,
              )}
              shape={mergedShape.value}
              styles={undefined}
              type={mergedType.value}
            />
          </GroupContextProvider>
        );
      };
      return (
        <GroupContextProvider value={listContext.value}>
          <div
            {...pureAttrs(attrs)}
            class={clsx(
              groupPrefixCls.value,
              hashId.value,
              cssVarCls.value,
              rootCls.value,
              contextClassName.value,
              mergedClassNames.value.root,
              props.rootClass,
              (attrs as any).class,
              {
                [`${groupPrefixCls.value}-rtl`]: direction.value === 'rtl',
                [`${groupPrefixCls.value}-individual`]: individual.value,
                [`${groupPrefixCls.value}-${mergedPlacement.value}`]:
                  !!triggerMode.value,
                [`${groupPrefixCls.value}-menu-mode`]: !!triggerMode.value,
              },
            )}
            onMouseenter={onMouseEnter}
            onMouseleave={onMouseLeave}
            ref={groupRef as any}
            style={[
              contextStyle.value,
              mergedStyles.value.root,
              props.style,
              (attrs as any).style,
              zIndexStyle.value,
            ]}
          >
            {triggerMode.value ? (
              <Transition {...transitionProps}>
                {open.value ? renderList() : null}
              </Transition>
            ) : (
              renderList()
            )}
            {renderTrigger()}
          </div>
        </GroupContextProvider>
      );
    };
  },
  {
    name: 'AsFloatButtonGroup',
    inheritAttrs: false,
  },
);

const FloatButtonGroup =
  InternalFloatButtonGroup as typeof InternalFloatButtonGroup;

export default FloatButtonGroup;
