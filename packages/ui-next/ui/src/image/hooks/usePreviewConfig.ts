import type { Ref } from 'vue';

import type { VueNode } from '../../_util';
import type { MaskType } from '../../_util/hooks/useMergedMask';
import type { PreviewConfig } from '../index';
import type { GroupPreviewConfig } from '../PreviewGroup';

import { computed, isVNode } from 'vue';

import { getSlotPropsFnRun } from '../../_util/tools';

function normalizeMask(mask?: MaskType | VueNode) {
  mask = getSlotPropsFnRun({}, { mask }, 'mask');
  if (isVNode(mask)) {
    return [mask, undefined];
  }
  if (mask === true) {
    return [undefined, { blur: true }];
  }
  if (mask === false) {
    return [undefined, false];
  }
  if (mask && typeof mask === 'object') {
    return [undefined, { blur: true, ...mask }];
  }
  return [undefined, undefined];
}

export default function usePreviewConfig<
  T extends GroupPreviewConfig | PreviewConfig,
>(preview: Ref<boolean | T | undefined>) {
  // Get origin preview config
  const rawPreviewConfig = computed(() => {
    if (typeof preview.value === 'boolean') {
      return preview.value ? {} : null;
    }
    return preview.value && typeof preview.value === 'object'
      ? preview.value
      : {};
  });

  const splittedPreviewConfig = computed(() => {
    if (!rawPreviewConfig.value) {
      return [rawPreviewConfig.value, '', ''];
    }

    const {
      open,
      onOpenChange,
      cover,
      actionsRender,

      visible,
      onVisibleChange,
      rootClassName,
      maskClassName,
      mask,
      forceRender: _forceRender,
      destroyOnClose: _destroyOnClose,
      toolbarRender,

      ...restPreviewConfig
    } = rawPreviewConfig.value as GroupPreviewConfig &
      Pick<PreviewConfig, 'cover' | 'mask' | 'maskClassName'>;

    let onInternalOpenChange: typeof onOpenChange;
    if (onOpenChange) {
      onInternalOpenChange = onOpenChange;
    } else if (onVisibleChange) {
      onInternalOpenChange = (nextOpen, info) => {
        const { current } = info || {};
        if (current === undefined) {
          (onVisibleChange as NonNullable<PreviewConfig['onVisibleChange']>)(
            nextOpen,
            !nextOpen,
          );
        } else {
          onVisibleChange(nextOpen, !nextOpen, current);
        }
      };
    }

    const [coverElement, maskConfig] = normalizeMask(mask);

    return [
      {
        ...restPreviewConfig,
        open: open ?? visible,
        onOpenChange: onInternalOpenChange,
        cover: cover ?? coverElement,
        mask: maskConfig,
        actionsRender: actionsRender ?? toolbarRender,
      },
      rootClassName,
      maskClassName,
    ] as const;
  });

  return splittedPreviewConfig;
}
