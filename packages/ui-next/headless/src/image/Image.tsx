import type { CSSProperties } from 'vue';

import type { VueNode } from '../util';
import type { TransformType } from './hooks/useImageTransform';
import type { ImageElementProps } from './interface';
import type {
  InternalPreviewConfig,
  PreviewSemanticName,
  ToolbarRenderInfoType,
} from './Preview';

import { computed, defineComponent, shallowRef } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import { getAttrStyleAndClass, getStylePxValue, pickAttrs } from '../util';
import useMergedState from '../util/hooks/useMergedState';
import { COMMON_PROPS } from './common';
import { usePreviewGroupContext } from './context';
import useRegisterImage from './hooks/useRegisterImage';
import useStatus from './hooks/useStatus';
import Preview from './Preview/index';

export interface ImgInfo {
  alt: string;
  height: number | string;
  url: string;
  width: number | string;
}

export interface CoverConfig {
  coverNode?: VueNode;
  placement?: 'bottom' | 'center' | 'top';
}

export interface PreviewConfig extends Omit<
  InternalPreviewConfig,
  'countRender'
> {
  // Similar to InternalPreviewConfig but not have `current` and `total`
  actionsRender?: (
    originalNode: VueNode,
    info: Omit<ToolbarRenderInfoType, 'current' | 'total'>,
  ) => VueNode;

  cover?: CoverConfig | false | VueNode;

  // Similar to InternalPreviewConfig but not have `current`
  imageRender?: (
    originalNode: VueNode,
    info: { image: ImgInfo; transform: TransformType },
  ) => VueNode;

  onOpenChange?: (open: boolean) => void;
}

export type SemanticName = 'cover' | 'image' | 'root';

export interface ImageProps extends Partial<Omit<ImageElementProps, 'src'>> {
  classNames?: Partial<
    Record<SemanticName, string> & {
      popup?: Partial<Record<PreviewSemanticName, string>>;
    }
  >;
  fallback?: string;

  fetchPriority?: HTMLImageElement['fetchPriority'];
  height?: number | string;
  // Events
  onClick?: (e: MouseEvent) => void;

  onError?: (e: Event) => void;
  onKeydown?: (e: KeyboardEvent) => void;
  placeholder?: boolean | VueNode;

  // Misc
  prefixCls?: string;

  // Preview
  preview?: boolean | PreviewConfig;
  previewPrefixCls?: string;
  // Styles
  rootClassName?: string;

  // Image
  src?: string;
  styles?: Partial<
    Record<SemanticName, CSSProperties> & {
      popup?: Partial<Record<PreviewSemanticName, CSSProperties>>;
    }
  >;
  width?: number | string;
}

const defaults = {
  prefixCls: 'headless-image',
  preview: true,
  classNames: {},
  styles: {},
} as any;

