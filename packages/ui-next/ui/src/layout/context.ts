import type { InjectionKey } from 'vue';

import { inject, provide } from 'vue';

export interface LayoutContextProps {
  siderHook: {
    addSider: (id: string) => void;
    removeSider: (id: string) => void;
  };
}

const LayoutContextSymbol: InjectionKey<LayoutContextProps> =
  Symbol('LayoutContext');

export function useLayoutProvider(props: LayoutContextProps) {
  provide(LayoutContextSymbol, props);
}

export function useLayoutCtx() {
  return inject(LayoutContextSymbol, {
    siderHook: {
      addSider: () => null,
      removeSider: () => null,
    },
  });
}
