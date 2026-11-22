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

import { ArvinStudio, Button, Checkbox } from '../../..';
import { toCssUnit } from '../../../_util/dom';
import useLog from '../../../_util/logger';
import { getSlotVNs } from '../../../_util/vn';
import enUS from '../../../locale/en_US';
import useLocale from '../../../locale/useLocale';
import PositionPopup from '../../../position-popup';
import { useToken } from '../../../theme/internal';
import { formatText, isEnableConf } from '../../util';

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
    // useToken() 返回 [theme, realToken, hashId, token, cssVar, zeroRuntime]，这里取下标 4 的 cssVar
    const cssVar = useToken()[4];
    // PositionPopup 会 Teleport 到 body，脱离 .as-table 的 CSS 变量作用域，
    // 这里把表格的 CSS 变量作用域类补到弹层根节点上
    const themeCls = computed(() => {
      const cssVarKey = cssVar.value?.key;
      return cssVarKey ? [cssVarKey, prefixCls.value] : [];
    });

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

    // 全部筛选事件
    const filterCheckAllEvent = (evnt: Event, value: any) => {
      const { filterStore } = props;
      const { column } = filterStore;
      if (column && column.filters) {
        column.filters.forEach((option: any) => {
          option._checked = value;
          option.checked = value;
        });
      }
      filterStore.isAllSelected = value;
      filterStore.isIndeterminate = false;
    };

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

    // （单选）筛选发生改变
    const changeRadioOption = (evnt: Event, checked: boolean, item: any) => {
      $asTable.handleFilterChangeRadioOption(evnt, checked, item);
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

    // （多选）筛选发生改变
    const changeMultipleOption = (evnt: Event, checked: boolean, item: any) => {
      $asTable.handleFilterChangeMultipleOption(evnt, checked, item);
    };

    // 筛选发生改变
    const changeOption = (evnt: Event, checked: boolean, item: any) => {
      $asTable.handleFilterChangeOption(evnt, checked, item);
    };

    const changeAllOption = (evnt: Event, checked: boolean) => {
      const { filterStore } = props;
      const { column } = filterStore;
      if (column && column.filterMultiple) {
        filterCheckAllEvent(evnt, checked);
      } else {
        resetFilter(evnt);
      }
    };

    const filterPanelMethods = {
      changeRadioOption,
      changeMultipleOption,
      changeAllOption,
      changeOption,
      confirmFilter,
      resetFilter,
    };

    Object.assign($asFilterPanel, filterPanelMethods);

    const renderOptions = (
      filterRender: AsColumnPropTypes.FilterRender | null,
      compConf: AsGlobalRendererOptions | null,
    ) => {
      const { filterStore } = props;
      const { column, maxHeight } = filterStore;
      if (!column) {
        return [];
      }
      const { filterMultiple, filters, slots } = column;
      const filterOptions = (filters || []) as AsTableDefines.FilterOption[];
      const filterSlot = slots ? slots.filter : null;
      const params = Object.assign({}, tableInternalData._currFilterParams, {
        option: filterOptions[0],
        $panel: $asFilterPanel,
        $table: $asTable,
      });
      const rtFilter = compConf ? compConf.renderTableFilter : null;
      if (filterSlot) {
        return (
          <div
            class={`${prefixCls.value}--filter-template`}
            style={
              maxHeight
                ? {
                    maxHeight: toCssUnit(maxHeight),
                  }
                : {}
            }
          >
            {$asTable.callSlot(filterSlot, params)}
          </div>
        );
      } else if (filterRender && rtFilter) {
        return (
          <div
            class={`${prefixCls.value}--filter-template`}
            style={
              maxHeight
                ? {
                    maxHeight: toCssUnit(maxHeight),
                  }
                : {}
            }
          >
            {getSlotVNs(rtFilter(filterRender, params))}
          </div>
        );
      }
      const isAllChecked = filterMultiple
        ? filterStore.isAllSelected
        : filterOptions.every((item) => !item._checked);
      const isAllIndeterminate = filterMultiple && filterStore.isIndeterminate;
      return [
        <ul class={`${prefixCls.value}--filter-header`} key="header">
          <li
            class={[`${prefixCls.value}--filter-option`]}
            onClick={(evnt: MouseEvent) => {
              changeAllOption(evnt, !filterStore.isAllSelected);
            }}
            title={String(
              (filterMultiple
                ? locale?.value?.allTitle
                : locale?.value?.allFilter) ?? '',
            )}
          >
            {filterMultiple ? (
              <Checkbox
                checked={isAllChecked}
                indeterminate={isAllIndeterminate}
                style={{ pointerEvents: 'none' }}
              />
            ) : (
              createCommentVNode()
            )}
            <span class={`${prefixCls.value}-checkbox--label`}>
              {locale?.value?.allFilter}
            </span>
          </li>
        </ul>,
        <ul
          class={`${prefixCls.value}--filter-body`}
          key="body"
          style={
            maxHeight
              ? {
                  maxHeight: toCssUnit(maxHeight),
                }
              : {}
          }
        >
          {filterOptions.map((item, index) => (
            <li
              class={[`${prefixCls.value}--filter-option`]}
              key={index}
              onClick={(evnt: MouseEvent) => {
                changeOption(evnt, !item._checked, item);
              }}
              title={String(item.label ?? '')}
            >
              {filterMultiple ? (
                <Checkbox
                  checked={!!item._checked}
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                createCommentVNode()
              )}
              <span class={`${prefixCls.value}-checkbox--label`}>
                {formatText(item.label, 1)}
              </span>
            </li>
          ))}
        </ul>,
      ];
    };

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
          <Button onClick={resetFilter} size="small" type="link">
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
          class={[
            ...themeCls.value,
            `${prefixCls.value}--filter-wrapper`,
            className,
          ]}
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
