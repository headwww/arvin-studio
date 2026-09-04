import type { App, CSSProperties, SlotsType } from 'vue';

import type { ImageProps as VcImageProps } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { MaskType } from '../_util/hooks/useMergedMask';
import type { PreviewGroupProps } from './PreviewGroup';

import { computed, defineComponent, ref } from 'vue';

import { ExportImage as VcImage } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useMergedPreviewConfig from './hooks/useMergedPreviewConfig';
import usePreviewConfig from './hooks/usePreviewConfig';
import PreviewGroup, { icons } from './PreviewGroup';
import useStyle from './style';

type OriginPreviewConfig = NonNullable<
  Exclude<VcImageProps['preview'], boolean>
>;

export interface DeprecatedPreviewConfig {
  /**
   * @deprecated This has been removed.
   * Preview will always be rendered after show.
   */
  destroyOnClose?: boolean;
  /**
   * @deprecated This has been removed.
   * Preview will always be rendered after show.
   */
  forceRender?: boolean;
  /** @deprecated Use `classNames.root` instead */
  rootClass?: string;
  /** @deprecated Use `actionsRender` instead */
  toolbarRender?: OriginPreviewConfig['actionsRender'];
  /** @deprecated Use `open` instead */
  visible?: boolean;
}

export type ImageSemanticName = keyof ImageSemanticClassNames &
  keyof ImageSemanticStyles;

export interface ImageSemanticClassNames {
  cover?: string;
  image?: string;
  root?: string;
}

export interface ImageSemanticStyles {
  cover?: CSSProperties;
  image?: CSSProperties;
  root?: CSSProperties;
}

export type ImagePopupSemanticName = keyof ImagePopupSemanticClassNames &
  keyof ImagePopupSemanticStyles;

export interface ImagePopupSemanticClassNames {
  actions?: string;
  body?: string;
  /**
   * Close-button class names.
   * Matches `@v-c/image` Preview's `classNames.close`, which is what the
   * VcPreviewGroup forwards through.
   */
  close?: string;
  footer?: string;
  mask?: string;
  root?: string;
}

export interface ImagePopupSemanticStyles {
  actions?: CSSProperties;
  body?: CSSProperties;
  close?: CSSProperties;
  footer?: CSSProperties;
  mask?: CSSProperties;
  root?: CSSProperties;
}

export type ImageClassNamesType = SemanticClassNamesType<
  ImageProps,
  ImageSemanticClassNames,
  { popup?: ImagePopupSemanticClassNames }
>;

export type ImageStylesType = SemanticStylesType<
  ImageProps,
  ImageSemanticStyles,
  { popup?: ImagePopupSemanticStyles }
>;
export type PreviewConfig = OriginPreviewConfig &
  DeprecatedPreviewConfig & {
    mask?: MaskType | VueNode;
    /** @deprecated Use `classNames.cover` instead */
    maskClassName?: string;
    /** @deprecated Use `onOpenChange` instead */
    onVisibleChange?: (visible: boolean, prevVisible: boolean) => void;
  };
export interface ImageProps /* @vue-ignore */
  extends
    ImageEmitsProps,
    Omit<
      VcImageProps,
      | 'classNames'
      | 'onClick'
      | 'onError'
      | 'preview'
      | 'rootClassName'
      | 'styles'
    > {
  classes?: ImageClassNamesType;
  preview?: boolean | PreviewConfig;
  rootClass?: string;
  styles?: ImageStylesType;
  /** @deprecated Use `styles.root` instead */
  wrapperStyle?: CSSProperties;
}

export interface ImageEmits {
  click: NonNullable<VcImageProps['onClick']>;
  error: NonNullable<VcImageProps['onError']>;
}
export interface ImageEmitsProps {
  onClick?: ImageEmits['click'];
  onError?: ImageEmits['error'];
}

export interface ImageSlots {
  actionsRender: () => OriginPreviewConfig['actionsRender'];
  cover: () => any;
  fallback: () => any;
  imageRender: () => any;
  placeholder: () => any;
}
const Image = defineComponent<
  ImageProps,
  ImageEmits,
  string,
  SlotsType<ImageSlots>
