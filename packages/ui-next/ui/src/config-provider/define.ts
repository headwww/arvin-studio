import type { Locale } from '../locale';
import type {
  ButtonConfig,
  CheckboxConfig,
  InputConfig,
  InputNumberConfig,
  InputSearchConfig,
  OTPConfig,
  RadioConfig,
  TextAreaConfig,
  ThemeConfig,
} from './component-config';
import type { DirectionType, Variant } from './context';
import type { RenderEmptyHandler } from './default-render-empty';
import type { SizeType } from './size-context';

export interface ConfigProviderProps {
  button?: ButtonConfig;
  checkbox?: CheckboxConfig;
  /** 是否禁用整个组件树下的所有表单类组件 */
  componentDisabled?: boolean;

  /** 尺寸 */
  componentSize?: SizeType;

  /** 设置布局展示方向*/
  direction?: DirectionType;
  iconPrefixCls?: string;
  input?: InputConfig;

  inputNumber?: InputNumberConfig;
  inputSearch?: InputSearchConfig;

  /** 语言包配置，语言包可到 */
  locale?: Locale;

  otp?: OTPConfig;
  prefixCls?: string;
  radio?: RadioConfig;
  /** 自定义全局空状态 */
  renderEmpty?: RenderEmptyHandler;
  textArea?: TextAreaConfig;
  theme?: ThemeConfig;
  variant?: Variant;
}

export interface ConfigProviderEmits {
  [key: string]: any;
}

export interface ConfigProviderSlots {
  [key: string]: any;
  renderEmpty?: (componentName?: string) => any;
}
