import { defineComponent } from 'vue';

import { filterEmpty, warning } from '../util';
import { Collection } from './Collection';
import SingleObserver from './SingleObserver';

export { default as useResizeObserver } from './useResizeObserver';
const INTERNAL_PREFIX_KEY = 'as-observer-key';

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
      // @ts-expect-error this is a global variable which injected by babel plugin
      // eslint-disable-next-line n/prefer-global/process
      if (process.env.NODE_ENV !== 'production') {
        if (childNodes.length > 1) {
          warning(
            false,
            'Find more than one child node with `children` in ResizeObserver. Please use ResizeObserver.Collection instead.',
          );
        } else if (childNodes.length === 0) {
          warning(
            false,
            '`children` of ResizeObserver is empty. Nothing is in observe.',
          );
        }
      }
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
