import type { Slot } from 'vue';

import type { AsColumnProps } from './types/column';
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

export default defineComponent<AsColumnProps>(
  (props, { slots }) => {
    const [locale] = useLocale('Table', enUS.Table);

    const refElem = ref<HTMLDivElement>();
    const $asTable = inject<
      (AsTableConstructor & AsTablePrivateMethods) | null
    >('$asTable', null);
    const $asParentColgroup = inject<ASColumnInstance | null>(
      '$asColgroup',
      null,
    );

    if (!$asTable) {
      return () => createCommentVNode();
    }

    const columnConfig = Cell.createColumn($asTable, props, locale);

    const columnSlots: {
      header?: Slot;
      title?: Slot;
    } = {};

    if (slots.header) {
      columnSlots.header = slots.header;
    }
    if (slots.title) {
      columnSlots.title = slots.title;
    }

    columnConfig.slots = columnSlots;
    columnConfig.children = [];

    watchColumn($asTable, props, columnConfig);

    const renderVN = () => {
      const defaultSlot = slots.default;
      return <div ref={refElem}>{defaultSlot ? defaultSlot() : []}</div>;
    };

    onMounted(() => {
      const elem = refElem.value;
      if (elem) {
        assembleColumn($asTable, elem, columnConfig, $asParentColgroup);
      }
    });

    onUnmounted(() => {
      destroyColumn($asTable, columnConfig);
    });

    const $asColgroup = { columnConfig } as ASColumnInstance;

    provide('$asColgroup', $asColgroup);
    provide('$asGrid', null);
    provide('$asGantt', null);
    return renderVN;
  },
  {
    name: 'AsColgroup',
    inheritAttrs: false,
  },
);
