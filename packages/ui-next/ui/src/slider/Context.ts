import type { InjectionKey, Ref } from 'vue';

import type { SliderProps as VcSliderProps } from '@arvin-studio/headless';

import type { DirectionType } from '../config-provider/context';

import { inject, provide } from 'vue';

export interface SliderInternalContextProps {
  direction?: Ref<DirectionType>;
  handleRender?: VcSliderProps['handleRender'];
}

/** @private Internal context. Do not use in your production. */
const SliderInternalContextKey: InjectionKey<SliderInternalContextProps> =
  Symbol('SliderInternalContext');

/** @private Internal context. Do not use in your production. */
export function useSliderInternalContext() {
  return inject(SliderInternalContextKey, {} as SliderInternalContextProps);
}

export function useSliderInternalContextProvider(
  value: SliderInternalContextProps,
) {
  provide(SliderInternalContextKey, value);
}
