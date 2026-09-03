import type { CSSProperties, Ref } from 'vue';

import type { TagProps } from '../index';

import { computed } from 'vue';

import { FastColor } from '@arvin-studio/headless';

import { isPresetColor, isPresetStatusColor } from '../../_util/colors';

/**
 * Convert color related props to a unified object,
 * which is used to flatten the compatibility requirements.
 */
export default function useColor(
  props: {
    bordered: Ref<TagProps['bordered']>;
    color: Ref<TagProps['color']>;
    variant: Ref<TagProps['variant']>;
  },
  contextVariant?: Ref<TagProps['variant']>,
) {
  const { color, variant, bordered } = props;
  const convertColors = computed(() => {
    const isInverseColor = color.value?.endsWith?.('-inverse');

    // =================== Variant ===================
    let nextVariant: TagProps['variant'];
    if (variant.value) {
      // `variant` first
      nextVariant = variant.value;
    } else if (isInverseColor) {
      // Fallback if using inverse color
      nextVariant = 'solid';
    } else if (bordered.value === false) {
      // Fallback if using filled
      nextVariant = 'filled';
    } else {
      // Finally not conflict, use context
      nextVariant = contextVariant?.value || 'filled';
    }

    // ==================== Color ====================
    const nextColor = isInverseColor
      ? color?.value?.replace('-inverse', '')
      : color.value;
    // =============== Preset & Status ===============
    const nextIsPreset = isPresetColor(color.value);
    const nextIsStatus = isPresetStatusColor(color.value);
    // ================== Customize ==================
    // When `color` is not preset color,
    // dynamic calculate the color pair.
    const tagStyle: CSSProperties = {};
    if (!nextIsPreset && !nextIsStatus && nextColor) {
      if (nextVariant === 'solid') {
        tagStyle.backgroundColor = color.value;
      } else {
        const hsl = new FastColor(nextColor).toHsl();
        hsl.l = 0.95;
        tagStyle.backgroundColor = new FastColor(hsl).toHexString();
        tagStyle.color = color.value;
        if (nextVariant === 'outlined') {
          tagStyle.borderColor = color.value;
        }
      }
    }
    return [
      nextVariant,
      nextColor,
      nextIsPreset,
      nextIsStatus,
      tagStyle,
    ] as const;
  });
  return [
    computed(() => convertColors.value[0]),
    computed(() => convertColors.value[1]),
    computed(() => convertColors.value[2]),
    computed(() => convertColors.value[3]),
    computed(() => convertColors.value[4]),
  ] as const;
}
