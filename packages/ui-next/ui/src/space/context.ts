import type { InjectionKey, Ref } from 'vue';

import { inject, provide, ref } from 'vue';

export interface SpaceContextType {
  latestIndex: number;
}

export const SpaceContextKey: InjectionKey<Ref<SpaceContextType>> =
  Symbol('SpaceContextKey');

export function useSpaceContextProvider(props: Ref<SpaceContextType>) {
  provide(SpaceContextKey, props);
}

export function useSpaceContext() {
  return inject(SpaceContextKey, ref({ latestIndex: 0 }));
}
