import type { PortalProps } from '../portal';
import type { DrawerPanelEvents } from './DrawerPanel';
import type { DrawerPopupProps } from './DrawerPopup';
import type { DrawerClassNames, DrawerStyles } from './inter';

import { computed, defineComponent, nextTick, shallowRef, watch } from 'vue';

import { omit } from '@arvin-studio/kit';

import Portal from '../portal';
import { canUseDom } from '../util';
import { useRefProvide } from './context';
import DrawerPopup from './DrawerPopup';

export type Placement = 'bottom' | 'left' | 'right' | 'top';

export interface DrawerProps
  extends DrawerPanelEvents, Omit<DrawerPopupProps, 'inline' | 'prefixCls'> {
  classNames?: DrawerClassNames;
  destroyOnHidden?: boolean;
  focusTriggerAfterClose?: boolean;
  getContainer?: PortalProps['getContainer'];
  onClose?: (e: KeyboardEvent | MouseEvent) => void;
  open?: boolean;
  panelRef?: any;
  prefixCls?: string;
  styles?: DrawerStyles;
  wrapperClassName?: string;
}

const defaults = {
  prefixCls: 'headless-drawer',
  placement: 'right',
  autoFocus: true,
  keyboard: true,
  mask: true,
  maskClosable: true,
  destroyOnHidden: false,
} as DrawerProps;

const Drawer = defineComponent<DrawerProps>({
  name: 'Drawer',
  setup(rawProps = defaults, { slots, expose, attrs }) {
    const mergedOpen = shallowRef<boolean>(!!rawProps.open);

    const mergedProps = computed(() => {
      return {
        ...(attrs as Record<string, any>),
        ...(rawProps as Record<string, any>),
        open: mergedOpen.value,
      } as DrawerProps;
    });

    const animatedVisible = shallowRef(
      mergedProps.value.forceRender || mergedOpen.value,
    );
    const prefixCls = computed(
      () => mergedProps.value.prefixCls ?? 'headless-drawer',
    );
    const lastActiveRef = shallowRef<HTMLElement | null>(null);
    const popupRef = shallowRef<any>();

    const externalPanelRef = shallowRef<any>();
    watch(
      () => mergedProps.value.panelRef,
      () => {
        externalPanelRef.value = mergedProps.value.panelRef;
      },
      { immediate: true },
    );

    const { panel } = useRefProvide((el) => {
      const refTarget = externalPanelRef.value;
      if (typeof refTarget === 'function') {
        refTarget(el);
      } else if (
        refTarget &&
        typeof refTarget === 'object' &&
        'value' in refTarget
      ) {
        refTarget.value = el;
      }
    });

    watch(
      mergedOpen,
      (visible) => {
        if (!visible) {
          return;
        }

        animatedVisible.value = true;
        lastActiveRef.value = canUseDom()
          ? (document.activeElement as HTMLElement)
          : null;
      },
      { immediate: true },
    );

    const internalAfterOpenChange = (nextVisible: boolean) => {
      nextTick(() => {
        animatedVisible.value = nextVisible;
      });
      mergedProps.value.afterOpenChange?.(nextVisible);

      if (
        !nextVisible &&
        mergedProps.value?.focusTriggerAfterClose !== false &&
        lastActiveRef.value
      ) {
        const panelEl = popupRef.value?.panelRef?.value as
          | HTMLDivElement
          | undefined;
        if (panelEl && !panelEl.contains(lastActiveRef.value)) {
          try {
            lastActiveRef.value?.focus?.({ preventScroll: true } as any);
          } catch {
            // Do nothing
          }
        }
      }
    };

    expose({
      panel,
      popupRef,
    });

    const onEsc: PortalProps['onEsc'] = ({ top, event }) => {
      const { keyboard } = rawProps;
      if (top && keyboard) {
        event.stopPropagation();
        rawProps?.onClose?.(event);
      }
    };

    return () => {
      mergedOpen.value = !!rawProps.open;
      const mp = mergedProps.value;
      if (
        !mp.forceRender &&
        !animatedVisible.value &&
        !mergedOpen.value &&
        mp.destroyOnHidden
      ) {
        return null;
      }

      const eventHandlers = {
        onMouseEnter: mp.onMouseEnter,
        onMouseOver: mp.onMouseOver,
        onMouseLeave: mp.onMouseLeave,
        onClick: mp.onClick,
        onKeyDown: mp.onKeyDown,
        onKeyUp: mp.onKeyUp,
      };

      const popupNode = (
        <DrawerPopup
          {...omit(mp, ['onClose'])}
          {...eventHandlers}
          afterOpenChange={internalAfterOpenChange}
          autoFocus={mp.autoFocus !== false}
          inline={mp.getContainer === false}
          keyboard={mp.keyboard !== false}
          mask={mp.mask !== false}
          maskClosable={mp.maskClosable !== false}
          onClose={(e) => {
            mp?.onClose?.(e);
          }}
          open={mergedOpen.value}
          placement={(mp.placement ?? 'right') as any}
          prefixCls={prefixCls.value}
          ref={popupRef}
          v-slots={slots}
        />
      );

      return (
        <Portal
          autoDestroy={false}
          autoLock={
            mp.mask !== false && (mergedOpen.value || animatedVisible.value)
          }
          getContainer={mp.getContainer}
          onEsc={onEsc}
          open={mergedOpen.value || mp.forceRender || animatedVisible.value}
        >
          {popupNode}
        </Portal>
      );
    };
  },
});

export default Drawer;
