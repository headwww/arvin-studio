import type { CSSProperties, InjectionKey, Ref } from 'vue';

import type { DerivativeFunc } from '@arvin-studio/cssinjs';

import type { VueNode } from '../_util';
import type { MaskType } from '../_util/hooks/useMergedMask';
import type { WarningContextProps } from '../_util/warning.ts';
import type { ShowWaveEffect } from '../_util/wave/interface.ts';
import type { AlertProps } from '../alert';
import type { AnchorProps } from '../anchor';
import type { BadgeProps } from '../badge';
import type { RibbonProps } from '../badge/Ribbon.tsx';
import type { BreadcrumbProps } from '../breadcrumb/Breadcrumb.tsx';
import type { ButtonProps } from '../button';
import type { CalendarProps } from '../calendar';
import type { CardProps } from '../card/Card.tsx';
import type { CardMetaProps } from '../card/CardMeta.tsx';
import type { CascaderProps } from '../cascader';
import type { CheckboxProps } from '../checkbox';
import type { CollapseProps } from '../collapse';
import type { ColorPickerProps } from '../color-picker';
import type { DatePickerProps, RangePickerProps } from '../date-picker';
import type { DescriptionsProps } from '../descriptions';
import type { DividerProps } from '../divider';
import type { DrawerProps } from '../drawer';
import type { DropdownProps } from '../dropdown';
import type { EmptyProps } from '../empty';
import type { FlexProps } from '../flex';
import type { FloatButtonGroupProps, FloatButtonProps } from '../float-button';
import type { FormProps } from '../form/Form.tsx';
import type { ImageProps } from '../image/index.tsx';
import type { InputNumberProps } from '../input-number';
import type { InputProps } from '../input/Input.tsx';
import type { OTPProps } from '../input/OTP';
import type { SearchProps } from '../input/Search.tsx';
import type { TextAreaProps } from '../input/TextArea.tsx';
import type { Locale } from '../locale';
import type { MasonryProps } from '../masonry/Masonry.tsx';
import type { MenuProps } from '../menu';
import type { ModalProps } from '../modal/interface.ts';
import type { ArgsProps as NotificationProps } from '../notification';
import type { PaginationProps } from '../pagination/interface.ts';
import type { PopconfirmProps } from '../popconfirm';
import type { PopoverProps } from '../popover';
import type { ProgressProps } from '../progress';
import type { QRCodeProps } from '../qrcode';
import type { RadioProps } from '../radio/interface.ts';
import type { ResultProps } from '../result';
import type { SegmentedProps } from '../segmented';
import type { SelectProps } from '../select';
import type { SkeletonProps } from '../skeleton';
import type { SliderProps } from '../slider';
import type { SpaceProps } from '../space';
import type { SpinProps } from '../spin';
import type { SplitterProps } from '../splitter';
import type { StatisticProps } from '../statistic';
import type { StepsProps } from '../steps';
import type { SwitchProps } from '../switch';
import type { TabsProps } from '../tabs';
import type { TagProps } from '../tag';
import type {
  AliasToken,
  MapToken,
  OverrideToken,
  SeedToken,
} from '../theme/interface';
import type { TimePickerProps } from '../time-picker';
import type { TimelineProps } from '../timeline';
import type { TooltipProps } from '../tooltip';
import type { TourProps } from '../tour';
import type { TransferProps } from '../transfer/interface';
import type { TreeSelectProps } from '../tree-select';
import type { TreeProps } from '../tree/Tree.tsx';
import type { BlockProps as TypographyBaseProps } from '../typography/interface';
import type { UploadProps } from '../upload/interface.ts';
import type { RenderEmptyHandler } from './default-render-empty';

import { computed, inject, provide, ref } from 'vue';

export const defaultPrefixCls = 'ant';
export const defaultIconPrefixCls = 'anticon';
const EMPTY_OBJECT = {};

type GetClassNamesOrEmptyObject<Config extends { classes?: any }> =
  Config extends {
    classes?: infer ClassNames;
  }
    ? ClassNames
    : object;

type GetStylesOrEmptyObject<Config extends { styles?: any }> = Config extends {
  styles?: infer Styles;
}
  ? Styles
  : object;

