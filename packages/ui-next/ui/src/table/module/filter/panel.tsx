import type { PropType } from 'vue';

import type { AsGlobalRendererOptions } from '@arvin-studio/core';

import type { AsColumnPropTypes } from '../../types/column';
import type {
  AsTableConstructor,
  AsTableDefines,
  AsTableMethods,
  AsTablePrivateMethods,
} from '../../types/table';

import {
  computed,
  createCommentVNode,
  defineComponent,
  inject,
  ref,
} from 'vue';

import { isBoolean, uniqueId } from '@arvin-studio/kit';

import { ArvinStudio, Button } from '../../..';
import useLog from '../../../_util/logger';
import enUS from '../../../locale/en_US';
import useLocale from '../../../locale/useLocale';
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
    const [locale] = useLocale('Table', enUS.Table);
    const log = useLog('AsTableFilterPanel');
    const xID = uniqueId();

    const $asTable = inject(
      '$asTable',
      {} as AsTableConstructor & AsTableMethods & AsTablePrivateMethods,
    );
    const {
      reactData: tableReactData,
      internalData: tableInternalData,
      getComputeMaps,
      prefixCls,
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

    const computeHasCheckOption = computed(() => {
      const { filterStore } = props;
      const { column } = filterStore;
      return (
        column &&
        column.filters &&
        column.filters.some((option) => option.checked)
      );
    });

    /** ***********************
     * Publish methods
     *************************/
    // 确认筛选
    const confirmFilter = (evnt: Event) => {
      const { filterStore } = props;
      if (!evnt) {
        log.warn('delFunc', ['confirmFilter', 'saveFilterPanelByEvent']);
      }
      $asTable.handleFilterConfirmFilter(
        evnt || new Event('click'),
        filterStore.column || null,
      );
    };

    /**
     * 重置筛选
     * 当筛选面板中的重置按钮被按下时触发
     * @param {Event} evnt 事件
     */
    const resetFilter = (evnt: Event) => {
      const { filterStore } = props;
      $asTable.handleFilterResetFilter(evnt, filterStore.column || null);
    };

    const renderOptions = (
      filterRender: AsColumnPropTypes.FilterRender | null,
      compConf: AsGlobalRendererOptions | null,
    ) => {};

    const renderFooters = () => {
      const { filterStore } = props;
      const { column } = filterStore;
      if (!column) {
        return [];
      }
      const filterOpts = computeFilterOpts.value;
      const rendererOpts = computeRendererOpts.value;
      const hasCheckOption = computeHasCheckOption.value;
      const { filterRender, filterMultiple } = column;
      const { confirmButtonText, resetButtonText, showFooter } = filterOpts;
      const compConf =
        filterRender && isEnableConf(filterRender) && filterRender.name
          ? rendererOpts[filterRender.name] || renderer.get(filterRender.name)
          : null;
      const isDisabled =
        !hasCheckOption &&
        !filterStore.isAllSelected &&
        !filterStore.isIndeterminate;
      let showFlFoot = !!filterMultiple;
      if (isBoolean(showFooter)) {
        showFlFoot = !!showFooter;
      } else if (compConf) {
        showFlFoot = compConf.showTableFilterFooter !== false;
      }
      if (!showFlFoot) {
        return [];
      }
      return [
        <div class={`${prefixCls.value}--filter-footer`}>
          <Button onClick={resetFilter} size="small">
            {resetButtonText || locale?.value?.resetFilter}
          </Button>
          <Button
            class={{
              'is--disabled': isDisabled,
            }}
            disabled={isDisabled}
            onClick={confirmFilter}
            size="small"
            type="primary"
          >
            {confirmButtonText || locale?.value?.confirmFilter}
          </Button>
        </div>,
      ];
    };
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
          class={[`${prefixCls.value}--filter-wrapper`, className]}
          height={filterStore.style?.height}
          open={true}
          placement="bottom"
          rootStyle={{ minWidth: 100, padding: 0 }}
          width={filterStore.style?.width}
          x={filterStore.style?.left}
          y={filterStore.style?.top}
          zIndex={filterStore.style?.zIndex}
        >
          {initStore.filter && (destroyOnClose ? visible : true) && column ? (
            <>
              {renderOptions(filterRender, compConf)}
              {renderFooters()}
            </>
          ) : (
            []
          )}
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
