import type { Ref } from 'vue';

import type { ScreenSizeMap } from '../_util/responsiveObserver';
import type { SizeType } from '../config-provider/size-context';

import { inject, provide, ref } from 'vue';

/**
 * 'default' is deprecated and will be removed in v7, please use `medium` instead.
 */
export type AvatarSize = 'default' | number | ScreenSizeMap | SizeType;

export interface AvatarContextType {
  shape?: 'circle' | 'square';
  size?: AvatarSize;
}

const AvatarContextKey = Symbol('AvatarContext');

export function useAvatarContext() {
  return inject(AvatarContextKey, ref({} as AvatarContextType));
}

export function useAvatarProvider(value: Ref<AvatarContextType>) {
  provide(AvatarContextKey, value);
}
