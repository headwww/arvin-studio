import type { CSSProperties, FunctionalComponent } from 'vue';

export interface OptionProps {
  class?: string;
  disabled?: boolean;
  key?: string;
  style?: CSSProperties;
  value?: string;
}

const Option: FunctionalComponent<OptionProps> = () => null;

export default Option;
