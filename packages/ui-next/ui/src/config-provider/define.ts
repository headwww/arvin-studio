import type { WarningContextProps } from '../_util/warning';
import type { Locale } from '../locale';
import type {
  AlertConfig,
  AnchorStyleConfig,
  BadgeConfig,
  BreadcrumbConfig,
  ButtonConfig,
  CalendarConfig,
  CardConfig,
  CascaderConfig,
  CheckboxConfig,
  CollapseConfig,
  ColorPickerConfig,
  ComponentStyleConfig,
  CSPConfig,
  DatePickerConfig,
  DescriptionsConfig,
  DirectionType,
  DividerConfig,
  DrawerConfig,
  DropdownConfig,
  EmptyConfig,
  FlexConfig,
  FloatButtonConfig,
  FloatButtonGroupConfig,
  FormConfig,
  ImageConfig,
  InputConfig,
  InputNumberConfig,
  InputSearchConfig,
  MasonryConfig,
  MentionsConfig,
  MenuConfig,
  ModalConfig,
  NotificationConfig,
  OTPConfig,
  PaginationConfig,
  PopconfirmConfig,
  PopoverConfig,
  PopupOverflow,
  ProgressConfig,
  RadioConfig,
  RangePickerConfig,
  ResultConfig,
  SegmentedConfig,
  SelectConfig,
  SkeletonConfig,
  SliderConfig,
  SpaceConfig,
  SpinConfig,
  SplitterConfig,
  StatisticConfig,
  StepsConfig,
  SwitchStyleConfig,
  TabsConfig,
  TagConfig,
  TextAreaConfig,
  ThemeConfig,
  TimelineConfig,
  TimePickerConfig,
  TooltipConfig,
  TourConfig,
  TransferConfig,
  TreeConfig,
  TreeSelectConfig,
  TypographyConfig,
  UploadConfig,
  Variant,
  WaveConfig,
} from './context.ts';
import type { RenderEmptyHandler } from './default-render-empty';
import type { SizeType } from './size-context';

export interface ConfigProviderProps {
  alert?: AlertConfig;
  anchor?: AnchorStyleConfig;
  avatar?: ComponentStyleConfig;
  badge?: BadgeConfig;
  breadcrumb?: BreadcrumbConfig;
  button?: ButtonConfig;
  calendar?: CalendarConfig;
  card?: CardConfig;
  carousel?: ComponentStyleConfig;
  cascader?: CascaderConfig;
  checkbox?: CheckboxConfig;
  collapse?: CollapseConfig;
  colorPicker?: ColorPickerConfig;
  componentDisabled?: boolean;
  componentSize?: SizeType;
  csp?: CSPConfig;
  datePicker?: DatePickerConfig;
  descriptions?: DescriptionsConfig;
  /**
   * @descCN 设置布局展示方向。
   * @descEN Set direction of layout.
   * @default ltr
   */
  direction?: DirectionType;
  divider?: DividerConfig;
  drawer?: DrawerConfig;
  dropdown?: DropdownConfig;
  empty?: EmptyConfig;
  flex?: FlexConfig;
  floatButton?: FloatButtonConfig;
  floatButtonGroup?: FloatButtonGroupConfig;
  form?: FormConfig;
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  getTargetContainer?: () => HTMLElement | Window;
  iconPrefixCls?: string;
  image?: ImageConfig;
  input?: InputConfig;
  inputNumber?: InputNumberConfig;
  inputSearch?: InputSearchConfig;
  layout?: ComponentStyleConfig;
  /**
   * @descCN 语言包配置，语言包可到 `antd/locale` 目录下寻找。
   * @descEN Language package setting, you can find the packages in `antd/locale`.
   */
  locale?: Locale;
  masonry?: MasonryConfig;
  mentions?: MentionsConfig;
  menu?: MenuConfig;
  message?: ComponentStyleConfig;
  // list?: ListConfig;
  modal?: ModalConfig;
  notification?: NotificationConfig;
  otp?: OTPConfig;
  pagination?: PaginationConfig;
  popconfirm?: PopconfirmConfig;
  popover?: PopoverConfig;
  popupMatchSelectWidth?: boolean;
  popupOverflow?: PopupOverflow;
  prefixCls?: string;
  progress?: ProgressConfig;
  radio?: RadioConfig;
  rangePicker?: RangePickerConfig;
  rate?: ComponentStyleConfig;
  renderEmpty?: RenderEmptyHandler;
  result?: ResultConfig;
  segmented?: SegmentedConfig;
  select?: SelectConfig;
  skeleton?: SkeletonConfig;
  slider?: SliderConfig;
  space?: SpaceConfig;
  spin?: SpinConfig;
  splitter?: SplitterConfig;
  statistic?: StatisticConfig;
  steps?: StepsConfig;
  switch?: SwitchStyleConfig;
  tabs?: TabsConfig;
  tag?: TagConfig;
  textArea?: TextAreaConfig;
  theme?: ThemeConfig;
  timeline?: TimelineConfig;
  timePicker?: TimePickerConfig;
  tooltip?: TooltipConfig;
  tour?: TourConfig;
  transfer?: TransferConfig;
  tree?: TreeConfig;
  treeSelect?: TreeSelectConfig;
  typography?: TypographyConfig;
  upload?: UploadConfig;
  variant?: Variant;
  /**
   * @descCN 设置 `false` 时关闭虚拟滚动。
   * @descEN Close the virtual scrolling when setting `false`.
   * @default true
   */
  virtual?: boolean;
  warning?: WarningContextProps;
  // /**
  //  * Wave is special component which only patch on the effect of component interaction.
  //  */
  wave?: WaveConfig;
}

export interface ConfigProviderSlots {
  [key: string]: any;
  renderEmpty?: (componentName?: string) => any;
}

export interface ConfigProviderEmits {
  [key: string]: any;
}
