import type { Config } from 'svgo';

import { optimize } from 'svgo';

import { createTransformStreamAsync } from '../creator';

export const svgo = (options: Config) => {
  return createTransformStreamAsync(async (before: string) => {
    const { data } = optimize(before, options);
    return data;
  });
};
