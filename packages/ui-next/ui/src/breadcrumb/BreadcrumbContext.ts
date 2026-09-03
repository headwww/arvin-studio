import type { InjectionKey, Ref } from 'vue';

import type { SemanticClassNames, SemanticStyles } from '../_util/hooks';

import { inject, provide, ref } from 'vue';

export type SemanticName = 'item' | 'root' | 'separator';

export interface BreadcrumbContextProps {
  classes?: SemanticClassNames<SemanticName>;
  styles?: SemanticStyles<SemanticName>;
}

const BreadcrumbContextKey: InjectionKey<Ref<BreadcrumbContextProps>> =
  Symbol('BreadcrumbContext');

export function useBreadcrumbProvider(value: Ref<BreadcrumbContextProps>) {
  provide(BreadcrumbContextKey, value);
}

export function useBreadcrumbContext(): Ref<BreadcrumbContextProps> {
  return inject(BreadcrumbContextKey, ref({}));
}
