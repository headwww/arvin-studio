import type { Config } from 'svgo';

import { mergeRight } from 'ramda';

import { base } from './base';

export const generalConfig: Config = mergeRight(base, {
  plugins: [
    ...(base.plugins || []),
    // 新版写法：需提供 name 和 params
    { name: 'removeAttrs', params: { attrs: ['class', 'fill'] } },
  ],
});
