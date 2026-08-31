import {
  canUseDom,
  isStyleSupport as vcIsStyleSupport,
} from '@arvin-studio/headless';

export const canUseDocElement = () =>
  canUseDom() && window.document?.documentElement;

export const isStyleSupport = vcIsStyleSupport;

export default isStyleSupport;
