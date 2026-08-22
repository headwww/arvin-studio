import type { CSSProperties } from 'vue';

import type { VueNode } from '../util';
import type { TransformType } from './hooks/useImageTransform';
import type { ImgInfo } from './Image';
import type { ImageElementProps, OnGroupPreview } from './interface';
import type {
  InternalPreviewConfig,
  PreviewProps,
  PreviewSemanticName,
} from './Preview';

import { computed, defineComponent, shallowRef, toRef, watch } from 'vue';

import useMergedState from '../util/hooks/useMergedState';
import { usePreviewGroupProvider } from './context';
import usePreviewItems from './hooks/usePreviewItems';
import Preview from './Preview/index';

export interface GroupPreviewConfig extends Omit<
  InternalPreviewConfig,
  'imageRender'
> {
  current?: number;
  imageRender?: (
    originalNode: VueNode,
    info: { current: number; image: ImgInfo; transform: TransformType },
  ) => VueNode;
  onChange?: (current: number, prevCurrent: number) => void;
  onOpenChange?: (value: boolean, info: { current: number }) => void;
}

export interface PreviewGroupProps {
  children?: VueNode;
  classNames?: {
    popup?: Partial<Record<PreviewSemanticName, string>>;
  };

  fallback?: string;

  icons?: PreviewProps['icons'];
  items?: (ImageElementProps | string)[];
  preview?: boolean | GroupPreviewConfig;
  previewPrefixCls?: string;
  styles?: {
    popup?: Partial<Record<PreviewSemanticName, CSSProperties>>;
  };
}

const defaults = {
  previewPrefixCls: 'headless-image-preview',
  icons: {},
} as any;

const PreviewGroup = defineComponent<PreviewGroupProps>(
  (props = defaults, { slots, emit }) => {
    const mergedPreviewConfig = computed<GroupPreviewConfig>(() => {
      if (props.preview && typeof props.preview === 'object') {
        return props.preview as any;
      }
      return {} as any;
    });

    const previewOpen = computed(() => mergedPreviewConfig.value.open);
    const previewCurrent = computed(() => mergedPreviewConfig.value.current);

    // ========================== Items ===========================
    const [mergedItems, register, fromItems] = usePreviewItems(
      toRef(props, 'items'),
    );

    // ========================= Preview ==========================
    const [current, setCurrent] = useMergedState<number>(0, {
      value: previewCurrent as any,
    });

    const keepOpenIndex = shallowRef(false);

    // >>> Visible
    const [isShowPreview, setShowPreview] = useMergedState<boolean>(
      !!previewOpen.value,
      {
        value: previewOpen as any,
      },
    );

    const triggerShowPreview = (next: boolean) => {
      const prev = isShowPreview.value;
      setShowPreview(next);

      if (next !== prev) {
        mergedPreviewConfig.value.onOpenChange?.(next, {
          current: current.value,
        });
      }
    };

    // >>> Position
    const mousePosition = shallowRef<null | { x: number; y: number }>(null);

    const onPreviewFromImage: OnGroupPreview = (
      id,
      imageSrc,
      mouseX,
      mouseY,
    ) => {
      const itemsList = mergedItems.value;
      const index = fromItems.value
        ? itemsList.findIndex((item) => item.data.src === imageSrc)
        : itemsList.findIndex((item) => item.id === id);

      setCurrent(Math.max(index, 0));
      triggerShowPreview(true);
      mousePosition.value = { x: mouseX, y: mouseY };
      keepOpenIndex.value = true;
    };

    // Reset current when reopen
    watch(isShowPreview, (open) => {
      if (open) {
        if (!keepOpenIndex.value) {
          setCurrent(0);
        }
      } else {
        keepOpenIndex.value = false;
      }
    });

    // ========================== Events ==========================
    const onInternalChange: GroupPreviewConfig['onChange'] = (next, prev) => {
      setCurrent(next);
      mergedPreviewConfig.value.onChange?.(next, prev);
      emit('change', next, prev);
    };

    const onPreviewClose = () => {
      triggerShowPreview(false);
      mousePosition.value = null;
    };

    // ========================= Context ==========================
    usePreviewGroupProvider({
      register,
      onPreview: onPreviewFromImage,
    });

    // ========================== Render ==========================
    return () => {
      const itemsList = mergedItems.value;
      const currentItem = itemsList[current.value];
      const { src, ...imgCommonProps } = currentItem?.data || ({} as any);

      const countRender = slots.countRender
        ? (((currentNum: number, total: number) =>
            slots.countRender?.(currentNum, total)) as any)
        : mergedPreviewConfig.value.countRender;

      const previewConfig = mergedPreviewConfig.value as any;
      const {
        open: _open,
        current: _current,
        onOpenChange: _onOpenChange,
        onChange: _onChange,
        ...restPreviewConfig
      } = previewConfig;

      return (
        <>
          {slots.default?.()}
          <Preview
            aria-hidden={!isShowPreview.value}
            count={itemsList.length}
            current={current.value}
            fallback={props.fallback}
            icons={props.icons}
            imgCommonProps={imgCommonProps}
            mousePosition={mousePosition.value}
            onChange={onInternalChange as any}
            onClose={onPreviewClose}
            open={isShowPreview.value}
            prefixCls={props.previewPrefixCls}
            src={src}
            {...restPreviewConfig}
            classNames={props.classNames?.popup}
            countRender={countRender}
            styles={props.styles?.popup}
            v-slots={slots}
          />
        </>
      );
    };
  },
  {
    name: 'ImagePreviewGroup',
    inheritAttrs: false,
    emits: ['change'],
  },
);

export default PreviewGroup;
