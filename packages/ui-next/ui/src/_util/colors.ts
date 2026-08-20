import type { PresetColorKey } from '../theme/interface';

import { PresetColors } from '../theme/interface';

type InverseColor = `${PresetColorKey}-inverse`;

const inverseColors = PresetColors.map<InverseColor>(
  (color) => `${color}-inverse`,
);

export const PresetStatusColorTypes = [
  'success',
  'processing',
  'error',
  'default',
  'warning',
] as const;

export type PresetColorType = InverseColor | PresetColorKey;

export type PresetStatusColorType = (typeof PresetStatusColorTypes)[number];
export function isPresetColor(color?: any, includeInverse = true) {
  if (includeInverse) {
    return [...inverseColors, ...PresetColors].includes(color);
  }

  return PresetColors.includes(color);
}

export function isPresetStatusColor(
  color?: any,
): color is PresetStatusColorType {
  return PresetStatusColorTypes.includes(color);
}
