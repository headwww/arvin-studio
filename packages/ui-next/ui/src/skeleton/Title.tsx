import { defineComponent } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

export interface SkeletonTitleProps {
  prefixCls?: string;
  rootClass?: string;
  width?: number | string;
}

const Title = defineComponent<SkeletonTitleProps>(
  (props, { attrs }) => {
    return () => {
      const { prefixCls, rootClass, width } = props;
      return (
        <h3
          class={clsx(prefixCls, rootClass, (attrs as any)?.class)}
          style={[{ width }, (attrs as any)?.style]}
          {...omit(attrs, ['class', 'style'])}
        />
      );
    };
  },
  {
    name: 'ASkeletonTitle',
    inheritAttrs: false,
  },
);

export default Title;
