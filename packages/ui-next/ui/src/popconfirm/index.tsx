import type { App, CSSProperties, SlotsType } from 'vue';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ButtonProps, LegacyButtonType } from '../button';
import type {
  PopoverProps,
  PopoverSemanticClassNames,
  PopoverSemanticName,
  PopoverSemanticStyles,
} from '../popover';
import type { TooltipEmits, TooltipRef } from '../tooltip';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { removeUndefined } from '@arvin-studio/headless';
import { ExclamationCircleFilled } from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import { useMergeSemantic, useToArr, useToProps } from '../_util/hooks';
import {
  getSlotPropsFnRun,
  toPropsRefs,
  useLiveListener,
} from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import Popover from '../popover';
import useMergedArrow from '../tooltip/hooks/useMergedArrow';
import PurePanel, { Overlay } from './PurePanel';
import useStyle from './style';

export type PopconfirmSemanticName = 'icon' | PopoverSemanticName;

export type PopconfirmSemanticClassNames = PopoverSemanticClassNames & {
  icon?: string;
};

export type PopconfirmSemanticStyles = PopoverSemanticStyles & {
  icon?: CSSProperties;
};

export type PopconfirmClassNamesType = SemanticClassNamesType<
  PopconfirmProps,
  PopconfirmSemanticClassNames
>;

export type PopconfirmStylesType = SemanticStylesType<
  PopconfirmProps,
  PopconfirmSemanticStyles
>;

export interface PopconfirmProps
  extends
    Omit<
      PopoverProps,
      'classes' | 'content' | 'onOpenChange' | 'styles' | 'title'
    >,
    /* @vue-ignore */
    PopconfirmEmitsProps {
  cancelButtonProps?: ButtonProps;
  cancelText?: VueNode;
  classes?: PopconfirmClassNamesType;
  description?: VueNode;
  disabled?: boolean;
  icon?: VueNode;
  okButtonProps?: ButtonProps;
  okText?: VueNode;
  okType?: LegacyButtonType;
  onConfirm?: (e?: MouseEvent) => void;
  showCancel?: boolean;
  styles?: PopconfirmStylesType;
  title?: VueNode;
}

export interface PopconfirmRef extends TooltipRef {}

export interface PopconfirmEmits extends TooltipEmits {
  cancel: (e?: MouseEvent) => void;
  confirm: (e?: MouseEvent) => void;
  openChange: (open: boolean, e?: KeyboardEvent | MouseEvent) => void;
  popupClick: (e: MouseEvent) => void;
}
export interface PopconfirmEmitsProps {
  onCancel?: PopconfirmEmits['cancel'];
  onConfirm?: PopconfirmEmits['confirm'];
  onOpenChange?: PopconfirmEmits['openChange'];
  onPopupClick?: PopconfirmEmits['popupClick'];
}

export interface PopconfirmSlots {
  cancelText?: () => any;
  default?: () => any;
  description?: () => any;
  icon?: () => any;
  okText?: () => any;
  title?: () => any;
}

const OMITTED_PROP_KEYS: (keyof PopconfirmProps)[] = [
  'title',
  'description',
  'okText',
  'cancelText',
  'okType',
  'okButtonProps',
  'cancelButtonProps',
  'showCancel',
  'icon',
  'disabled',
  'classes',
  'styles',
  'prefixCls',
  'arrow',
];

const defaultIcon = <ExclamationCircleFilled />;

const defaults = {
  placement: 'top',
  okType: 'primary',
} as any;

const InternalPopconfirm = defineComponent<
  PopconfirmProps,
  PopconfirmEmits,
  string,
  SlotsType<PopconfirmSlots>
