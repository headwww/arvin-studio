import type { InjectionKey, Ref } from 'vue';

import type { ComponentType, StepsProps } from './Steps';

import { inject, provide, ref } from 'vue';

export interface StepsContextProps {
  classNames: NonNullable<StepsProps['classNames']>;
  ItemComponent: ComponentType;
  prefixCls: string;
  styles: NonNullable<StepsProps['styles']>;
}

const StepsContext: InjectionKey<Ref<StepsContextProps>> =
  Symbol('StepsContext');
export function useStepsContext() {
  return inject(StepsContext, ref(null) as any) as Ref<StepsContextProps>;
}

export function useStepsProvider(props: Ref<StepsContextProps>) {
  provide(StepsContext, props);
}
