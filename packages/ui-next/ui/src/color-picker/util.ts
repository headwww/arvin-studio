import type { ColorGenInput } from '@arvin-studio/headless';

import type {
  ColorValueFormatType,
  ColorValueType,
  LineGradientType,
} from './interface';

import { Color as RcColor } from '@arvin-studio/headless';

import { AggregationColor } from './color';

export function generateColor(
  color: ColorGenInput<AggregationColor> | Exclude<ColorValueType, null>,
): AggregationColor {
  if (color instanceof AggregationColor) {
    return color;
  }
  return new AggregationColor(color);
}

function formatSingleColorValue(
  color: AggregationColor,
  valueFormat: ColorValueFormatType,
) {
  if (typeof valueFormat === 'function') {
    return valueFormat(color);
  }

  switch (valueFormat) {
    case 'hex': {
      return color.toHexString();
    }
    case 'hsb': {
      return color.toHsbString();
    }
    // eslint-disable-next-line unicorn/no-useless-switch-case
    case 'rgb':
    default: {
      return color.toRgbString();
    }
  }
}

export function formatColorValue(
  color: AggregationColor,
  valueFormat?: ColorValueFormatType,
): Exclude<ColorValueType, null> {
  if (!valueFormat) {
    return color;
  }

  if (color.isGradient()) {
    return color.getColors().map(({ color: itemColor, percent }) => ({
      color: formatSingleColorValue(itemColor, valueFormat),
      percent,
    })) as LineGradientType;
  }

  return formatSingleColorValue(color, valueFormat);
}

export const getRoundNumber = (value: number) => Math.round(Number(value || 0));

export const getColorAlpha = (color: AggregationColor) =>
  getRoundNumber(color.toHsb().a * 100);

/** Return the color whose `alpha` is 1 */
export function genAlphaColor(color: AggregationColor, alpha?: number) {
  const rgba = color.toRgb();

  // Color from hsb input may get `rgb` is (0/0/0) when `hsb.b` is 0
  // So if rgb is empty, we should get from hsb
  if (!rgba.r && !rgba.g && !rgba.b) {
    const hsba = color.toHsb();
    hsba.a = alpha || 1;
    return generateColor(hsba);
  }

  rgba.a = alpha || 1;
  return generateColor(rgba);
}

/**
 * Get percent position color. e.g. [10%-#fff, 20%-#000], 15% => #888
 */
export function getGradientPercentColor(
  colors: { color: string; percent: number }[],
  percent: number,
): string {
  const filledColors: any[] = [
    {
      percent: 0,
      color: colors[0]!.color,
    },
    ...colors,
    {
      percent: 100,
      color: colors[colors.length - 1]!.color,
    },
  ];

  for (let i = 0; i < filledColors.length - 1; i += 1) {
    const startPtg = filledColors[i].percent;
    const endPtg = filledColors[i + 1].percent;
    const startColor = filledColors[i].color;
    const endColor = filledColors[i + 1].color;

    if (startPtg <= percent && percent <= endPtg) {
      const dist = endPtg - startPtg;
      if (dist === 0) {
        return startColor;
      }

      const ratio = ((percent - startPtg) / dist) * 100;
      const startRcColor = new RcColor(startColor);
      const endRcColor = new RcColor(endColor);

      return startRcColor.mix(endRcColor, ratio).toRgbString();
    }
  }

  // This will never reach
  /* istanbul ignore next */
  return '';
}