>(
  (props, { slots, emit, attrs }) => {
    const { preview, classes, styles } = toPropsRefs(
      props,
      'preview',
      'classes',
      'styles',
    );
    // =============================== MISC ===============================
    // Context
    const {
      getPopupContainer: getContextPopupContainer,
      class: contextClassName,
      style: contextStyle,
      preview: contextPreview,
      styles: contextStyles,
      classes: contextClassNames,
      fallback: contextFallback,
      prefixCls,
    } = useComponentBaseConfig('image', props, ['preview', 'fallback']);

    // ============================= Warning ==============================
    if (isDev) {
      const warning = devUseWarning('Image');
      warning.deprecated(!props.wrapperStyle, 'wrapperStyle', 'styles.root');
    }

    // ============================== Styles ==============================
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const mergedRootClassName = computed(() =>
      clsx(props.rootClass, hashId.value, cssVarCls.value, rootCls.value),
    );

    // ============================= Preview ==============================
    const usePreviewConfig_ = usePreviewConfig(preview);
    const useContextPreviewConfig_ = usePreviewConfig(contextPreview);
    const previewConfig = computed(() => usePreviewConfig_.value[0]);
    const previewMaskClassName = computed(() => usePreviewConfig_.value[2]);
    const previewRootClassName = computed(() => usePreviewConfig_.value[1]);
    const contextPreviewConfig = computed(
      () => useContextPreviewConfig_.value[0],
    );
    const contextPreviewMaskClassName = computed(
      () => useContextPreviewConfig_.value[2],
    );
    const contextPreviewRootClassName = computed(
      () => useContextPreviewConfig_.value[1],
    );

    const mergedPreviewConfig = useMergedPreviewConfig(
      // Preview config
      previewConfig as any,
      contextPreviewConfig as any,

      // MISC
      prefixCls,
      mergedRootClassName,
      getContextPopupContainer,
      computed(() => icons),

      ref(true),
    );

    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => {
      return {
        ...props,
        preview: mergedPreviewConfig.value,
      } as ImageProps;
    });
    // ============================= Semantic =============================
    const mergedLegacyClassNames = computed(() => {
      return {
        cover: clsx(
          contextPreviewMaskClassName.value,
          previewMaskClassName.value,
        ),
        popup: {
          root: clsx(
            contextPreviewRootClassName.value,
            previewRootClassName.value,
          ),
        },
      };
    });

    const mergedMask = computed(() => mergedPreviewConfig?.value?.mask);
    const blurClassName = computed(
      () => mergedPreviewConfig?.value?.blurClassName,
    );
    const mergedPopupClassNames = computed(() => {
      return {
        mask: clsx(
          {
            [`${prefixCls.value}-preview-mask-hidden`]: !mergedMask.value,
          },
          blurClassName.value,
        ),
      };
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      ImageClassNamesType,
      ImageStylesType,
      ImageProps
    >(
      useToArr(
        contextClassNames,
        classes,
        mergedLegacyClassNames,
        computed(() => ({ popup: mergedPopupClassNames.value })),
      ),
      useToArr(
        contextStyles,
        computed(() => ({ root: props.wrapperStyle })),
        styles,
      ),
      useToProps(mergedProps),
      computed(() => {
        return {
          popup: { _default: 'root' },
        };
      }),
    );
    return () => {
      const mergedFallback =
        getSlotPropsFnRun(slots, props, 'fallback') ?? contextFallback.value;
      const placeholder = getSlotPropsFnRun(slots, props, 'placeholder', false);
      const { style, className, restAttrs } = getAttrStyleAndClass(attrs);
      const mergedClassName = clsx(
        className,
        hashId.value,
        contextClassName.value,
      );

      const mergedStyle = {
        ...contextStyle.value,
        ...style,
      };
      const otherProps = omit(props, [
        'prefixCls',
        'preview',
        'styles',
        'classes',
        'rootClass',
        'wrapperStyle',
        'fallback',
      ]);

      const onEvents = {
        onError: (e: Event) => {
          emit('error', e);
        },
        onClick: (e: Event) => {
          emit('click', e as MouseEvent);
        },
      } as Pick<VcImageProps, 'onClick' | 'onError'>;
      if (slots?.imageRender) {
        mergedPreviewConfig.value.imageRender = slots.imageRender;
      }
      if (
        slots?.cover &&
        (mergedPreviewConfig.value?.mask ||
          typeof mergedPreviewConfig.value?.mask === 'boolean')
      ) {
        mergedPreviewConfig.value.cover = slots.cover();
      }
      // ============================== Render ==============================
      return (
        <VcImage
          {...restAttrs}
          class={mergedClassName}
          fallback={mergedFallback}
          prefixCls={prefixCls.value}
          preview={(mergedPreviewConfig.value || false) as any}
          rootClassName={mergedRootClassName.value}
          style={mergedStyle}
          {...omit(otherProps, ['placeholder'])}
          {...onEvents}
          classNames={mergedClassNames.value}
          placeholder={placeholder}
          styles={mergedStyles.value}
        />
      );
    };
  },
  {
    name: 'AsImage',
    inheritAttrs: false,
  },
);

(Image as any).install = (app: App) => {
  app.component(Image.name, Image);
  app.component(PreviewGroup.name, PreviewGroup);
};

(Image as any).PreviewGroup = PreviewGroup;

export default Image as typeof Image & {
  PreviewGroup: typeof PreviewGroup;
};

export const ImagePreviewGroup = PreviewGroup;

export type ImagePreviewGroupProps = PreviewGroupProps;
