import { defineComponent } from 'vue';

import { usePanelPresetsContext } from '../context';
import ColorPresets from './ColorPresets';

export default defineComponent(
  () => {
    const presetsContext = usePanelPresetsContext();

    return () => {
      const { prefixCls, value, presets, onChange } = presetsContext.value!;
      return Array.isArray(presets) ? (
        <ColorPresets
          onChange={onChange}
          prefixCls={prefixCls}
          presets={presets}
          value={value}
        />
      ) : null;
    };
  },
  {
    name: 'ColorPanelPresets',
    inheritAttrs: false,
  },
);
