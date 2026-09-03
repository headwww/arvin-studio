import type { Ref } from 'vue';

import type { Variant } from '../../config-provider/context';
import type { ConfigProviderProps } from '../../config-provider/define.ts';

import { computed } from 'vue';

import { useConfig, Variants } from '../../config-provider/context';
import { useVariantContext } from '../context';

type VariantComponents = keyof Pick<
  ConfigProviderProps,
  | 'card'
  | 'cascader'
  | 'datePicker'
  | 'input'
  | 'inputNumber'
  | 'mentions'
  | 'rangePicker'
  | 'select'
  | 'textArea'
  | 'timePicker'
  | 'treeSelect'
>;

export default function useVariant(
  component: VariantComponents,
  variant?: Ref<undefined | Variant>,
  legacyBordered?: boolean | Ref<boolean | undefined>,
) {
  const config = useConfig();
  const formVariant = useVariantContext();

  const mergedVariant = computed<Variant>(() => {
    if (variant?.value !== undefined) {
      return variant.value;
    }

    const borderedValue =
      typeof legacyBordered === 'object'
        ? legacyBordered.value
        : legacyBordered;

    if (borderedValue === false) {
      return 'borderless';
    }

    const componentConfigVariant = (config.value as any)?.[component]?.variant;
    const globalVariant = config.value?.variant;

    return (
      formVariant.value ?? componentConfigVariant ?? globalVariant ?? 'outlined'
    );
  });

  const enableVariantCls = computed(() =>
    Variants.includes(mergedVariant.value),
  );

  return [mergedVariant, enableVariantCls] as const;
}

export const useVariants = useVariant;
