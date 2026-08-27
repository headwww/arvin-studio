import type { App, CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit, VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context.ts';

import { computed, defineComponent } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import {
  pureAttrs,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import {
  useComponentBaseConfig,
  useComponentConfig,
} from '../config-provider/context';
import useLocale from '../locale/useLocale';
import DefaultEmptyImg from './empty';
import SimpleEmptyImg from './simple';
import useStyle from './style';

export interface TransferLocale {
  description: string;
}

const defaultEmptyImg = <DefaultEmptyImg />;
const simpleEmptyImg = <SimpleEmptyImg />;

export type EmptySemanticName = keyof EmptySemanticClassNames &
  keyof EmptySemanticStyles;

export interface EmptySemanticClassNames {
  description?: string;
  footer?: string;
  image?: string;
  root?: string;
}

export interface EmptySemanticStyles {
  description?: CSSProperties;
  footer?: CSSProperties;
  image?: CSSProperties;
  root?: CSSProperties;
}

export type EmptyClassNamesType = SemanticClassNamesType<
  EmptyProps,
  EmptySemanticClassNames
>;

export type EmptyStylesType = SemanticStylesType<
  EmptyProps,
  EmptySemanticStyles
>;

// For backward compatibility
export type SemanticName = EmptySemanticName;

export interface EmptyProps extends ComponentBaseProps {
  classes?: EmptyClassNamesType;
  description?: VueNode;
  image?: VueNode;
  styles?: EmptyStylesType;
}

export interface EmptySlots {
  default: () => any;
  description: () => any;
  image: () => any;
}

const defaultProps = {
  image: undefined,
  description: undefined,
};

const Empty = defineComponent<
  EmptyProps,
  EmptyEmit,
  string,
  SlotsType<EmptySlots>
>(
  (props = defaultProps, { slots, attrs }) => {
    const componentConfig = useComponentConfig('empty');
    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('empty', props);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      EmptyClassNamesType,
      EmptyStylesType,
      EmptyProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(computed(() => props)),
    );

    const [locale] = useLocale('Empty');
    return () => {
      const description = getSlotPropsFnRun(slots, props, 'description');
      const des = description ?? locale?.value?.description;
      const alt = typeof des === 'string' ? des : 'empty';
      const mergedImage =
        getSlotPropsFnRun(slots, props, 'image') ??
        componentConfig.value?.image ??
        defaultEmptyImg;
      // eslint-disable-next-line no-useless-assignment
      let imageNode: any = null;
      imageNode =
        typeof mergedImage === 'string' ? (
          <img alt={alt} draggable={false} src={mergedImage} />
        ) : (
          mergedImage
        );
      const children = filterEmpty(slots?.default?.() ?? []);
      return (
        <div
          class={clsx(
            hashId.value,
            cssVarCls.value,
            prefixCls.value,
            contextClassName.value,
            {
              [`${prefixCls.value}-normal`]: mergedImage === simpleEmptyImg,
              [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
            },
            props.rootClass,
            mergedClassNames.value.root,
            (attrs as any).class,
          )}
          style={[mergedStyles.value.root, (attrs as any).style]}
          {...pureAttrs(attrs)}
        >
          <div
            class={clsx(
              `${prefixCls.value}-image`,
              mergedClassNames.value.image,
            )}
            style={mergedStyles.value.image}
          >
            {imageNode}
          </div>
          {des && (
            <div
              class={clsx(
                `${prefixCls.value}-description`,
                mergedClassNames.value.description,
              )}
              style={mergedStyles.value.description}
            >
              {des}
            </div>
          )}
          {children.length > 0 && (
            <div
              class={clsx(
                `${prefixCls.value}-footer`,
                mergedClassNames.value.footer,
              )}
              style={mergedStyles.value.footer}
            >
              {children}
            </div>
          )}
        </div>
      );
    };
  },
  {
    name: 'AsEmpty',
  },
);

(Empty as any).PRESENTED_IMAGE_DEFAULT = defaultEmptyImg;
(Empty as any).PRESENTED_IMAGE_SIMPLE = simpleEmptyImg;

(Empty as any).install = (app: App) => {
  app.component(Empty.name, Empty);
};

export default Empty as typeof Empty & {
  PRESENTED_IMAGE_DEFAULT: typeof defaultEmptyImg;
  PRESENTED_IMAGE_SIMPLE: typeof simpleEmptyImg;
};