type ComponentReturnType<T extends keyof ConfigComponentProps> = Omit<
  NonNullable<ConfigComponentProps[T]>,
  'classes' | 'styles'
> & {
  classes: GetClassNamesOrEmptyObject<NonNullable<ConfigComponentProps[T]>>;
  direction: ConfigConsumerProps['direction'];
  getPopupContainer: ConfigConsumerProps['getPopupContainer'];
  getPrefixCls: ConfigConsumerProps['getPrefixCls'];
  styles: GetStylesOrEmptyObject<NonNullable<ConfigComponentProps[T]>>;
};
export interface Theme {
  errorColor?: string;
  infoColor?: string;
  primaryColor?: string;
  processingColor?: string;
  successColor?: string;
  warningColor?: string;
}

export interface CSPConfig {
  nonce?: string;
}

export type DirectionType = 'ltr' | 'rtl' | undefined;

export type MappingAlgorithm = DerivativeFunc<SeedToken, MapToken>;

export interface ComponentBaseProps {
  prefixCls?: string;
  rootClass?: string;
}

type ComponentsConfig = {
  [key in keyof OverrideToken]?: OverrideToken[key] & {
    algorithm?: boolean | MappingAlgorithm | MappingAlgorithm[];
  };
};

export interface ThemeConfig {
  /**
   * @descCN 用于修改 Seed Token 到 Map Token 的算法。
   * @descEN Modify the algorithms of theme.
   * @default defaultAlgorithm
   */
  algorithm?: MappingAlgorithm | MappingAlgorithm[];
  /**
   * @descCN 用于修改各个组件的 Component Token 以及覆盖该组件消费的 Alias Token。
   * @descEN Modify Component Token and Alias Token applied to components.
   */
  components?: ComponentsConfig;
  /**
   * @descCN 通过 `cssVar` 配置来开启 CSS 变量模式，这个配置会被继承。
   * @descEN Enable CSS variable mode through `cssVar` configuration, This configuration will be inherited.
   * @default false
   * @since 5.12.0
   */
  /*
   * `true` only (not `boolean`): CSS variables are always on in v6 —
   * `useToken` unconditionally builds the cssVar config, so `false` would
   * silently behave as enabled.
   */
  cssVar?:
    | true
    // eslint-disable-next-line perfectionist/sort-union-types
    | {
        /**
         * @descCN 主题的唯一 key，版本低于 react@18 时需要手动设置。
         * @descEN Unique key for theme, should be set manually < react@18.
         */
        key?: string;
        /**
         * @descCN css 变量的前缀
         * @descEN Prefix for css variable.
         * @default ant
         */
        prefix?: string;
      };
  /**
   * @descCN 是否开启 `hashed` 属性。如果你的应用中只存在一个版本的 antd，你可以设置为 `false` 来进一步减小样式体积。
   * @descEN Whether to enable the `hashed` attribute. If there is only one version of antd in your application, you can set `false` to reduce the bundle size.
   * @default true
   * @since 5.0.0
   */
  hashed?: boolean;
  /**
   * @descCN 是否继承外层 `ConfigProvider` 中配置的主题。
   * @descEN Whether to inherit the theme configured in the outer layer `ConfigProvider`.
   * @default true
   */
  inherit?: boolean;
  /**
   * @descCN 用于修改 Design Token。
   * @descEN Modify Design Token.
   */
  token?: Partial<AliasToken>;
  /**
   * @descCN 开启零运行时模式，不会在运行时产生样式，需要手动引入 CSS 文件。
   * @descEN Enable zero-runtime mode, which will not generate style at runtime, need to import additional CSS file.
   * @default true
   * @since 6.0.0
   * @example
   * ```tsx
   * import { ConfigProvider } from 'antd';
   * import 'antdv-next/dist/antd.css';
   *
   * const Demo = () => (
   *   <ConfigProvider theme={{ zeroRuntime: true }}>
   *     <App />
   *   </ConfigProvider>
   *);
   * ```
   */
  zeroRuntime?: boolean;
}

