import type { CSSProperties } from 'vue';

import type { ComponentBaseProps } from '../config-provider/context.ts';
import type { SizeType } from '../config-provider/size-context';

export interface FlexProps extends ComponentBaseProps {
  align?: CSSProperties['alignItems'];
  component?: any;
  flex?: CSSProperties['flex'];
  gap?: CSSProperties['gap'] | SizeType;
  justify?: CSSProperties['justifyContent'];
  vertical?: boolean;
  wrap?: boolean | CSSProperties['flexWrap'];
}