>(
  (props = defaults, { slots, attrs, expose, emit }) => {
    const {
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      arrow: contextArrow,
      trigger: contextTrigger,
      prefixCls,
    } = useComponentBaseConfig('popconfirm', props, ['arrow', 'trigger']);
    const {
      arrow: arrowProp,
      classes,
      styles,
    } = toPropsRefs(props, 'arrow', 'classes', 'styles');
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const mergedArrow = useMergedArrow(arrowProp, contextArrow);
    const mergedTrigger = computed(
      () => props?.trigger ?? contextTrigger.value ?? 'click',
    );
    const popoverRef = shallowRef<TooltipRef>();

    const open = shallowRef(props.open ?? props.defaultOpen ?? false);
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

    const close = (e?: MouseEvent) => {
      settingOpen(false, e);
    };

    const onCancel = (e?: MouseEvent) => {
      emit('cancel', e);
      settingOpen(false, e);
    };

    const handlePopupClick = (e: MouseEvent) => {
      emit('popupClick', e);
    };

    const onInternalOpenChange = (
      value: boolean,
      e?: KeyboardEvent | MouseEvent,
    ) => {
      if (props.disabled) {
        return;
      }
      settingOpen(value, e);
    };

    // 实时转发 confirm：避免组件被复用且仅 `@confirm` 回调变化时（如无 rowKey 的表格翻页）
    // 被 shouldUpdateComponent 跳过更新而捕获到旧的 record，同时保留返回值用于异步 loading。
    const handleConfirm = useLiveListener<[MouseEvent?]>('confirm');

    expose({
      forceAlign: () => popoverRef.value?.forceAlign?.(),
      nativeElement: computed(() => popoverRef.value?.nativeElement),
      popupElement: computed(() => popoverRef.value?.popupElement),
    });

    const mergedProps = computed(() => ({
      ...props,
      trigger: mergedTrigger.value,
    }));

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      PopconfirmClassNamesType,
      PopconfirmStylesType,
      PopconfirmProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    const rootClassNames = computed(() =>
      clsx(
        prefixCls.value,
        hashId.value,
        cssVarCls.value,
        contextClassName.value,
        mergedClassNames.value.root,
      ),
    );

    return () => {
      const titleNode = getSlotPropsFnRun(slots, props, 'title') ?? props.title;
      const descriptionNode =
        getSlotPropsFnRun(slots, props, 'description') ?? props.description;
      const iconNode =
        getSlotPropsFnRun(slots, props, 'icon') ?? props.icon ?? defaultIcon;
      const okTextNode =
        getSlotPropsFnRun(slots, props, 'okText') ?? props.okText;
      const cancelTextNode =
        getSlotPropsFnRun(slots, props, 'cancelText') ?? props.cancelText;
      const restProps = omit(props, OMITTED_PROP_KEYS);

      const content = (
        <Overlay
          cancelButtonProps={props.cancelButtonProps}
          cancelText={cancelTextNode}
          classes={mergedClassNames.value}
          close={close}
          description={descriptionNode}
          icon={iconNode}
          okButtonProps={props.okButtonProps}
          okText={okTextNode}
          okType={props.okType ?? 'primary'}
          onCancel={onCancel}
          onConfirm={handleConfirm}
          onPopupClick={handlePopupClick}
          prefixCls={prefixCls.value}
          showCancel={props.showCancel ?? true}
          styles={mergedStyles.value}
          title={titleNode}
        />
      );

      return (
        <Popover
          {...attrs}
          {...removeUndefined(restProps)}
          arrow={mergedArrow.value}
          classes={{
            root: rootClassNames.value,
            container: mergedClassNames.value.container,
            arrow: mergedClassNames.value.arrow,
          }}
          content={content}
          onOpenChange={onInternalOpenChange}
          open={open.value}
          ref={popoverRef as any}
          styles={{
            root: { ...mergedStyles.value.root, ...contextStyle.value },
            container: mergedStyles.value.container,
            arrow: mergedStyles.value.arrow,
          }}
          trigger={mergedTrigger.value}
        >
          {slots.default?.()}
        </Popover>
      );
    };
  },
  {
    name: 'AsPopconfirm',
    inheritAttrs: false,
  },
);

type PopconfirmType = typeof InternalPopconfirm & {
  _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
  install: (app: App) => void;
};

const Popconfirm = InternalPopconfirm as PopconfirmType;

Popconfirm.install = (app: App) => {
  app.component(Popconfirm.name, Popconfirm);
};

Popconfirm._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

export default Popconfirm;
