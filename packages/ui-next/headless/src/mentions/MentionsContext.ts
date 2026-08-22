import type { InjectionKey, Ref } from 'vue';

import type { VueNode } from '../util';
import type { OptionProps } from './Option';

import { computed, defineComponent, inject, provide, ref } from 'vue';

export interface MentionsContextProps {
  activeIndex: number;
  notFoundContent: VueNode;
  onBlur: (e: FocusEvent) => void;
  onFocus: (e: FocusEvent) => void;
  onScroll: (e: UIEvent) => void;
  selectOption: (option: OptionProps) => void;
  setActiveIndex: (index: number) => void;
}

const MentionsContextKey: InjectionKey<Ref<MentionsContextProps>> =
  Symbol('MentionsContext');

export function useMentionsContext() {
  return inject(MentionsContextKey, ref() as Ref<MentionsContextProps>);
}

export const MentionsProvider = defineComponent<{
  value: MentionsContextProps;
}>(
  (props, { slots }) => {
    const value = computed(() => props.value);
    provide(MentionsContextKey, value);
    return () => {
      return slots?.default?.();
    };
  },
  {
    name: 'MentionsProvider',
    inheritAttrs: false,
    props: ['value'],
  },
);
