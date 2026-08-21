import type { DefaultPanelProps } from './DefaultPanel';

import { defineComponent } from 'vue';

import DefaultPanel from './DefaultPanel';

const TourStep = defineComponent<DefaultPanelProps>(
  (props, { attrs }) => {
    return () => {
      const { current, renderPanel } = props;
      return (
        <>
          {typeof renderPanel === 'function' ? (
            renderPanel({ ...props, ...attrs } as any, current!)
          ) : (
            <DefaultPanel {...props} />
          )}
        </>
      );
    };
  },
  {
    name: 'TourStep',
    inheritAttrs: false,
  },
);

export default TourStep;
