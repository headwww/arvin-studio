import type { App, SlotsType } from 'vue';

import type {
  CSSMotionProps,
  DrawerProps as VcDrawerProps,
} from '@arvin-studio/headless';

import type { MaskType } from '../_util/hooks/useMergedMask';
import type {
  DrawerClassNamesType,
  DrawerPanelProps,
  DrawerStylesType,
} from './DrawerPanel';
import type { FocusableConfig, OmitFocusType } from './useFocusable';

import { computed, defineComponent, shallowRef, useId } from 'vue';

import { getTransitionName, Drawer as VcDrawer } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { ContextIsolator } from '../_util/ContextIsolator';
import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useToArr,
  useToProps,
  useZIndex,
} from '../_util/hooks';
import { useMergedMask } from '../_util/hooks/useMergedMask';
import { toPropsRefs } from '../_util/tools';
import { ZIndexProvider } from '../_util/zindexContext';
import { useComponentBaseConfig } from '../config-provider/context';
import { usePanelRef } from '../watermark/context';
import DrawerPanel from './DrawerPanel';
import useStyle from './style';
import useFocusable from './useFocusable';

const _SizeTypes = ['default', 'large'] as const;

type sizeType = (typeof _SizeTypes)[number];

export interface PushState {
  distance: number | string;
}

export interface DrawerResizableConfig {
  onResize?: (size: number) => void;
  onResizeEnd?: () => void;
  onResizeStart?: () => void;
}

export interface DrawerProps /* @vue-ignore */
  extends
    DrawerEmitsProps,
    Omit<
      VcDrawerProps,
      | 'classNames'
      | 'destroyOnHidden'
      | 'mask'
      | 'maskClosable'
      | 'maskStyle'
      | 'onClick'
      | 'onClose'
      | 'onKeyDown'
      | 'onKeyUp'
      | 'onMouseEnter'
      | 'onMouseLeave'
      | 'onMouseOver'
      | 'resizable'
      | 'rootClassName'
      | 'styles'
      | OmitFocusType
    >,
    Omit<DrawerPanelProps, 'ariaId' | 'onClose' | 'prefixCls'> {
  afterOpenChange?: (open: boolean) => void;
  destroyOnHidden?: boolean;
  focusable?: FocusableConfig;
  mask?: MaskType;
  /** @deprecated Please use `mask.closable` instead */
  maskClosable?: boolean;
  open?: boolean;
  resizable?: boolean | DrawerResizableConfig;
  rootClass?: string;
  size?: number | sizeType | string;
}

export interface DrawerEmits {
  afterOpenChange: (open: boolean) => void;
  click: (e: MouseEvent) => void;
  close: (e: KeyboardEvent | MouseEvent) => void;
  keydown: (e: KeyboardEvent) => void;
  keyup: (e: KeyboardEvent) => void;
  mouseenter: (e: MouseEvent) => void;
  mouseleave: (e: MouseEvent) => void;
  mouseover: (e: MouseEvent) => void;
  'update:open': (open: boolean) => void;
}
export interface DrawerEmitsProps {
  onAfterOpenChange?: DrawerEmits['afterOpenChange'];
  onClick?: DrawerEmits['click'];
  onClose?: DrawerEmits['close'];
  onKeydown?: DrawerEmits['keydown'];
  onKeyup?: DrawerEmits['keyup'];
  onMouseenter?: DrawerEmits['mouseenter'];
  onMouseleave?: DrawerEmits['mouseleave'];
  onMouseover?: DrawerEmits['mouseover'];
  'onUpdate:open'?: DrawerEmits['update:open'];
}

export interface DrawerSlots {
  closeIcon?: () => any;
  default?: () => any;
  extra?: () => any;
  footer?: () => any;
  title?: () => any;
}

const defaultPushState: PushState = { distance: 180 };

const DEFAULT_SIZE = 378;

const defaults = {
  defaultSize: DEFAULT_SIZE,
  push: defaultPushState,
  panelRef: null,
} as any;

