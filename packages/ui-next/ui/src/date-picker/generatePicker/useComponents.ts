import type { PickerComponents as Components } from '@arvin-studio/headless';

import PickerButton from '../PickerButton';

export default function useComponents(components?: Components) {
  return {
    button: PickerButton,
    ...components,
  };
}