export interface ComponentStyleConfig {
  class?: string;
  /*
   * `unknown`, NOT `any`: component configs are built as
   * `ComponentStyleConfig & Pick<XxxProps, 'classes' | 'styles'>`, and
   * intersecting a same-named property with `any` collapses it to `any`
   * (`any & T = any`), silently erasing every component's semantic
   * classes/styles config type. `unknown & T = T` keeps them intact.
   */
  classes?: unknown;
  style?: CSSProperties;
  styles?: unknown;
}

export type PopupOverflow = 'scroll' | 'viewport';

export const Variants = [
  'outlined',
  'borderless',
  'filled',
  'underlined',
] as const;

export type Variant = (typeof Variants)[number];

export type TriggerType =
  | 'click'
  | 'mousedown'
  | 'mouseup'
  | 'pointerdown'
  | 'pointerup';

export interface WaveConfig {
  /**
   * @descCN 是否禁用水波纹效果。
   * @descEN Whether to disable wave effect.
   * @default false
   */
  disabled?: boolean;
  /**
   * @descCN 自定义水波纹效果。
   * @descEN Customized wave effect.
   */
  showEffect?: ShowWaveEffect;
  /**
   * @descCN 触发水波纹效果的事件。
   * @descEN The event that triggers the wave effect.
   * @default 'click'
   */
  triggerType?: TriggerType;
}

export type SpaceConfig = ComponentStyleConfig &
  Pick<SpaceProps, 'classes' | 'size' | 'styles'>;

export type ButtonConfig = ComponentStyleConfig &
  Pick<
    ButtonProps,
    'autoInsertSpace' | 'classes' | 'color' | 'shape' | 'styles' | 'variant'
  > & {
    loadingIcon?: VueNode;
  };

export type FlexConfig = ComponentStyleConfig & Pick<FlexProps, 'vertical'>;

export type AlertConfig = ComponentStyleConfig &
  Pick<
    AlertProps,
    'classes' | 'closable' | 'closeIcon' | 'styles' | 'variant'
  > & {
    errorIcon?: VueNode;
    infoIcon?: VueNode;
    successIcon?: VueNode;
    warningIcon?: VueNode;
  };

export type BadgeConfig = ComponentStyleConfig &
  Pick<BadgeProps, 'classes' | 'styles'>;

export type TagConfig = ComponentStyleConfig &
  Pick<TagProps, 'classes' | 'closable' | 'closeIcon' | 'styles' | 'variant'>;

export type EmptyConfig = ComponentStyleConfig &
  Pick<EmptyProps, 'classes' | 'image' | 'styles'>;

export type SpinConfig = ComponentStyleConfig & Pick<SpinProps, 'indicator'>;

export type DescriptionsConfig = ComponentStyleConfig &
  Pick<DescriptionsProps, 'classes' | 'styles'>;

export type CollapseConfig = ComponentStyleConfig &
  Pick<CollapseProps, 'expandIcon'>;

export type QRcodeConfig = ComponentStyleConfig &
  Pick<QRCodeProps, 'classes' | 'styles'>;

export type ResultConfig = ComponentStyleConfig &
  Pick<ResultProps, 'classes' | 'styles'>;

export type AnchorStyleConfig = ComponentStyleConfig &
  Pick<AnchorProps, 'classes' | 'styles'>;

export type PaginationConfig = ComponentStyleConfig &
  Pick<PaginationProps, 'showSizeChanger'>;

export type DividerConfig = ComponentStyleConfig &
  Pick<DividerProps, 'classes' | 'styles'>;

export type SkeletonConfig = ComponentStyleConfig &
  Pick<SkeletonProps, 'classes' | 'styles'>;

export type StatisticConfig = ComponentStyleConfig &
  Pick<StatisticProps, 'classes' | 'styles'>;

export type TypographyConfig = ComponentStyleConfig &
  Pick<TypographyBaseProps, 'classes' | 'styles'>;

export type SplitterConfig = ComponentStyleConfig &
  Pick<SplitterProps, 'classes' | 'styles'>;

export type CalendarConfig = ComponentStyleConfig &
  Pick<CalendarProps<any>, 'classes' | 'styles'>;

export type FloatButtonConfig = ComponentStyleConfig &
  Pick<FloatButtonProps, 'classes' | 'styles'> & {
    backTopIcon?: VueNode;
  };

