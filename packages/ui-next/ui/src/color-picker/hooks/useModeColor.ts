import type { Ref } from 'vue';

import type { VueNode } from '../../_util';
import type { AggregationColor } from '../color.ts';
/**
 * Combine the `color` and `mode` to make sure sync of state.
 */
import type {
  ColorPickerProps,
  ColorValueType,
  ModeType,
} from '../interface.ts';

import { computed, shallowRef, watch } from 'vue';

import useLocale from '../../locale/useLocale';
import { generateColor } from '../util';

export type ModeOptions = {
  label: VueNode;
  value: ModeType;
}[];

export default function useModeColor(
  value: Ref<ColorValueType>,
  mode: Ref<ColorPickerProps['mode']>,
  defaultValue?: ColorValueType,
) {
  const [locale] = useLocale('ColorPicker');
  // ======================== Base ========================
  // Color
  const mergedColor = shallowRef(value.value ?? defaultValue);
  watch(value, () => {
    mergedColor.value = value.value;
  });
  // Mode
  const modeState = shallowRef<ModeType>('single');

  const modeOptionListCompute = computed(() => {
    const list = (Array.isArray(mode.value) ? mode.value : [mode.value]).filter(
      (m) => !!m,
    );
    if (list.length === 0) {
      list.push('single');
    }
    const modes = new Set(list);
    const optionList: ModeOptions = [];
    const pushOption = (modeType: ModeType, localeTxt: string) => {
      if (modes.has(modeType)) {
        optionList.push({
          label: localeTxt,
          value: modeType,
        });
      }
    };
    pushOption('single', locale?.value.singleColor);
    pushOption('gradient', locale?.value.gradientColor);

    return [optionList, modes] as const;
  });
  const modeOptionList = computed(() => modeOptionListCompute.value[0]);
  const modeSet = computed(() => modeOptionListCompute.value[1]);

  // ======================== Post ========================
  // We need align `mode` with `color` state

  // >>>>> Color
  const cacheColor = shallowRef<AggregationColor>();
  const setColor = (nextColor: AggregationColor) => {
    cacheColor.value = nextColor;
    mergedColor.value = nextColor;
  };

  const postColor = computed(() => {
    const colorObj = generateColor(mergedColor.value || '');

    // Use `cacheColor` in case the color is `cleared`
    return colorObj.equals(cacheColor.value!) ? cacheColor.value! : colorObj;
  });

  // >>>>> Mode
  const postMode = computed(() => {
    if (modeSet.value?.has(modeState.value)) {
      return modeState.value;
    }
    return modeOptionList.value[0]?.value;
  });
  // ======================= Effect =======================
  // Dynamic update mode when color change
  watch(
    postColor,
    () => {
      modeState.value = postColor.value?.isGradient() ? 'gradient' : 'single';
    },
    {
      immediate: true,
    },
  );

  const setModeState = (nextMode: ModeType) => {
    modeState.value = nextMode;
  };

  // ======================= Return =======================
  return [postColor, setColor, postMode, setModeState, modeOptionList] as const;
}
