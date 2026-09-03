import type { AggregationColor } from '../color.ts';
import type { PresetsItem } from '../interface';

import { computed, defineComponent } from 'vue';

import { ColorBlock, Color as VcColor } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import Collapse from '../../collapse';
import useLocale from '../../locale/useLocale';
import { useToken } from '../../theme/internal';
import { generateColor } from '../util';

export interface ColorPresetsProps {
  onChange?: (value: AggregationColor) => void;
  prefixCls: string;
  presets: PresetsItem[];
  value?: AggregationColor;
}

export function isBright(value: AggregationColor, bgColorToken: string) {
  const { r, g, b, a } = value.toRgb();
  const hsv = new VcColor(value.toRgbString())
    .onBackground(bgColorToken)
    .toHsv();
  if (a <= 0.5) {
    // Adapted to dark mode
    return hsv.v > 0.5;
  }
  return r * 0.299 + g * 0.587 + b * 0.114 > 192;
}

function genPresetColor(list: PresetsItem[]) {
  return list.map((value) => {
    value.colors = value.colors.map(generateColor);
    return value;
  });
}

function genCollapsePanelKey(preset: PresetsItem, index: number) {
  const mergedKey = preset.key ?? index;
  return `panel-${mergedKey}`;
}

export default defineComponent<ColorPresetsProps>(
  (props) => {
    const [locale] = useLocale('ColorPicker');
    const [, token] = useToken();
    const colorPresetsPrefixCls = computed(() => `${props.prefixCls}-presets`);

    const presetsValue = computed(() => genPresetColor(props.presets));

    const activeKeys = computed(() =>
      presetsValue.value.reduce<string[]>((acc, preset, index) => {
        const { defaultOpen = true } = preset;
        if (defaultOpen) {
          acc.push(genCollapsePanelKey(preset, index));
        }
        return acc;
      }, []),
    );

    const handleClick = (colorValue: AggregationColor) => {
      props.onChange?.(colorValue);
    };

    const items = computed(() =>
      presetsValue.value.map((preset, index) => ({
        key: genCollapsePanelKey(preset, index),
        label: (
          <div class={`${colorPresetsPrefixCls.value}-label`}>
            {preset?.label}
          </div>
        ),
        content: (
          <div class={`${colorPresetsPrefixCls.value}-items`}>
            {Array.isArray(preset?.colors) && preset.colors?.length > 0 ? (
              (preset.colors as AggregationColor[]).map((presetColor, idx) => {
                const colorInst = generateColor(presetColor);

                return (
                  <ColorBlock
                    class={clsx(`${colorPresetsPrefixCls.value}-color`, {
                      [`${colorPresetsPrefixCls.value}-color-checked`]:
                        presetColor.toCssString() ===
                        props.value?.toCssString(),
                      [`${colorPresetsPrefixCls.value}-color-bright`]: isBright(
                        presetColor,
                        token.value.colorBgElevated,
                      ),
                    })}
                    color={colorInst.toCssString()}
                    key={`preset-${idx}-${presetColor.toHexString?.() ?? idx}`}
                    prefixCls={props.prefixCls}
                    {...{
                      onClick: () => handleClick(colorInst),
                    }}
                  />
                );
              })
            ) : (
              <span class={`${colorPresetsPrefixCls.value}-empty`}>
                {locale?.value?.presetEmpty}
              </span>
            )}
          </div>
        ),
      })),
    );

    return () => (
      <div class={colorPresetsPrefixCls.value}>
        <Collapse
          defaultActiveKey={activeKeys.value}
          ghost
          items={items.value}
        />
      </div>
    );
  },
  {
    name: 'ColorPresets',
    inheritAttrs: false,
  },
);