export type FloatButtonGroupConfig = ComponentStyleConfig &
  Pick<FloatButtonGroupProps, 'classes' | 'styles'> & {
    closeIcon?: VueNode;
  };

export type TooltipConfig = {
  /**
   * @descCN 是否开启 Tooltip 流畅过渡动画
   * @descEN Whether to enable smooth transition for tooltips
   * @default false
   */
  unique?: boolean;
} & ComponentStyleConfig &
  Pick<TooltipProps, 'arrow' | 'classes' | 'styles' | 'trigger'>;

export type PopoverConfig = ComponentStyleConfig &
  Pick<PopoverProps, 'arrow' | 'classes' | 'styles' | 'trigger'>;

export type PopconfirmConfig = ComponentStyleConfig &
  Pick<PopconfirmProps, 'arrow' | 'classes' | 'styles' | 'trigger'>;

export type SegmentedConfig = ComponentStyleConfig &
  Pick<SegmentedProps, 'classes' | 'styles'>;

export type MenuConfig = ComponentStyleConfig &
  Pick<MenuProps, 'classes' | 'expandIcon' | 'styles'>;

export type TourConfig = ComponentStyleConfig &
  Pick<TourProps, 'classes' | 'closeIcon' | 'styles'>;

export type NotificationConfig = ComponentStyleConfig &
  Pick<NotificationProps, 'classes' | 'closeIcon' | 'styles'>;

export type BreadcrumbConfig = ComponentStyleConfig &
  Pick<BreadcrumbProps, 'classes' | 'dropdownIcon' | 'separator' | 'styles'>;

export type MasonryConfig = ComponentStyleConfig &
  Pick<MasonryProps, 'classes' | 'styles'>;

export type FormConfig = ComponentStyleConfig &
  Pick<
    FormProps,
    | 'autoComplete'
    | 'autocomplete'
    | 'classes'
    | 'colon'
    | 'labelAlign'
    | 'labelWrap'
    | 'requiredMark'
    | 'scrollToFirstError'
    | 'styles'
    | 'tooltip'
    | 'validateMessages'
    | 'variant'
  >;
export type RadioConfig = ComponentStyleConfig &
  Pick<RadioProps, 'classes' | 'styles'>;

export type CheckboxConfig = ComponentStyleConfig &
  Pick<CheckboxProps, 'classes' | 'styles'>;

export type SwitchStyleConfig = ComponentStyleConfig &
  Pick<SwitchProps, 'classes' | 'styles'>;

export type TransferConfig = ComponentStyleConfig &
  Pick<TransferProps, 'classes' | 'selectionsIcon' | 'styles'>;

export type InputConfig = ComponentStyleConfig &
  Pick<
    InputProps,
    | 'allowClear'
    | 'autoComplete'
    | 'autocomplete'
    | 'changeOnComposing'
    | 'classes'
    | 'styles'
    | 'variant'
  >;

export type InputNumberConfig = ComponentStyleConfig &
  Pick<InputNumberProps, 'classes' | 'styles' | 'variant'>;

export type TextAreaConfig = ComponentStyleConfig &
  Pick<
    TextAreaProps,
    'allowClear' | 'changeOnComposing' | 'classes' | 'styles' | 'variant'
  >;

export type MentionsConfig = ComponentStyleConfig &
  Pick<TextAreaProps, 'allowClear' | 'classes' | 'styles' | 'variant'>;

export type InputSearchConfig = ComponentStyleConfig &
  Pick<SearchProps, 'classes' | 'searchIcon' | 'styles'>;

export type OTPConfig = ComponentStyleConfig &
  Pick<OTPProps, 'classes' | 'styles' | 'variant'>;

export type SliderConfig = ComponentStyleConfig &
  Pick<SliderProps, 'classes' | 'styles'>;

export type TabsConfig = ComponentStyleConfig &
  Pick<
    TabsProps,
    | 'addIcon'
    | 'classes'
    | 'indicator'
    | 'indicatorSize'
    | 'more'
    | 'moreIcon'
    | 'removeIcon'
    | 'styles'
  >;

