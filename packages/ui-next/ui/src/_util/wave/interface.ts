import type { GlobalToken } from '../../theme/internal';

import { defaultPrefixCls } from '../../config-provider/context';

export const TARGET_CLS = `${defaultPrefixCls}-wave-target`;

export type WaveComponent =
  | 'Button'
  | 'Checkbox'
  | 'Radio'
  | 'Steps'
  | 'Switch'
  | 'Tag';
export type WaveColorSource =
  | 'backgroundColor'
  | 'borderColor'
  | 'color'
  | null;

export type ShowWaveEffect = (
  element: HTMLElement,
  info: {
    className: string;
    colorSource?: WaveColorSource;
    component?: WaveComponent;
    event: MouseEvent;
    hashId: string;
    token: GlobalToken;
  },
) => void;

export type ShowWave = (event: MouseEvent) => void;
