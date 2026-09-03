import { defineComponent } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { useBaseConfig } from '../config-provider/context';
import { useBreadcrumbContext } from './BreadcrumbContext';

const BreadcrumbSeparator = defineComponent(
  (_, { slots }) => {
    const { prefixCls } = useBaseConfig('breadcrumb');
    const breadcrumbContext = useBreadcrumbContext();
    return () => {
      const { classes: mergedClassNames, styles: mergedStyles } =
        breadcrumbContext.value;

      const children = filterEmpty(slots?.default?.() ?? []);
      return (
        <li
          class={clsx(
            `${prefixCls.value}-separator`,
            mergedClassNames?.separator,
          )}
          style={mergedStyles?.separator}
        >
          {children.length === 1
            ? children[0] === ''
              ? children
              : children[0]
            : children.length === 0
              ? '/'
              : children}
        </li>
      );
    };
  },
  {
    name: 'AsBreadcrumbSeparator',
    inheritAttrs: false,
  },
);

(BreadcrumbSeparator as any).__AS_BREADCRUMB_SEPARATOR = true;
export default BreadcrumbSeparator as typeof BreadcrumbSeparator & {
  /** @internal */
  __AS_BREADCRUMB_SEPARATOR: boolean;
};
