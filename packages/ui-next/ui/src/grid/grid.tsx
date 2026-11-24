import type { SlotsType } from 'vue';

import type {
  AsGridConstructor,
  AsGridListeners,
  AsGridPrivateMethods,
  AsGridProps,
  AsGridSlots,
} from './types/grid';

import { defineComponent, provide } from 'vue';

import { uniqueId } from '@arvin-studio/kit';

export const Grid = defineComponent<
  AsGridProps,
  AsGridListeners,
  string,
  SlotsType<AsGridSlots>
>(
  (props, context) => {
    const { slots, emit } = context;
    const xID = uniqueId();

    const $asGrid = {
      xID,
      props: props as AsGridProps,
      context,
      reactData,
      internalData,
      getRefMaps: () => refMaps,
      getComputeMaps: () => computeMaps,
    } as AsGridConstructor & AsGridPrivateMethods;

    provide('$asGrid', $asGrid);
    // TODO provide('$xeGantt', null)

    return renderVN;
  },
  {
    name: 'AsGrid',
    inheritAttrs: false,
  },
);
