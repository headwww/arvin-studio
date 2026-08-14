import type { ColorGenInput } from '@arvin-studio/headless';

export type { ColorGenInput };

export type Colors<T> = {
  color: ColorGenInput<T>;
  percent: number;
}[];
