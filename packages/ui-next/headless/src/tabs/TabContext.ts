import type { InjectionKey, ShallowRef } from 'vue';

import type { Tab } from './interface';

import { inject, provide } from 'vue';

export interface TabContextProps {
  prefixCls: string;
  tabs: Tab[];
}

const TabContextKey: InjectionKey<null | ShallowRef<TabContextProps>> =
  Symbol('TabContext');

export function provideTabContext(value: ShallowRef<TabContextProps>) {
  provide(TabContextKey, value);
}

export function useTabContext() {
  return inject(TabContextKey, {} as ShallowRef<TabContextProps>);
}
