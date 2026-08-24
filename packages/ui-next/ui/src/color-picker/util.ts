import type { ColorGenInput, ColorValueType } from '@arvin-studio/headless';

import { AggregationColor } from './color';

export function generateColor(
  color: ColorGenInput<AggregationColor> | Exclude<ColorValueType, null>,
): AggregationColor {
  if (color instanceof AggregationColor) {
    return color;
  }
  return new AggregationColor(color);
}