const Image = defineComponent<ImageProps>(
  (props = defaults, { attrs, slots }) => {
    const groupContext = usePreviewGroupContext();

    const prefixCls = computed(() => props.prefixCls ?? 'headless-image');
    const previewPrefixCls = computed(
      () => props.previewPrefixCls ?? `${prefixCls.value}-preview`,
    );

    // ========================== Preview ===========================
    const canPreview = computed(() => !!props.preview);

    const mergedPreviewConfig = computed<PreviewConfig>(() => {
      if (props.preview && typeof props.preview === 'object') {
        return props.preview;
      }
      return {} as any;
    });

    const previewSrc = computed(() => mergedPreviewConfig.value.src);
    const previewOpen = computed(() => mergedPreviewConfig.value.open);

    const cover = computed(() => mergedPreviewConfig.value.cover);

    const previewRootClassName = computed(
      () => mergedPreviewConfig.value.rootClassName,
    );

    // ============================ Open ============================
    const [isShowPreview, setShowPreview] = useMergedState<boolean>(
      !!previewOpen.value,
      {
        value: previewOpen as any,
      },
    );

    const mousePosition = shallowRef<null | { x: number; y: number }>(null);

    const triggerPreviewOpen = (nextOpen: boolean) => {
      setShowPreview(nextOpen);
      mergedPreviewConfig.value.onOpenChange?.(nextOpen);
    };

    const onPreviewClose = () => {
      triggerPreviewOpen(false);
      mousePosition.value = null;
    };

    // ========================= ImageProps =========================
    const isCustomPlaceholder = computed(
      () =>
        !!slots.placeholder ||
        !!(props.placeholder && props.placeholder !== true),
    );

    const src = computed(() => previewSrc.value ?? props.src);
    const [getImgRef, srcAndOnload, status] = useStatus({
      src: computed(() => props.src),
      isCustomPlaceholder,
      fallback: computed(() => props.fallback),
    });

    const imgCommonProps = computed(() => {
      const obj: ImageElementProps = {} as any;
      COMMON_PROPS.forEach((prop) => {
        const fromProps = (props as any)[prop];
        const fromAttrs = (attrs as any)[prop];
        const val = fromProps === undefined ? fromAttrs : fromProps;
        if (val !== undefined) {
          (obj as any)[prop] = val;
        }
      });
      return obj;
    });

    // ========================== Register ==========================
    const registerData = computed<ImageElementProps>(
      () =>
        ({
          ...imgCommonProps.value,
          src: src.value,
        }) as ImageElementProps,
    );

    const imageId = useRegisterImage(canPreview, registerData);

    // ========================== Preview ===========================
    const onPreview = (e: MouseEvent) => {
      const target = (e.currentTarget || e.target) as HTMLElement;
      const rect = target.getBoundingClientRect();
      const left = rect.x + rect.width / 2;
      const top = rect.y + rect.height / 2;

      if (groupContext) {
        groupContext.onPreview(imageId, src.value || '', left, top);
      } else {
        mousePosition.value = { x: left, y: top };
        triggerPreviewOpen(true);
      }

      props.onClick?.(e);
    };

    const onInternalClick = (e: MouseEvent) => {
      props.onClick?.(e);
    };

    const onImgError = (e: Event) => {
      props.onError?.(e);
    };

    // ======================= Keyboard Preview =====================
    const onPreviewKeyDown = (event: KeyboardEvent) => {
      props.onKeydown?.(event);

      if (!canPreview.value) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        const rect = (event.target as HTMLDivElement).getBoundingClientRect();
        const left = rect.x + rect.width / 2;
        const top = rect.y + rect.height / 2;

        if (groupContext) {
          groupContext.onPreview(imageId, src.value || '', left, top);
        } else {
          mousePosition.value = {
            x: left,
            y: top,
          };
          triggerPreviewOpen(true);
        }
      }
    };

    // =========================== Render ===========================
    return () => {
      const { width, height } = props;
      const {
        className,
        style: attrStyle,
        restAttrs,
      } = getAttrStyleAndClass(attrs);
      const rootAttrs = pickAttrs(omit(restAttrs, COMMON_PROPS), false);

      const coverPlacement =
        typeof cover.value === 'object' &&
        cover.value &&
        (cover.value as any).placement
          ? (cover.value as CoverConfig).placement || 'center'
          : 'center';

      const coverNode =
        slots.cover?.() ||
        (typeof cover.value === 'object' &&
        cover.value &&
        (cover.value as any).coverNode
          ? (cover.value as CoverConfig).coverNode
          : (cover.value as VueNode));

      const imgStyle = [
        height ? { height: getStylePxValue(height) } : null,
        props.styles?.image,
        attrStyle,
      ];

      const rootStyle: CSSProperties = {
        width: getStylePxValue(width) as any,
        height: getStylePxValue(height) as any,
        ...props.styles?.root,
      };

      const rootCls = clsx(
        prefixCls.value,
        props.rootClassName,
        props.classNames?.root,
        {
          [`${prefixCls.value}-error`]: status.value === 'error',
        },
      );

      const imgCls = clsx(
        `${prefixCls.value}-img`,
        {
          [`${prefixCls.value}-img-placeholder`]: props.placeholder === true,
        },
        props.classNames?.image,
        className,
      );

      const imageRender = slots.imageRender
        ? (((originNode: VueNode, info: any) =>
            slots.imageRender?.(originNode, info)) as any)
        : mergedPreviewConfig.value.imageRender;

      const placeholderNode =
        slots.placeholder?.() ??
        (props.placeholder === true ? null : props.placeholder);

      const actionsRender = slots.actionsRender
        ? (((originNode: VueNode, info: any) =>
            slots.actionsRender?.({
              actionsNode: originNode,
              ...info,
            })) as any)
        : mergedPreviewConfig.value.actionsRender;

      const previewProps = mergedPreviewConfig.value;
      const {
        src: _previewSrc,
        open: _previewOpen,
        onOpenChange: _onPreviewOpenChange,
        cover: _cover,
        rootClassName: _previewRootCls,
        ...restPreviewProps
      } = previewProps as any;

      return (
        <>
          <div
            {...rootAttrs}
            aria-label={
              canPreview.value
                ? (restAttrs['aria-label'] ?? imgCommonProps.value.alt)
                : restAttrs['aria-label']
            }
            class={rootCls}
            onClick={canPreview.value ? onPreview : onInternalClick}
            onKeydown={onPreviewKeyDown}
            role={canPreview.value ? 'button' : restAttrs.role}
            style={rootStyle}
            tabindex={
              canPreview.value && restAttrs.tabIndex === null
                ? 0
                : restAttrs.tabIndex
            }
          >
            <img
              {...imgCommonProps.value}
              class={imgCls}
              height={height}
              onError={onImgError}
              onLoad={(srcAndOnload.value as any).onLoad}
              ref={getImgRef as any}
              src={(srcAndOnload.value as any).src}
              style={imgStyle as any}
              width={width}
            />

            {status.value === 'loading' && (
              <div aria-hidden="true" class={`${prefixCls.value}-placeholder`}>
                {placeholderNode}
              </div>
            )}

            {/* Preview Click Mask */}
            {cover.value !== false && canPreview.value && (
              <div
                class={clsx(
                  `${prefixCls.value}-cover`,
                  props.classNames?.cover,
                  `${prefixCls.value}-cover-${coverPlacement}`,
                )}
                style={props.styles?.cover}
              >
                {coverNode}
              </div>
            )}
          </div>

          {!groupContext && canPreview.value && (
            <Preview
              actionsRender={actionsRender as any}
              alt={imgCommonProps.value.alt as any}
              aria-hidden={!isShowPreview.value}
              fallback={props.fallback}
              imageInfo={{
                width: props.width as any,
                height: props.height as any,
              }}
              imageRender={imageRender as any}
              imgCommonProps={imgCommonProps.value as any}
              mousePosition={mousePosition.value}
              onClose={onPreviewClose}
              open={isShowPreview.value}
              prefixCls={previewPrefixCls.value}
              src={src.value}
              {...restPreviewProps}
              classNames={props.classNames?.popup}
              rootClassName={clsx(
                previewRootClassName.value,
                props.rootClassName,
              )}
              styles={props.styles?.popup}
            />
          )}
        </>
      );
    };
  },
  {
    name: 'Image',
    inheritAttrs: false,
  },
);

export default Image;
