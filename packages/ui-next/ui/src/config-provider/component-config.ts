import type { CSSProperties } from 'vue';

import type { VueNode } from '../_util';
import type { ButtonProps } from '../button';
import type { InputProps } from '../input/Input';
import type { SpaceProps } from '../space';
import type {
  AliasToken,
  MappingAlgorithm,
  OverrideToken,
} from '../theme/interface';

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
   * @descCN 是否开启 `hashed` 属性。如果你的应用中只存在一个版本的 as，你可以设置为 `false` 来进一步减小样式体积。
   * @descEN Whether to enable the `hashed` attribute. If there is only one version of as in your application, you can set `false` to reduce the bundle size.
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

export interface ConfigComponentProps {
  button?: ButtonConfig;
  input?: InputConfig;
  space?: SpaceConfig;
  theme?: ThemeConfig;
}
