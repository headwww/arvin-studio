import type { InjectionKey, Ref } from 'vue';

import type {
  AnchorSemanticClassNames,
  AnchorSemanticStyles,
  AntAnchor,
} from './Anchor';

import { inject, provide } from 'vue';

export type AnchorContextType = Pick<
  AntAnchor,
  'onClick' | 'registerLink' | 'scrollTo' | 'unregisterLink'
> & {
  activeLink: Ref<string>;
  classes: Ref<AnchorSemanticClassNames>;
  direction: Ref<AntAnchor['direction'] | undefined>;
  styles: Ref<AnchorSemanticStyles>;
};

const AnchorContextKey: InjectionKey<AnchorContextType> =
  Symbol('AnchorContext');

export function useAnchorProvider(ctx: AnchorContextType) {
  provide(AnchorContextKey, ctx);
}

export function useAnchorContext() {
  return inject(AnchorContextKey, undefined);
}
