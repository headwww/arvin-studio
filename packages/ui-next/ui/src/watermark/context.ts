import type { InjectionKey, Ref } from 'vue';

import { defineComponent, inject, provide, ref } from 'vue';

export interface WatermarkContextProps {
  add: (ele: HTMLElement) => void;
  remove: (ele: HTMLElement) => void;
}

function voidFunc() {}
const WatermarkContextKey: InjectionKey<WatermarkContextProps> =
  Symbol('WatermarkContext');
export function useWatermarkProvider(props: WatermarkContextProps) {
  provide(WatermarkContextKey, props);
}

export function useWatermarkContext() {
  return inject(WatermarkContextKey, {
    add: voidFunc,
    remove: voidFunc,
  });
}

export const WatermarkContextProvider = defineComponent<WatermarkContextProps>(
  (props, { slots }) => {
    useWatermarkProvider(props);
    return () => {
      return slots?.default?.();
    };
  },
  {
    props: ['add', 'remove'],
  },
);

export function usePanelRef(panelSelector?: Ref<string>) {
  const watermark = useWatermarkContext();
  const panelEleRef = ref<HTMLElement | null>(null);
  return (_ele: any) => {
    if (_ele) {
      const ele = _ele as HTMLElement;
      const innerContentEle = panelSelector?.value
        ? ele.querySelector<HTMLElement>(panelSelector.value)
        : ele;
      if (innerContentEle) {
        watermark.add(innerContentEle);
        panelEleRef.value = innerContentEle;
      }
    } else {
      watermark.remove(panelEleRef.value!);
    }
  };
}
