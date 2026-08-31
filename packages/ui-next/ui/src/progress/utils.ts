import type { CircleProps } from './Circle';
import type { ProgressProps } from './progress';

import { presetPrimaryColors } from '@arvin-studio/headless';

export function validProgress(progress?: number) {
  if (!progress || progress < 0) {
    return 0;
  }
  if (progress > 100) {
    return 100;
  }
  return progress;
}

export function getSuccessPercent({ success }: ProgressProps) {
  let percent: number | undefined;
  if (success && 'percent' in success) {
    percent = success.percent;
  }
  return percent;
}

export function getPercentage({ percent, success }: ProgressProps) {
  const realSuccessPercent = validProgress(getSuccessPercent({ success }));
  return [
    realSuccessPercent,
    validProgress(validProgress(percent) - realSuccessPercent),
  ];
}

export function getStrokeColor({
  success = {},
  strokeColor,
}: Partial<CircleProps>): (Record<PropertyKey, string> | string)[] {
  const { strokeColor: successColor } = success;
  return [
    successColor || presetPrimaryColors.green!,
    strokeColor || null!,
  ] as const;
}

export function getSize(
  size: ProgressProps['size'],
  type: 'step' | ProgressProps['type'],
  extra?: {
    steps?: number;
    strokeWidth?: number;
  },
): [number, number] {
  let width = -1;
  let height = -1;
  switch (type) {
    case 'circle':
    case 'dashboard': {
      if (typeof size === 'string' || size === undefined) {
        [width, height] = size === 'small' ? [60, 60] : [120, 120];
      } else if (typeof size === 'number') {
        [width, height] = [size, size];
      } else if (Array.isArray(size)) {
        width = (size[0] ?? size[1] ?? 120) as number;
        height = (size[0] ?? size[1] ?? 120) as number;
      }

      break;
    }
    case 'line': {
      const strokeWidth = extra?.strokeWidth;
      if (typeof size === 'string' || size === undefined) {
        height = strokeWidth || (size === 'small' ? 6 : 8);
      } else if (typeof size === 'number') {
        [width, height] = [size, size];
      } else {
        [width = -1, height = 8] = (
          Array.isArray(size) ? size : [size.width, size.height]
        ) as [number, number];
      }

      break;
    }
    case 'step': {
      const steps = extra!.steps!;
      const strokeWidth = extra!.strokeWidth!;
      if (typeof size === 'string' || size === undefined) {
        width = size === 'small' ? 2 : 14;
        height = strokeWidth ?? 8;
      } else if (typeof size === 'number') {
        [width, height] = [size, size];
      } else {
        [width = 14, height = 8] = (
          Array.isArray(size) ? size : [size.width, size.height]
        ) as [number, number];
      }

      width *= steps;

      break;
    }
    // No default
  }
  return [width, height];
}
