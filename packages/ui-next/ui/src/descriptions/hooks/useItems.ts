import type { Ref } from 'vue';

import type { ScreenMap } from '../../_util/responsiveObserver';
import type { DescriptionsItemType } from '../index.tsx';

import { computed } from 'vue';

import { matchScreen } from '../../_util/responsiveObserver';

export default function useItems(
  screens: Ref<ScreenMap>,
  items: Ref<DescriptionsItemType[]>,
) {
  return computed(() => {
    return items.value.map(({ span, ...restItem }, index) => {
      if (span === 'filled') {
        return { ...restItem, filled: true, _$index: index };
      }
      return {
        _$index: index,
        ...restItem,
        span:
          typeof span === 'number' ? span : matchScreen(screens.value, span),
      };
    });
  });
}
