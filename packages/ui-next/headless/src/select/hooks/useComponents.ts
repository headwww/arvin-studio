import type { Ref } from 'vue';

import type { VueNode } from '../../util';
import type { BaseSelectProps } from '../BaseSelect';

import { computed } from 'vue';

export interface ComponentsConfig {
  input?: any | string | VueNode;
  root?: any | string | VueNode;
}

export default function useComponents(
  components: Ref<ComponentsConfig>,
  getInputElement?: Ref<BaseSelectProps['getInputElement']>,
  getRawInputElement?: Ref<BaseSelectProps['getRawInputElement']>,
): Ref<ComponentsConfig> {
  return computed<ComponentsConfig>(() => {
    let { root, input } = components.value || {};

    // root: getRawInputElement
    if (getRawInputElement?.value) {
      root = getRawInputElement.value?.();
    }

    // input: getInputElement
    if (getInputElement?.value) {
      input = getInputElement.value?.();
    }

    return {
      root,
      input,
    };
  });
}
