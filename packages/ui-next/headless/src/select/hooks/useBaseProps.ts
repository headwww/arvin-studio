import type { InjectionKey, Ref } from 'vue';

import type { BaseSelectProps } from '../BaseSelect';

import { inject, provide, ref } from 'vue';

export interface BaseSelectContextProps extends BaseSelectProps {
  lockOptions: boolean;
  multiple: boolean;
  rawOpen: boolean;
  role?: string;
  toggleOpen: (open?: boolean) => void;
  triggerOpen: boolean;
}

const BaseSelectContext: InjectionKey<Ref<BaseSelectContextProps>> =
  Symbol('BaseSelectContext');

export function useBaseSelectProvider(context: Ref<BaseSelectContextProps>) {
  provide(BaseSelectContext, context);
}

export default function useBaseProps() {
  return inject(
    BaseSelectContext,
    ref(null) as any,
  ) as Ref<BaseSelectContextProps | null>;
}
