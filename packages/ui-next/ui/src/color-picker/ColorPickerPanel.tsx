import type { EmptyEmit } from '../_util';
import type { AggregationColor } from './color';
import type { ColorPickerProps, ModeType } from './interface';

import { computed, defineComponent } from 'vue';

import Divider from '../divider';
import PanelPicker from './components/PanelPicker';
import PanelPresets from './components/PanelPresets';
import { usePanelPickerProvider, usePanelPresetsProvider } from './context';

export interface ColorPickerPanelProps extends ColorPickerProps {
  activeIndex: number;
  gradientDragging: boolean;
  mode: ModeType;
  modeOptions: any[];
  onActive: (index: number) => void;
  onChange: (value?: AggregationColor, fromPicker?: boolean) => void;
  onChangeComplete?: (value: AggregationColor) => void;
  onClear?: () => void;
  onGradientDragging: (dragging: boolean) => void;
  onModeChange: (mode: ModeType) => void;
  panelRender?: ColorPickerProps['panelRender'];
  value: AggregationColor;
}

export default defineComponent<ColorPickerPanelProps, EmptyEmit, string>(
  (props) => {
    const colorPickerPanelPrefix = `${props.prefixCls}-inner`;

    const innerPanel = () => (
      <div class={`${colorPickerPanelPrefix}-content`}>
        <PanelPicker />
        {Array.isArray(props.presets) ? <Divider /> : null}
        <PanelPresets />
      </div>
    );
    usePanelPresetsProvider(computed(() => props as any));
    usePanelPickerProvider(computed(() => props as any));
    return () => {
      return (
        <div class={colorPickerPanelPrefix}>
          {typeof props.panelRender === 'function'
            ? props.panelRender({
                panel: innerPanel(),
                extra: {
                  components: {
                    Picker: PanelPicker,
                    Presets: PanelPresets,
                  },
                },
              })
            : innerPanel()}
        </div>
      );
    };
  },
  {
    name: 'AsColorPickerPanel',
    inheritAttrs: false,
  },
);
