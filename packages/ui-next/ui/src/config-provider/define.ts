import type { Locale } from '../locale';
import type {
  ButtonConfig,
  DirectionType,
  ThemeConfig,
  Variant,
} from './context';
import type { RenderEmptyHandler } from './default-render-empty';
import type { SizeType } from './size-context';

export interface ConfigProviderProps {
  button?: ButtonConfig;

  /** 是否禁用整个组件树下的所有表单类组件 */
  componentDisabled?: boolean;
  /** 尺寸 */
  componentSize?: SizeType;
  /** 设置布局展示方向*/
  direction?: DirectionType;

  iconPrefixCls?: string;

  /** 语言包配置，语言包可到 */
  locale?: Locale;
  prefixCls?: string;

  /** 自定义全局空状态 */
  renderEmpty?: RenderEmptyHandler;
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
