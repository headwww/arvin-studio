import type { AriaAttributes, ComputedRef } from 'vue';

import type { VueNode } from '../../util';

import { computed } from 'vue';

import { pickAttrs } from '../../util';

export type ClosableConfig = AriaAttributes &
  Record<`data-${string}`, unknown> & {
    closeIcon?: VueNode;
    disabled?: boolean;
    onClose?: VoidFunction;
  };

export type ClosableType = boolean | ClosableConfig | null | undefined;

export interface ParsedClosableConfig extends ClosableConfig {
  closeIcon: VueNode;
  disabled: boolean;
}

/**
 * Normalizes the closable option into a boolean flag, parsed config, and
 * aria props for the close button. Mirrors rc-notification@2.0 useClosable.
 */
export default function useClosable(
  closable: ComputedRef<ClosableType>,
): [
  ComputedRef<boolean>,
  ComputedRef<ParsedClosableConfig>,
  ComputedRef<Record<string, unknown>>,
] {
  const closableObj = computed<ClosableConfig>(() => {
    const value = closable.value;
    if (value === false) {
      return { closeIcon: null, disabled: true };
    }
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    return {};
  });

  const closableConfig = computed<ParsedClosableConfig>(() => {
    const obj = closableObj.value;
    return {
      ...obj,
      closeIcon: 'closeIcon' in obj ? obj.closeIcon : '×',
      disabled: obj.disabled ?? false,
    };
  });

  const closableAriaProps = computed(() =>
    pickAttrs(closableConfig.value, true),
  );

  return [computed(() => !!closable.value), closableConfig, closableAriaProps];
}
