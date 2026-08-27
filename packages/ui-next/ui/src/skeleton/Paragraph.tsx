import { defineComponent } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

type WidthUnit = number | string;

export interface SkeletonParagraphProps {
  prefixCls?: string;
  rootClass?: string;
  rows?: number;
  width?: Array<WidthUnit> | WidthUnit;
}

function getWidth(index: number, props: SkeletonParagraphProps) {
  const { width, rows = 2 } = props;
  if (Array.isArray(width)) {
    return width[index];
  }
  // last paragraph
  if (rows - 1 === index) {
    return width;
  }
  return undefined;
}

const defaults = {
  rows: 0,
} as any;

const Paragraph = defineComponent<SkeletonParagraphProps>(
  (props = defaults, { attrs }) => {
    return () => {
      const { prefixCls, rootClass, rows = 0 } = props;
      const rowList = Array.from({ length: rows }).map((_, index) => (
        <li key={index} style={{ width: getWidth(index, props) }} />
      ));
      return (
        <ul
          class={clsx(prefixCls, rootClass, (attrs as any)?.class)}
          {...omit(attrs, ['class'])}
        >
          {rowList}
        </ul>
      );
    };
  },
  {
    name: 'AsSkeletonParagraph',
    inheritAttrs: false,
  },
);

export default Paragraph;
