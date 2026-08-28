import type { Locale } from '../locale';
import type {
  AlertConfig,
  AnchorStyleConfig,
  BadgeConfig,
  ButtonConfig,
  CheckboxConfig,
  CollapseConfig,
  ComponentStyleConfig,
  DescriptionsConfig,
  DividerConfig,
  DrawerConfig,
  EmptyConfig,
  FlexConfig,
  FloatButtonConfig,
  FloatButtonGroupConfig,
  ImageConfig,
  InputConfig,
  InputNumberConfig,
  InputSearchConfig,
  MasonryConfig,
  MentionsConfig,
  MenuConfig,
  OTPConfig,
  PopconfirmConfig,
  PopoverConfig,
  RadioConfig,
  SkeletonConfig,
  TextAreaConfig,
  ThemeConfig,
  TooltipConfig,
} from './component-config';
import type { DirectionType, Variant } from './context';
import type { RenderEmptyHandler } from './default-render-empty';
import type { SizeType } from './size-context';

export interface ConfigProviderProps {
  alert?: AlertConfig;
  anchor?: AnchorStyleConfig;
  avatar?: ComponentStyleConfig;

  badge?: BadgeConfig;

  button?: ButtonConfig;
  carousel?: ComponentStyleConfig;
  checkbox?: CheckboxConfig;

  collapse?: CollapseConfig;
  /** 是否禁用整个组件树下的所有表单类组件 */
  componentDisabled?: boolean;
  /** 尺寸 */
  componentSize?: SizeType;

  descriptions?: DescriptionsConfig;
  /** 设置布局展示方向*/
  direction?: DirectionType;
  divider?: DividerConfig;

  drawer?: DrawerConfig;
  empty?: EmptyConfig;
  flex?: FlexConfig;
  floatButton?: FloatButtonConfig;
  floatButtonGroup?: FloatButtonGroupConfig;
  iconPrefixCls?: string;
  image?: ImageConfig;
  input?: InputConfig;
  inputNumber?: InputNumberConfig;
  inputSearch?: InputSearchConfig;
  layout?: ComponentStyleConfig;
  /** 语言包配置，语言包可到 */
  locale?: Locale;
  masonry?: MasonryConfig;
  mentions?: MentionsConfig;
  menu?: MenuConfig;
  otp?: OTPConfig;
  popconfirm?: PopconfirmConfig;
  popover?: PopoverConfig;
  prefixCls?: string;
  radio?: RadioConfig;
  /** 自定义全局空状态 */
  renderEmpty?: RenderEmptyHandler;
  skeleton?: SkeletonConfig;
  textArea?: TextAreaConfig;
  theme?: ThemeConfig;
  tooltip?: TooltipConfig;
  variant?: Variant;
}

export interface ConfigProviderEmits {
  [key: string]: any;
}

export interface ConfigProviderSlots {
  [key: string]: any;
  renderEmpty?: (componentName?: string) => any;
}