export type SelectConfig = ComponentStyleConfig &
  Pick<
    SelectProps,
    | 'allowClear'
    | 'classes'
    | 'removeIcon'
    | 'showSearch'
    | 'styles'
    | 'suffixIcon'
    | 'variant'
  > & {
    clearIcon?: any;
    loadingIcon?: any;
    menuItemSelectedIcon?: any;
  };

export type CascaderConfig = ComponentStyleConfig &
  Pick<
    CascaderProps,
    'classes' | 'expandIcon' | 'loadingIcon' | 'styles' | 'variant'
  > & { clearIcon?: any; removeIcon?: any; searchIcon?: any; suffixIcon?: any };

export type CardMetaConfig = ComponentStyleConfig &
  Pick<CardMetaProps, 'classes' | 'styles'>;

export type CardConfig = ComponentStyleConfig &
  Pick<CardProps, 'classes' | 'styles' | 'variant'>;

export type DrawerConfig = ComponentStyleConfig &
  Pick<
    DrawerProps,
    'classes' | 'closable' | 'closeIcon' | 'mask' | 'styles'
  > & { focusable?: any };

export type ModalConfig = ComponentStyleConfig &
  Pick<
    ModalProps,
    | 'cancelButtonProps'
    | 'centered'
    | 'classes'
    | 'closable'
    | 'closeIcon'
    | 'mask'
    | 'okButtonProps'
    | 'styles'
  > & {
    errorIcon?: any;
    focusable?: any;
    infoIcon?: any;
    successIcon?: any;
    warningIcon?: any;
  };

export type StepsConfig = ComponentStyleConfig &
  Pick<StepsProps, 'classes' | 'styles'>;

export type TimelineConfig = ComponentStyleConfig &
  Pick<TimelineProps, 'classes' | 'styles'>;

export type ImageConfig = ComponentStyleConfig &
  Pick<ImageProps, 'classes' | 'styles'> & {
    fallback?: string;
    preview?: Partial<Record<'closeIcon', any>> &
      Pick<ImageProps, 'classes' | 'styles'> & { mask?: MaskType };
  };

export type TreeConfig = ComponentStyleConfig &
  Pick<TreeProps, 'classes' | 'styles'>;

export type TreeSelectConfig = ComponentStyleConfig &
  Pick<TreeSelectProps, 'classes' | 'styles' | 'switcherIcon' | 'variant'>;

export type UploadConfig = ComponentStyleConfig &
  Pick<
    UploadProps,
    'accept' | 'classes' | 'customRequest' | 'progress' | 'styles'
  >;

export type DatePickerConfig = ComponentStyleConfig &
  Pick<
    DatePickerProps,
    'allowClear' | 'classes' | 'styles' | 'suffixIcon' | 'variant'
  > & { clearIcon?: any };

export type RangePickerConfig = ComponentStyleConfig &
  Pick<
    RangePickerProps,
    'allowClear' | 'classes' | 'separator' | 'styles' | 'suffixIcon' | 'variant'
  > & { clearIcon?: any };

export type TimePickerConfig = ComponentStyleConfig &
  Pick<
    TimePickerProps,
    'allowClear' | 'classes' | 'styles' | 'suffixIcon' | 'variant'
  > & { clearIcon?: any };

export type RibbonConfig = ComponentStyleConfig &
  Pick<RibbonProps, 'classes' | 'styles'>;

export type ColorPickerConfig = ComponentStyleConfig &
  Pick<ColorPickerProps, 'arrow' | 'classes' | 'styles'>;

export type DropdownConfig = ComponentStyleConfig &
  Pick<DropdownProps, 'classes' | 'styles'>;

export type ProgressConfig = ComponentStyleConfig &
  Pick<ProgressProps, 'classes' | 'styles'>;

