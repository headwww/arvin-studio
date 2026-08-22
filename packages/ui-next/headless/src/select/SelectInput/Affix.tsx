import { defineComponent } from 'vue';

import { filterEmpty } from '../../util';

// Affix is a simple wrapper which should not read context or logical props

const Affix = defineComponent(
  (_, { attrs, slots }) => {
    return () => {
      const children = filterEmpty(slots?.default?.() ?? []);
      if (children.length === 0) {
        return null;
      }
      return <div {...attrs}>{children}</div>;
    };
  },
  {
    name: 'Affix',
    inheritAttrs: false,
  },
);

export default Affix;
