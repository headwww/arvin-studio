import type { Ref } from 'vue';

import type { PortalProps } from '../portal';

import { computed, defineComponent } from 'vue';

import Portal from '../portal';

export interface PlaceholderProps extends Pick<
  PortalProps,
  'autoLock' | 'getContainer' | 'open'
> {
  domRef: Ref<HTMLDivElement | null>;
  fallbackDOM: () => HTMLElement | null;
}

const Placeholder = defineComponent<PlaceholderProps>(
  (props, { expose, attrs }) => {
    expose({
      getDom: () => {
        return props?.domRef.value ?? props?.fallbackDOM?.();
      },
      __$el: computed(() => props?.domRef?.value ?? props?.fallbackDOM?.()),
    });
    return () => {
      const { open, autoLock, getContainer } = props;
      return (
        <Portal autoLock={autoLock} getContainer={getContainer} open={open}>
          <div ref={props.domRef} {...attrs} />
        </Portal>
      );
    };
  },
  {
    name: 'TourPlaceholder',
    inheritAttrs: false,
  },
);

export default Placeholder;
