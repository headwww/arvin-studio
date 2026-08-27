import type { CSSProperties } from 'vue';

import type { VueNode } from '../_util';
import type { AlertProps } from '../alert';
import type { AnchorProps } from '../anchor';
import type { BadgeProps } from '../badge';
import type { RibbonProps } from '../badge/Ribbon';
import type { ButtonProps } from '../button';
import type { CheckboxProps } from '../checkbox';
import type { CollapseProps } from '../collapse';
import type { OTPProps, SearchProps, TextAreaProps } from '../input';
import type { InputNumberProps } from '../input-number';
import type { InputProps } from '../input/Input';
import type { PopconfirmProps } from '../popconfirm';
import type { PopoverProps } from '../popover';
import type { RadioProps } from '../radio';
import type { SpaceProps } from '../space';
import type { SwitchProps } from '../switch';
import type {
  AliasToken,
  MappingAlgorithm,
  OverrideToken,
} from '../theme/interface';
import type { TooltipProps } from '../tooltip';

export interface ComponentStyleConfig {
  class?: string;
  classes?: unknown;
  style?: CSSProperties;
  styles?: unknown;
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
   * @descCN 是否开启 `hashed` 属性。如果你的应用中只存在一个版本的 as，你可以设置为 `false` 来进一步减小样式体积。
   * @descEN Whether to enable the `hashed` attribute. If there is only one version of as in your application, you can set `false` to reduce the bundle size.
   * @default true
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
   * @example
   * ```tsx
   * import { ConfigProvider } from 'as';
   * import 'asv-next/dist/as.css';
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

export type ButtonConfig = ComponentStyleConfig &
  Pick<
    ButtonProps,
    'autoInsertSpace' | 'classes' | 'color' | 'shape' | 'styles' | 'variant'
  > & {
    loadingIcon?: VueNode;
  };

export type SpaceConfig = ComponentStyleConfig &
  Pick<SpaceProps, 'classes' | 'size' | 'styles'>;

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

export type InputSearchConfig = ComponentStyleConfig &
  Pick<SearchProps, 'classes' | 'searchIcon' | 'styles'>;

export type OTPConfig = ComponentStyleConfig &
  Pick<OTPProps, 'classes' | 'styles' | 'variant'>;

export type TextAreaConfig = ComponentStyleConfig &
  Pick<
    TextAreaProps,
    'allowClear' | 'changeOnComposing' | 'classes' | 'styles' | 'variant'
  >;

export type InputNumberConfig = ComponentStyleConfig &
  Pick<InputNumberProps, 'classes' | 'styles' | 'variant'>;

export type CheckboxConfig = ComponentStyleConfig &
  Pick<CheckboxProps, 'classes' | 'styles'>;

export type RadioConfig = ComponentStyleConfig &
  Pick<RadioProps, 'classes' | 'styles'>;
export type SwitchStyleConfig = ComponentStyleConfig &
  Pick<SwitchProps, 'classes' | 'styles'>;

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

export type AnchorStyleConfig = ComponentStyleConfig &
  Pick<AnchorProps, 'classes' | 'styles'>;

export type BadgeConfig = ComponentStyleConfig &
  Pick<BadgeProps, 'classes' | 'styles'>;

export type RibbonConfig = ComponentStyleConfig &
  Pick<RibbonProps, 'classes' | 'styles'>;

export type CollapseConfig = ComponentStyleConfig &
  Pick<CollapseProps, 'expandIcon'>;

export interface ComponentStyleConfig {
  class?: string;
  classes?: unknown;
  style?: CSSProperties;
  styles?: unknown;
}
export interface ConfigComponentProps {
  alert?: AlertConfig;
  anchor?: AnchorStyleConfig;
  avatar?: ComponentStyleConfig;
  badge?: BadgeConfig;
  button?: ButtonConfig;
  carousel?: ComponentStyleConfig;
  checkbox?: CheckboxConfig;
  collapse?: CollapseConfig;
  input?: InputConfig;
  inputNumber?: InputNumberConfig;
  inputSearch?: InputSearchConfig;
  otp?: OTPConfig;
  popconfirm?: PopconfirmConfig;
  popover?: PopoverConfig;
  radio?: RadioConfig;
  ribbon?: RibbonConfig;
  space?: SpaceConfig;
  switch?: SwitchStyleConfig;
  textArea?: TextAreaConfig;
  theme?: ThemeConfig;
  tooltip?: TooltipConfig;
}
