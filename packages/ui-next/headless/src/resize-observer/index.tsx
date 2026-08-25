import { defineComponent } from 'vue';

import { filterEmpty } from '../util';
import { Collection } from './Collection';
import SingleObserver from './SingleObserver';

export { default as useResizeObserver } from './useResizeObserver';
const INTERNAL_PREFIX_KEY = 'headless-observer-key';

export interface SizeInfo {
  height: number;
  offsetHeight: number;
  offsetWidth: number;
  width: number;
}

export type OnResize = (size: SizeInfo, element: HTMLElement) => void;

export interface ResizeObserverProps {
  /** Pass to ResizeObserver.Collection with additional data */
  data?: any;
  disabled?: boolean;
  /** Trigger if element resized. Will always trigger when first time render. */
  onResize?: OnResize;
}

const ResizeObserver = defineComponent<ResizeObserverProps>({
  setup(props, { slots }) {
    return () => {
      const childNodes = filterEmpty(slots.default?.() ?? []).filter(Boolean);
      return childNodes.map((child, index) => {
        const key = child?.key || `${INTERNAL_PREFIX_KEY}-${index}`;
        return (
          <SingleObserver {...props} key={key}>
            {child}
          </SingleObserver>
        );
      });
    };
  },
});

ResizeObserver.Collection = Collection;

export default ResizeObserver as typeof ResizeObserver & {
  Collection: typeof Collection;
};

export { ResizeObserver };

export { _rs } from './utils/observerUtil';