const Drawer = defineComponent<
  DrawerProps,
  DrawerEmits,
  string,
  SlotsType<DrawerSlots>
>(
  (props = defaults, { slots, emit, attrs }) => {
    const id = useId();

    const {
      getPopupContainer,
      direction,
      prefixCls,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      mask: contextMask,
      focusable: contextFocusable,
    } = useComponentBaseConfig('drawer', props, ['mask', 'focusable']);
    const {
      zIndex: customZIndex,
      mask: drawerMask,
      classes,
      styles,
      focusable,
      maskClosable,
    } = toPropsRefs(
      props,
      'zIndex',
      'mask',
      'classes',
      'styles',
      'focusable',
      'maskClosable',
    );

    const [hashId, cssVarCls] = useStyle(prefixCls);

    // ============================ Size ============================
    const drawerSize = computed(() => {
      const { size, placement, width, height } = props;
      if (typeof size === 'number') {
        return size;
      }
      if (size === 'large') {
        return 736;
      }

      if (size === 'default') {
        return DEFAULT_SIZE;
      }

      if (typeof size === 'string') {
        if (/^\d+(\.\d+)?$/.test(size)) {
          return Number(size);
        }
        return size;
      }
      if (!placement || placement === 'left' || placement === 'right') {
        return width;
      }

      return height;
    });

    // ============================ Refs ============================
    // Select `ant-drawer-content` by `panelRef`
    const innerPanelRef = usePanelRef();
    const panelRef = shallowRef();

    // ============================ zIndex ============================
    const [zIndex, contextZIndex] = useZIndex('Drawer', customZIndex);

    // ============================ Mask ============================
    const [mergedMask, maskBlurClassName, mergedMaskClosable] = useMergedMask(
      drawerMask,
      contextMask,
      prefixCls,
      maskClosable,
    );
    // ========================== Focusable =========================
    const mergedFocusableInput = computed(() => ({
      ...contextFocusable?.value,
      ...focusable.value,
    }));
    const mergedFocusable = useFocusable(
      mergedFocusableInput as any,
      computed(() => {
        return props?.getContainer !== false && mergedMask.value;
      }),
    );
    const mergedProps = computed(() => {
      return {
        ...props,
        zIndex: zIndex.value,
        mask: mergedMask.value,
        focusable: mergedFocusable.value,
        maskClosable: mergedMaskClosable.value,
      } as DrawerProps;
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      DrawerClassNamesType,
      DrawerStylesType,
      DrawerProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );
    return () => {
      const {
        rootClass,
        maskStyle,
        drawerStyle,
        contentWrapperStyle,
        open,
        push,
        defaultSize,
        rootStyle,
        getContainer: customizeGetContainer,
        resizable,
        afterOpenChange,
        destroyOnHidden,
        size,
        ...rest
      } = props;
      const { className, restAttrs, style } = getAttrStyleAndClass(attrs);
      // =========================== Motion ===========================
      const maskMotion: CSSMotionProps = {
        name: getTransitionName(prefixCls.value, 'mask-motion'),
        appear: true,
      };
      const panelMotion: VcDrawerProps['motion'] = (motionPlacement) => ({
        name: getTransitionName(
          prefixCls.value,
          `panel-motion-${motionPlacement}`,
        ),
        appear: true,
      });

      const drawerClassName = clsx(
        {
          'no-mask': !mergedMask.value,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        rootClass,
        hashId.value,
        cssVarCls.value,
        mergedClassNames.value.root,
      );

      const getContainer =
        // 有可能为 false，所以不能直接判断
        customizeGetContainer === undefined && getPopupContainer
          ? () => getPopupContainer(document.body)
          : customizeGetContainer;
      const ariaLabelledby = restAttrs['aria-labelledby'];
      const ariaId = rest.title ? id : undefined;
      return (
        <ContextIsolator form space>
          <ZIndexProvider value={contextZIndex.value}>
            <VcDrawer
              {...(restAttrs as any)}
              {...(rest as any)}
              afterOpenChange={afterOpenChange}
              class={clsx(contextClassName.value, className)}
              classNames={{
                mask: clsx(
                  mergedClassNames.value.mask,
                  maskBlurClassName.value.mask,
                ),
                section: mergedClassNames.value.section,
                wrapper: mergedClassNames.value.wrapper,
                dragger: mergedClassNames.value.dragger,
              }}
              defaultSize={defaultSize}
              getContainer={getContainer}
              mask={mergedMask.value}
              maskClosable={mergedMaskClosable.value}
              maskMotion={maskMotion}
              motion={panelMotion}
              onClick={(e) => {
                emit('click', e);
              }}
              onClose={(e) => {
                emit('update:open', false);
                emit('close', e);
              }}
              onKeyDown={(e) => {
                emit('keydown', e);
              }}
              onKeyUp={(e) => {
                emit('keyup', e);
              }}
              onMouseEnter={(e) => {
                emit('mouseenter', e);
              }}
              onMouseLeave={(e) => {
                emit('mouseleave', e);
              }}
              onMouseOver={(e) => {
                emit('mouseover', e);
              }}
              open={open}
              prefixCls={prefixCls.value}
              push={push}
              ref={(el: any) => {
                const panel = el?.panel;
                panelRef.value = panel;
                innerPanelRef(panel);
              }}
              rootClassName={drawerClassName}
              rootStyle={{ ...rootStyle, ...mergedStyles.value.root }}
              size={drawerSize.value}
              style={{ ...contextStyle.value, ...style }}
              styles={{
                mask: { ...mergedStyles.value.mask, ...maskStyle },
                section: { ...mergedStyles.value.section, ...drawerStyle },
                wrapper: {
                  ...mergedStyles.value.wrapper,
                  ...contentWrapperStyle,
                },
                dragger: mergedStyles.value.dragger,
              }}
              zIndex={zIndex.value}
              {...(resizable ? { resizable } : {})}
              aria-labelledby={ariaLabelledby ?? ariaId}
              destroyOnHidden={destroyOnHidden}
              focusTrap={mergedFocusable.value.trap}
              // Focusable
              focusTriggerAfterClose={
                mergedFocusable.value.focusTriggerAfterClose
              }
            >
              <DrawerPanel
                {...rest}
                ariaId={ariaId}
                onClose={(e: KeyboardEvent | MouseEvent) => {
                  emit('update:open', false);
                  emit('close', e);
                }}
                prefixCls={prefixCls.value}
                size={size}
                v-slots={slots}
              />
            </VcDrawer>
          </ZIndexProvider>
        </ContextIsolator>
      );
    };
  },
  {
    name: 'AsDrawer',
    inheritAttrs: false,
  },
);

interface PurePanelInterface {
  placement?: DrawerProps['placement'];
  prefixCls?: string;
}

export const PurePanel = defineComponent<
  Omit<DrawerPanelProps, 'prefixCls'> & PurePanelInterface
>((props, { attrs, slots }) => {
  const { prefixCls } = useComponentBaseConfig('drawer', props);
  const [hashId, cssVarCls] = useStyle(prefixCls);

  return () => {
    const { restAttrs, className, style } = getAttrStyleAndClass(attrs);
    const { placement = 'right', ...restProps } = props;
    const cls = clsx(
      prefixCls.value,
      `${prefixCls.value}-pure`,
      `${prefixCls.value}-${placement}`,
      hashId.value,
      cssVarCls.value,
      className,
    );
    return (
      <div class={cls} style={style}>
        <DrawerPanel
          {...restAttrs}
          v-slots={slots}
          {...restProps}
          prefixCls={prefixCls.value}
        />
      </div>
    );
  };
});

(Drawer as any)._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
(Drawer as any).install = (app: App) => {
  app.component(Drawer.name, Drawer);
};

export default Drawer;
