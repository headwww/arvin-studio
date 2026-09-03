import type { App } from 'vue';

import InternalDropdown from './dropdown';

const Dropdown = InternalDropdown as typeof InternalDropdown & {
  install: (app: App) => void;
};

Dropdown.install = (app: App) => {
  app.component(Dropdown.name, Dropdown);
};

export default Dropdown;

export type {
  DropdownArrowOptions,
  DropdownEmits,
  DropdownProps,
  DropdownSlots,
} from './dropdown';