export interface ConfigComponentProps {
  alert?: AlertConfig;
  anchor?: AnchorStyleConfig;
  app?: ComponentStyleConfig;
  avatar?: ComponentStyleConfig;
  badge?: BadgeConfig;
  borderBeam?: ComponentStyleConfig;
  breadcrumb?: BreadcrumbConfig;
  button?: ButtonConfig;
  calendar?: CalendarConfig;
  card?: CardConfig;
  cardMeta?: CardMetaConfig;
  carousel?: ComponentStyleConfig;
  cascader?: CascaderConfig;
  checkbox?: CheckboxConfig;
  collapse?: CollapseConfig;
  colorPicker?: ColorPickerConfig;
  datePicker?: DatePickerConfig;
  descriptions?: DescriptionsConfig;
  divider?: DividerConfig;
  drawer?: DrawerConfig;
  dropdown?: DropdownConfig;
  empty?: EmptyConfig;
  flex?: FlexConfig;
  floatButton?: FloatButtonConfig;
  floatButtonGroup?: FloatButtonGroupConfig;
  form?: FormConfig;
  image?: ImageConfig;
  input?: InputConfig;
  inputNumber?: InputNumberConfig;
  inputSearch?: InputSearchConfig;
  layout?: ComponentStyleConfig;
  masonry?: MasonryConfig;
  mentions?: MentionsConfig;
  menu?: MenuConfig;
  message?: ComponentStyleConfig;
  modal?: ModalConfig;
  notification?: NotificationConfig;
  otp?: OTPConfig;
  pagination?: PaginationConfig;
  popconfirm?: PopconfirmConfig;
  popover?: PopoverConfig;
  progress?: ProgressConfig;
  qrcode?: QRcodeConfig;
  radio?: RadioConfig;
  rangePicker?: RangePickerConfig;
  rate?: ComponentStyleConfig;
  result?: ResultConfig;
  ribbon?: RibbonConfig;
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
  timeline?: TimelineConfig;
  timePicker?: TimePickerConfig;
  tooltip?: TooltipConfig;
  tour?: TourConfig;
  transfer?: TransferConfig;
  tree?: TreeConfig;
  treeSelect?: TreeSelectConfig;
  typography?: TypographyConfig;
  upload?: UploadConfig;
  wave?: WaveConfig;
}

export interface ConfigConsumerProps extends ConfigComponentProps {
  csp?: CSPConfig;
  direction?: DirectionType;
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => string;
  getTargetContainer?: () => HTMLElement;
  iconPrefixCls: string;
  locale?: Locale;
  popupMatchSelectWidth?: boolean;
  popupOverflow?: PopupOverflow;
  renderEmpty?: RenderEmptyHandler;
  rootPrefixCls?: string;
  theme?: ThemeConfig;
  variant?: Variant;
  virtual?: boolean;
  warning?: WarningContextProps;
  wave?: WaveConfig;
}

const ConfigConsumerKey: InjectionKey<Ref<ConfigConsumerProps>> = Symbol(
  'ConfigConsumerContext',
);

export function useConfigProvider(props: Ref<ConfigConsumerProps>) {
  provide(ConfigConsumerKey, props);
}

function defaultGetPrefixCls(suffixCls?: string, customizePrefixCls?: string) {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }
  return suffixCls ? `${defaultPrefixCls}-${suffixCls}` : defaultPrefixCls;
}

export function useConfig() {
  return inject(
    ConfigConsumerKey,
    ref({
      // We provide a default function for Context without provider
      getPrefixCls: defaultGetPrefixCls,
      iconPrefixCls: defaultIconPrefixCls,
    }) as Ref<ConfigConsumerProps>,
  );
}

/**
 * Utility type to convert ConfigConsumerProps to a reactive refs structure.
 * Functions remain as-is, other values are wrapped in Ref.
 */
export type ConfigRefs<R extends ConfigConsumerProps = ConfigConsumerProps> = {
  [K in keyof R]?: R[K] extends (...args: any[]) => any
    ? R[K]
    : R[K] extends object | undefined
      ? Ref<R[K]>
      : Ref<R[K]>;
};

export function useBaseConfig<K extends string>(
  suffixCls?: K,
  props?: ComponentBaseProps,
) {
  const config = useConfig();
  return {
    result: computed(() => config.value?.result),
    modal: computed(() => config.value?.modal),
    timeline: computed(() => config.value?.timeline),
    notification: computed(() => config.value?.notification),
    getPrefixCls: (suffixCls?: string, prefixCls?: string) =>
      config.value?.getPrefixCls(suffixCls, prefixCls),
    prefixCls: computed(() => {
      return config.value?.getPrefixCls(suffixCls, props?.prefixCls);
    }),
    direction: computed(() => {
      return config.value?.direction;
    }),
    getPopupContainer: config?.value.getPopupContainer,
  };
}

