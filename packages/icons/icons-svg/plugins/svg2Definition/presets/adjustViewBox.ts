import { includes } from 'ramda';

import { TransformFactory } from '../..';
import { assignAttrsAtTag as assignAttributesAtTag } from '../creator';

const OLD_ICON_NAMES = [
  'step-backward',
  'step-forward',
  'fast-backward',
  'fast-forward',
  'forward',
  'backward',
  'caret-up',
  'caret-down',
  'caret-left',
  'caret-right',
  'retweet',
  'swap-left',
  'swap-right',
  'loading',
  'loading-3-quarters',
  'coffee',
  'bars',
  'file-jpg',
  'inbox',
  'shopping-cart',
  'safety',
  'medium-workmark',
];

export const adjustViewBox: TransformFactory = assignAttributesAtTag(
  'svg',
  ({ name }) => ({
    viewBox: includes(name, OLD_ICON_NAMES) ? '0 0 1024 1024' : '64 64 896 896',
  }),
);
