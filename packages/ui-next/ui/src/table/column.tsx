import type { SlotsType } from 'vue';

import type {
  AsColumnEmits,
  AsColumnProps,
  AsColumnSlots,
} from './types/column';
import type { AsTableConstructor, AsTablePrivateMethods } from './types/table';
import type { ASColumnInstance } from './util';

import {
  createCommentVNode,
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
} from 'vue';

import enUS from '../locale/en_US';
import useLocale from '../locale/useLocale';
import { Cell } from './cell';
import { assembleColumn, destroyColumn, watchColumn } from './util';

export default defineComponent<
  AsColumnProps,
  AsColumnEmits,
  string,
  SlotsType<AsColumnSlots>
>(
  (props, { slots }) => {
    const refElem = ref<HTMLDivElement>();
    const $asTable = inject<
      (AsTableConstructor & AsTablePrivateMethods) | null
    >('$asTable', null);
    const [locale] = useLocale('Table', enUS.Table);

    const $asColgroup = inject<ASColumnInstance | null>('$asColgroup', null);

    if (!$asTable) {
      return () => createCommentVNode();
    }

    const columnConfig = Cell.createColumn($asTable, props, locale);
    columnConfig.slots = slots;

    const renderVN = () => {
      return <div ref={refElem}></div>;
    };

    const $asColumn = {
      columnConfig,

      renderVN,
    } as ASColumnInstance;

    watchColumn($asTable, props, columnConfig);

    onMounted(() => {
      const elem = refElem.value;
      if (elem) {
        assembleColumn($asTable, elem, columnConfig, $asColgroup);
      }
    });

    onUnmounted(() => {
      destroyColumn($asTable, columnConfig);
    });

    provide('$asColumn', $asColumn);
    provide('$asGrid', null);
    provide('$asGantt', null);
    return renderVN;
  },
  {
    name: 'AsColumn',
    inheritAttrs: false,
  },
);
