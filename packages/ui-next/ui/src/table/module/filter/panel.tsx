import type { PropType } from 'vue';

import type { AsGlobalRendererOptions } from '@arvin-studio/core';

import type { AsColumnPropTypes } from '../../types/column';
import type {
  AsTableConstructor,
  AsTableDefines,
  AsTableMethods,
  AsTablePrivateMethods,
} from '../../types/table';

import { createCommentVNode, defineComponent, inject, ref } from 'vue';

import { uniqueId } from '@arvin-studio/kit';

import { ArvinStudio } from '../../..';
import PositionPopup from '../../../position-popup';
import { isEnableConf } from '../../util';

const { renderer } = ArvinStudio;
export default defineComponent({
  name: 'AsTableFilterPanel',
  props: {
    filterStore: {
      type: Object as PropType<AsTableDefines.FilterStoreObj>,
      default: () => ({}) as AsTableDefines.FilterStoreObj,
    },
  },
  setup(props, context) {
    const xID = uniqueId();

    const $asTable = inject(
      '$asTable',
      {} as AsTableConstructor & AsTableMethods & AsTablePrivateMethods,
    );
    const {
      reactData: tableReactData,
      internalData: tableInternalData,
      getComputeMaps,
    } = $asTable;
    const { computeFilterOpts, computeRendererOpts } = getComputeMaps();

    const refElem = ref<HTMLDivElement>();

    const refMaps = {
      refElem,
    };

    const $asFilterPanel: any = {
      xID,
      props,
      context,
      getRefMaps: () => refMaps,
    };
    const renderOptions = (
      filterRender: AsColumnPropTypes.FilterRender | null,
      compConf: AsGlobalRendererOptions | null,
    ) => {};

    const renderFooters = () => {};
    const renderVN = () => {
      const { filterStore } = props;
      const { initStore } = tableReactData;
      const { visible, column } = filterStore;
      if (!column) {
        return createCommentVNode();
      }
      const rendererOpts = computeRendererOpts.value;
      const filterOpts = computeFilterOpts.value;
      const filterRender = column ? column.filterRender : null;

      const compConf =
        filterRender && isEnableConf(filterRender) && filterRender.name
          ? rendererOpts[filterRender.name] || renderer.get(filterRender.name)
          : null;
      const { destroyOnClose, className } = filterOpts;
      return (
        <PositionPopup
          arrow={false}
          height={filterStore.style?.height}
          open={visible}
          placement="bottom"
          rootClassName={className}
          rootStyle={{ minWidth: 100, padding: 0 }}
          width={filterStore.style?.width}
          x={filterStore.style?.left}
          y={filterStore.style?.top}
          zIndex={filterStore.style?.zIndex}
        >
          {initStore.filter && (destroyOnClose ? visible : true) && column
            ? renderOptions(filterRender, compConf).concat(renderFooters())
            : []}
        </PositionPopup>
      );
    };
    $asFilterPanel.renderVN = renderVN;

    return $asFilterPanel;
  },
  render() {
    // eslint-disable-next-line unicorn/no-this-outside-of-class
    return this.renderVN();
  },
});
