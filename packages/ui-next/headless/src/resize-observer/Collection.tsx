import type { InjectionKey } from 'vue';

import type { SizeInfo } from '.';

import { defineComponent, inject, provide, shallowRef } from 'vue';

type onCollectionResize = (
  size: SizeInfo,
  element: HTMLElement,
  data: any,
) => void;

export const CollectionContext: InjectionKey<onCollectionResize> =
  Symbol('CollectionContext');

export interface ResizeInfo {
  data: any;
  element: HTMLElement;
  size: SizeInfo;
}

export interface CollectionProps {
  /** Trigger when some children ResizeObserver changed. Collect by frame render level */
  onBatchResize?: (resizeInfo: ResizeInfo[]) => void;
}

export const Collection = defineComponent<CollectionProps>({
  setup(props, { slots }) {
    const resizeIdRef = shallowRef(0);
    const resizeInfosRef = shallowRef<ResizeInfo[]>([]);
    const onCollectionResize = inject(CollectionContext, () => {});
    const onResize = (size: SizeInfo, element: HTMLElement, data: any) => {
      const resizeId = resizeIdRef.value + 1;
      resizeIdRef.value = resizeId;
      resizeInfosRef.value.push({ size, element, data });
      void (async () => {
        await Promise.resolve();
        if (resizeIdRef.value !== resizeId) {
          return;
        }

        const resizeInfos = resizeInfosRef.value;
        resizeInfosRef.value = [];
        props.onBatchResize?.(resizeInfos);
      })();
      onCollectionResize?.(size, element, data);
    };

    provide(CollectionContext, onResize);
    return () => {
      return slots.default?.();
    };
  },
});
