import type { Ref } from 'vue';

import type { ScreenMap } from '../../_util/responsiveObserver';

import { nextTick, ref, unref, watchEffect } from 'vue';

import { canUseDom } from '@arvin-studio/headless';

import useResponsiveObserver from '../../_util/responsiveObserver';

export function useBreakpoint(
  refreshOnChange: boolean | Ref<boolean> = true,
  defaultScreens: null | Ref<null | ScreenMap> | ScreenMap = {} as ScreenMap,
) {
  const screensRef = ref<null | ScreenMap>(unref(defaultScreens));
  const responsiveObserver = useResponsiveObserver();

  watchEffect(async (onCleanup) => {
    if (!canUseDom()) {
      return;
    }
    await nextTick();
    const token = responsiveObserver.value?.subscribe((supportScreens) => {
      screensRef.value = unref(supportScreens);
      if (unref(refreshOnChange)) {
        // TODO: trigger component update
      }
    });
    onCleanup(() => {
      responsiveObserver.value.unsubscribe(token);
    });
  });

  return screensRef;
}

export default useBreakpoint;
