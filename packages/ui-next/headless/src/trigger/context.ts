import type { CSSProperties, InjectionKey, Ref } from 'vue';

import type { PortalProps } from '../portal';
import type { CSSMotionProps } from '../util';
import type { TriggerProps } from './index';
import type { AlignType, ArrowTypeOuter, BuildInPlacements } from './interface';

import { computed, defineComponent, inject, provide } from 'vue';
// ===================== Nest =====================
export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement | null) => void;
}

const TriggerContextKey: InjectionKey<Ref<TriggerContextProps>> =
  Symbol('TriggerContextKey');

export function useTriggerContext() {
  return inject(TriggerContextKey, undefined);
}

export const TriggerContextProvider = defineComponent<TriggerContextProps>(
  (props, { slots }) => {
    provide(
      TriggerContextKey,
      computed(() => props),
    );
    return () => {
      return slots?.default?.();
    };
  },
  {
    // eslint-disable-next-line vue/require-prop-types
    props: ['registerSubPopup'],
  },
);

// ==================== Unique ====================
export interface UniqueShowOptions {
  arrow?: ArrowTypeOuter;
  builtinPlacements?: BuildInPlacements;
  delay: number;
  getPopupClassNameFromAlign?: (align: AlignType) => string;
  getPopupContainer?: TriggerProps['getPopupContainer'];
  id: string;
  mask?: boolean;
  maskClosable?: boolean;
  maskMotion?: CSSMotionProps;
  onEsc?: PortalProps['onEsc'];
  popup: TriggerProps['popup'];
  popupAlign?: AlignType;
  popupClassName?: string;
  popupMotion?: CSSMotionProps;
  popupPlacement?: string;
  popupStyle?: CSSProperties;
  prefixCls?: string;
  target: HTMLElement;
  uniqueContainerClassName?: string;
  uniqueContainerStyle?: CSSProperties;
  zIndex?: number;
}

export interface UniqueContextProps {
  hide: (delay: number) => void;
  show: (options: UniqueShowOptions, isOpen: () => boolean) => void;
}

export const UniqueContextKey: InjectionKey<UniqueContextProps> =
  Symbol('UniqueContextKey');

export function useUniqueContext() {
  return inject(UniqueContextKey, undefined);
}

export const UniqueContextProvider = defineComponent<UniqueContextProps>(
  (props, { slots }) => {
    provide(UniqueContextKey, props);
    return () => {
      return slots?.default?.();
    };
  },
  {
    // eslint-disable-next-line vue/require-prop-types
    props: ['show', 'hide'],
  },
);