/**
 * Get ConfigProvider configured component props.
 * This help to reduce bundle size for saving `?.` operator.
 * Do not use as `useMemo` deps since we do not cache the object here.
 *
 * NOTE: not refactor this with `useMemo` since memo will cost another memory space,
 * which will waste both compare calculation & memory.
 */
export function useComponentConfig<T extends keyof ConfigComponentProps>(
  propName: T,
) {
  const context = useConfig();
  return computed(() => {
    const { getPrefixCls, direction, getPopupContainer } = context.value;
    const propValue: ConfigConsumerProps[T] = context.value[propName];

    return {
      classes: EMPTY_OBJECT,
      styles: EMPTY_OBJECT,
      ...propValue,
      getPrefixCls,
      direction,
      getPopupContainer,
    } as ComponentReturnType<T>;
  });
}

/**
 * 组件入口的标准 hook，一行调用拿到该组件需要的所有配置。
 *
 * @param propName  组件名，对应 ConfigComponentProps 的 key，如 'button'
 * @param props     组件自身的 props，用于 prefixCls 个性化覆盖
 * @param keys      额外确保兜底的字段名列表
 * @param suffixCls 拼接 prefixCls 的后缀，如 'btn' → 'ant-btn'
 *
 * 返回值 = 组件专属配置（拆分为独立 computed refs）+ 通用上下文字段（direction、prefixCls、getPopupContainer 等）。
 */
export function useComponentBaseConfig<
  T extends keyof ConfigComponentProps,
  K extends keyof NonNullable<ConfigComponentProps[T]> = keyof NonNullable<
    ConfigComponentProps[T]
  >,
>(
  propName: T,
  props?: ComponentBaseProps,
  keys?: readonly K[],
  suffixCls?: string,
) {
  const context = useConfig();

  // 从 context 中取出当前组件的专属配置（如 context.value.button）
  const propValue = computed(() => {
    // 通过 `any` 索引：ConfigComponentProps 的联合类型太复杂，直接索引会触发 TS2590
    return (context.value as any)[propName] as ConfigComponentProps[T] & {
      classes?: any;
      styles?: any;
    };
  });

  // 将配置对象拆分为独立的 computed refs，避免组件因无关字段变更而重渲染
  const toRefs = <TValue>(propValues: Ref<TValue>) => {
    const result: any = {
      classes: computed(
        () => (propValues.value as any)?.classes ?? EMPTY_OBJECT,
      ),
      styles: computed(() => (propValues.value as any)?.styles ?? EMPTY_OBJECT),
      class: computed(() => (propValues.value as any)?.class),
      style: computed(() => (propValues.value as any)?.style),
    };

    // 遍历配置对象，其余字段逐一转为独立的 computed
    const __keys = Object.keys(result);
    for (const key in propValues.value) {
      if (!__keys.includes(key)) {
        result[key] = computed(() => propValues.value[key]);
      }
    }

    // 确保 keys 中指定的字段一定存在（兜底 undefined）
    if (keys && keys.length > 0) {
      keys.forEach((key) => {
        if (!result[key]) {
          result[key] = computed(() => propValues.value?.[key]);
        }
      });
    }

    return result as { [Key in keyof TValue]-?: Ref<TValue[Key]> };
  };

  const refsData = toRefs(propValue);

  // 组装最终返回值：组件专属配置 + 通用上下文
  return {
    ...refsData,
    direction: computed(() => context.value.direction),
    prefixCls: computed(() => {
      return context.value?.getPrefixCls(
        suffixCls ?? propName,
        props?.prefixCls,
      );
    }),
    rootPrefixCls: computed(() => context.value?.getPrefixCls()),
    getPopupContainer: context.value.getPopupContainer,
    getPrefixCls: context.value.getPrefixCls,
    getTargetContainer: context.value.getTargetContainer,
    virtual: computed(() => context.value.virtual),
    renderEmpty: computed(() => context.value.renderEmpty),
    popupMatchSelectWidth: computed(() => context.value.popupMatchSelectWidth),
    popupOverflow: computed(() => context.value.popupOverflow),
  };
}
