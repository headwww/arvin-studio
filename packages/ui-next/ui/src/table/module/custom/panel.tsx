import type { PropType } from 'vue';

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
  reactive,
  ref,
} from 'vue';

import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  HolderOutlined,
  PushpinOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@arvin-studio/icons';
import { eachTree, findTree } from '@arvin-studio/kit';

import {
  Button,
  Checkbox,
  Drawer,
  InputNumber,
  Modal,
  RadioGroup,
} from '../../..';
import { getSlotVNs } from '../../../_util/vn';
import enUS from '../../../locale/en_US';
import useLocale from '../../../locale/useLocale';
import { useToken } from '../../../theme/internal';

type ColumnInfo = AsTableDefines.ColumnInfo;

interface DragState {
  overId: string;
  pos: '' | 'bottom' | 'top';
  sourceId: string;
}

export default defineComponent({
  name: 'AsTableCustomPanel',
  props: {
    customStore: {
      type: Object as PropType<AsTableDefines.AsTableCustomStoreObj>,
      default: () => ({}) as AsTableDefines.AsTableCustomStoreObj,
    },
  },
  setup(props, context) {
    const $asTable = inject(
      '$asTable',
      {} as AsTableConstructor & AsTableMethods & AsTablePrivateMethods,
    );
    const { reactData, getComputeMaps, prefixCls } = $asTable;
    const computeMaps = getComputeMaps() as any;
    const customOpts = computed(() => computeMaps.computeCustomOpts.value);
    const isMaxFixedColumn = computed(
      () => !!computeMaps.computeIsMaxFixedColumn?.value,
    );
    const [locale] = useLocale('Table', enUS.Table);
    const { customStore } = props;
    const cssVar = useToken()[4];
    const themeCls = computed(() => {
      const key = cssVar.value?.key;
      return key ? [key] : [];
    });

    const refElem = ref<HTMLDivElement>();
    const refBodyWrapperElem = ref<HTMLDivElement>();
    const refCustomBodyElem = ref<HTMLDivElement>();
    const dragState = reactive<DragState>({
      sourceId: '',
      overId: '',
      pos: '',
    });
    const dragTipText = ref('');

    const visible = computed(() => !!customStore.visible);
    const isCustomStatus = computed(() => !!reactData.isCustomStatus);
    const customColumnList = computed<ColumnInfo[]>(
      () => reactData.customColumnList || [],
    );
    const slotParams = computed(() => ({
      $table: $asTable,
      columns: customColumnList.value,
      isAllChecked: customStore.isAll,
      isAllIndeterminate: customStore.isIndeterminate,
      isCustomStatus: isCustomStatus.value,
    }));

    const getSlot = (name: string) => {
      const customSlots = (customOpts.value.slots || {}) as Record<string, any>;
      return customSlots[name];
    };
    const renderSlot = (name: string) => {
      const slot = getSlot(name);
      return slot ? getSlotVNs($asTable.callSlot(slot, slotParams.value)) : [];
    };

    const isColumnDisabled = (column: ColumnInfo) => {
      const checkMethod = customOpts.value.checkMethod;
      return checkMethod ? !checkMethod({ $table: $asTable, column }) : false;
    };
    const isColumnVisible = (column: ColumnInfo) => {
      const visibleMethod = customOpts.value.visibleMethod;
      return visibleMethod ? visibleMethod({ $table: $asTable, column }) : true;
    };

    const treeRows = computed(() => {
      const rows: { column: ColumnInfo; level: number }[] = [];
      const walk = (items: ColumnInfo[], level: number) => {
        items.forEach((column) => {
          if (!isColumnVisible(column)) {
            return;
          }
          rows.push({ column, level });
          if (column.children && column.children.length > 0) {
            walk(column.children, level + 1);
          }
        });
      };
      walk(customColumnList.value, 1);
      return rows;
    });

    /**
     * 勾选/取消单列显示
     */
    const handleOptionCheck = (column: ColumnInfo) => {
      const res = findTree(
        customColumnList.value,
        (item) => item === column,
      ) as any;
      const parent = res?.parent as ColumnInfo | undefined;
      if (parent) {
        parent.renderVisible = (parent.children || []).every(
          (child: ColumnInfo) => child.renderVisible,
        );
        parent.halfVisible =
          !parent.renderVisible &&
          (parent.children || []).some(
            (child: ColumnInfo) => child.renderVisible || child.halfVisible,
          );
        handleOptionCheck(parent);
      }
    };

    const changeCheckboxOption = (column: ColumnInfo, evnt: Event) => {
      const opts = customOpts.value;
      const checked = !column.renderVisible;
      if (opts.immediate) {
        column.visible = checked;
        column.renderVisible = checked;
        column.halfVisible = false;
        reactData.isCustomStatus = true;
        $asTable.handleCustom();
        $asTable.saveCustomStore('update:visible');
      } else {
        column.renderVisible = checked;
        column.halfVisible = false;
      }
      handleOptionCheck(column);
      $asTable.checkCustomStatus();
      $asTable.dispatchEvent('customVisibleChange', { column, checked }, evnt);
    };

    const changeColumnWidth = (column: ColumnInfo) => {
      const opts = customOpts.value;
      if (opts.immediate && column.renderResizeWidth !== column.renderWidth) {
        column.resizeWidth = column.renderResizeWidth;
        column.renderWidth = column.renderResizeWidth;
        reactData.isCustomStatus = true;
        $asTable.handleCustom();
        $asTable.saveCustomStore('update:width');
      }
    };

    const changeFixedOption = (
      column: ColumnInfo,
      fixed: 'left' | 'right',
      evnt: Event,
    ) => {
      const opts = customOpts.value;
      const isFixed = column.renderFixed === fixed;
      if (!isFixed && isMaxFixedColumn.value && !column.renderFixed) {
        return;
      }
      const targetFixed = isFixed ? '' : fixed;
      eachTree([column], (col) => {
        col.renderFixed = targetFixed;
        if (opts.immediate) {
          col.fixed = targetFixed;
        }
      });
      if (opts.immediate) {
        reactData.isCustomStatus = true;
        $asTable.handleCustom();
        $asTable.saveCustomStore('update:fixed');
      }
      $asTable.dispatchEvent(
        'customFixedChange',
        { column, fixed: targetFixed },
        evnt,
      );
    };

    const changeAlignOption = (
      column: ColumnInfo,
      value: string,
      colProperty: string,
      renderProperty: string,
      eName: string,
      evnt?: Event,
    ) => {
      const opts = customOpts.value;
      (column as any)[renderProperty] = value;
      if (opts.immediate) {
        (column as any)[colProperty] = value;
        reactData.isCustomStatus = true;
        $asTable.handleCustom();
        $asTable.saveCustomStore(
          `update:${colProperty}` as AsTableDefines.CustomEventType,
        );
      }
      $asTable.dispatchEvent(
        eName as any,
        {
          column,
          [colProperty]: value,
        },
        evnt as Event,
      );
    };

    const allOptionEvent = (evnt: Event) => {
      const checked = !customStore.isAll;
      $asTable.toggleCustomAllCheckbox();
      $asTable.dispatchEvent('customVisibleAll', { checked }, evnt);
    };

    const confirmCustomEvent = (evnt?: Event) => {
      reactData.isCustomStatus = true;
      $asTable.saveCustom();
      $asTable.closeCustom();
      $asTable.dispatchEvent('customConfirm', {}, evnt as Event);
      $asTable.dispatchEvent('customClose', {}, evnt as Event);
    };

    const cancelCustomEvent = (evnt?: Event) => {
      $asTable.cancelCustom();
      $asTable.closeCustom();
      $asTable.dispatchEvent('customCancel', {}, evnt as Event);
      $asTable.dispatchEvent('customClose', {}, evnt as Event);
    };

    const cancelCloseEvent = (evnt?: Event) => {
      $asTable.closeCustom();
      $asTable.dispatchEvent('customClose', {}, evnt as Event);
    };

    const handleResetCustomEvent = () => {
      void $asTable.resetCustom(true).then(() => {
        $asTable.closeCustom();
        $asTable.dispatchEvent('customReset', {}, undefined as any);
        $asTable.dispatchEvent('customClose', {}, undefined as any);
      });
    };

    const resetCustomEvent = (evnt: Event) => {
      evnt.stopPropagation();
      void (Modal as any).confirm({
        content: locale?.value?.customConfirmRestore,
        okText: locale?.value?.customConfirm,
        cancelText: locale?.value?.customCancel,
        onOk: () => {
          handleResetCustomEvent();
        },
      });
    };

    const afterOrderChange = (items: ColumnInfo[]) => {
      items.forEach((column, index) => {
        column.renderSortNumber = index + 1;
      });
      reactData.isCustomStatus = true;
      if (customOpts.value.immediate) {
        $asTable.saveCustom();
        $asTable.handleCustom();
      }
    };

    const findColumnResult = (id: string) => {
      return findTree(
        customColumnList.value,
        (item) => item.id === id,
      ) as any as null | {
        index: number;
        item: ColumnInfo;
        items: ColumnInfo[];
        parent?: ColumnInfo;
      };
    };

    const moveColumn = (column: ColumnInfo, offset: number) => {
      const res = findColumnResult(column.id);
      if (!res) {
        return;
      }
      const { items, index } = res;
      const targetIndex = index + offset;
      if (targetIndex < 0 || targetIndex >= items.length) {
        return;
      }
      items.splice(index, 1);
      items.splice(targetIndex, 0, column);
      afterOrderChange(items);
    };

    const putColumn = (column: ColumnInfo, isTop: boolean) => {
      const res = findColumnResult(column.id);
      if (!res) {
        return;
      }
      const { items, index } = res;
      if (items === customColumnList.value) {
        return;
      }
      items.splice(index, 1);
      column.parentId = null;
      if (isTop) {
        customColumnList.value.unshift(column);
      } else {
        customColumnList.value.push(column);
      }
      afterOrderChange(customColumnList.value);
    };

    const resetDragState = () => {
      dragState.sourceId = '';
      dragState.overId = '';
      dragState.pos = '';
      dragTipText.value = '';
      reactData.isCustomDragStatus = false;
    };

    const handleDragstart = (evnt: DragEvent, column: ColumnInfo) => {
      if (!customOpts.value.allowSort || isColumnDisabled(column)) {
        evnt.preventDefault();
        return;
      }
      dragState.sourceId = column.id;
      dragState.overId = '';
      dragState.pos = '';
      reactData.isCustomDragStatus = true;
      dragTipText.value = locale?.value?.customSortTip;
      if (evnt.dataTransfer) {
        evnt.dataTransfer.effectAllowed = 'move';
        evnt.dataTransfer.setData('text/plain', column.id);
      }
    };

    const handleDragover = (evnt: DragEvent, column: ColumnInfo) => {
      if (!dragState.sourceId || dragState.sourceId === column.id) {
        return;
      }
      const source = findColumnResult(dragState.sourceId);
      const target = findColumnResult(column.id);
      if (!source || !target || source.items !== target.items) {
        return;
      }
      evnt.preventDefault();
      const rect = (evnt.currentTarget as HTMLElement).getBoundingClientRect();
      dragState.overId = column.id;
      dragState.pos =
        evnt.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
      if (evnt.dataTransfer) {
        evnt.dataTransfer.dropEffect = 'move';
      }
    };

    const handleDrop = (evnt: DragEvent) => {
      evnt.preventDefault();
      const { sourceId, overId, pos } = dragState;
      resetDragState();
      if (!sourceId || !overId || sourceId === overId) {
        return;
      }
      const source = findColumnResult(sourceId);
      const target = findColumnResult(overId);
      if (!source || !target || source.items !== target.items) {
        return;
      }
      const moved = source.items.splice(source.index, 1)[0] as ColumnInfo;
      const newTargetIndex = source.items.findIndex(
        (item) => item.id === overId,
      );
      const insertIndex = newTargetIndex + (pos === 'bottom' ? 1 : 0);
      source.items.splice(insertIndex, 0, moved);
      moved.parentId = source.parent ? source.parent.id : null;
      afterOrderChange(source.items);
    };

    const handleDragend = () => {
      resetDragState();
    };

    const dragTipVNs = () => {
      if (!reactData.isCustomDragStatus || !dragTipText.value) {
        return createCommentVNode();
      }
      return (
        <div class={`${prefixCls.value}-custom--drag-tip`}>
          {dragTipText.value}
        </div>
      );
    };

    const alignOptions = computed(() => [
      {
        value: 'left',
        title: locale?.value?.customAlignLeft,
        label: <AlignLeftOutlined />,
      },
      {
        value: 'center',
        title: locale?.value?.customAlignCenter,
        label: <AlignCenterOutlined />,
      },
      {
        value: 'right',
        title: locale?.value?.customAlignRight,
        label: <AlignRightOutlined />,
      },
    ]);

    const renderResetButton = () => (
      <Button
        disabled={!isCustomStatus.value}
        onClick={resetCustomEvent}
        size="small"
        type="text"
      >
        {customOpts.value.resetButtonText || locale?.value?.customRestore}
      </Button>
    );

    const renderCancelButton = () => {
      const opts = customOpts.value;
      return opts.immediate ? (
        <Button onClick={cancelCloseEvent} size="small" type="text">
          {opts.closeButtonText || locale?.value?.customClose}
        </Button>
      ) : (
        <Button onClick={cancelCustomEvent} size="small" type="text">
          {opts.cancelButtonText || locale?.value?.customCancel}
        </Button>
      );
    };

    const renderConfirmButton = () => {
      const opts = customOpts.value;
      return (
        <Button onClick={confirmCustomEvent} size="small" type="primary">
          {opts.confirmButtonText || locale?.value?.customConfirm}
        </Button>
      );
    };

    const renderActions = () => {
      const opts = customOpts.value;
      if (!opts.showFooter) {
        return null;
      }
      const footerSlot = getSlot('footer');
      if (footerSlot) {
        return $asTable.callSlot(footerSlot, slotParams.value);
      }
      return (
        <div class={`${prefixCls.value}-custom--actions`}>
          {renderResetButton()}
          <span class={`${prefixCls.value}-custom--actions-divider`} />
          {renderCancelButton()}
          {!opts.immediate && renderConfirmButton()}
        </div>
      );
    };

    const renderPopupActions = () => {
      const opts = customOpts.value;
      if (!opts.showFooter) {
        return null;
      }
      const footerSlot = getSlot('footer');
      if (footerSlot) {
        return $asTable.callSlot(footerSlot, slotParams.value);
      }
      return (
        <div class={`${prefixCls.value}-custom--popup-actions`}>
          <div class={`${prefixCls.value}-custom--actions`}>
            {renderResetButton()}
          </div>
          <div class={`${prefixCls.value}-custom--actions`}>
            {renderCancelButton()}
            {!opts.immediate && renderConfirmButton()}
          </div>
        </div>
      );
    };

    const renderRowOption = (
      column: ColumnInfo,
      index: number,
      level: number,
    ) => {
      const opts = customOpts.value;
      const disabled = isColumnDisabled(column);
      const hidden = !column.renderVisible;
      const isGroup = !!(column.children && column.children.length > 0);
      return (
        <li
          class={[
            `${prefixCls.value}-custom--option`,
            `level--${level}`,
            {
              'is--hidden': disabled || hidden,
              'is--group': isGroup,
              'is--drag-over': dragState.overId === column.id,
              'is--drag-top':
                dragState.overId === column.id && dragState.pos === 'top',
              'is--drag-bottom':
                dragState.overId === column.id && dragState.pos === 'bottom',
            },
          ]}
          colid={column.id}
          draggable={!!opts.allowSort}
          key={column.id}
          onDragend={handleDragend}
          onDragover={(evnt: DragEvent) => handleDragover(evnt, column)}
          onDragstart={(evnt: DragEvent) => handleDragstart(evnt, column)}
          onDrop={handleDrop}
        >
          {opts.allowVisible && (
            <div
              class={[
                `${prefixCls.value}-custom--checkbox-option`,
                {
                  'is--checked': column.renderVisible,
                  'is--indeterminate': column.halfVisible,
                  'is--disabled': disabled,
                },
              ]}
              onClick={(evnt: MouseEvent) => {
                if (!disabled) {
                  changeCheckboxOption(column, evnt);
                }
              }}
              title={locale?.value?.customColVisible}
            >
              <Checkbox
                checked={!!column.renderVisible}
                disabled={disabled}
                indeterminate={!!column.halfVisible}
                style={{ pointerEvents: 'none' }}
              />
            </div>
          )}
          <div class={`${prefixCls.value}-custom--name-option`}>
            {opts.allowSort && opts.showSortDragButton && (
              <span class={`${prefixCls.value}-custom--sort-btn`}>
                <HolderOutlined />
              </span>
            )}
            <span
              class={`${prefixCls.value}-custom--label`}
              innerHTML={column.type === 'html' ? column.getTitle() : undefined}
            >
              {column.type === 'html' ? undefined : column.getTitle()}
            </span>
          </div>
          {(opts.showSortMoveButton || opts.showSortPutButton) && (
            <div class={`${prefixCls.value}-custom--move-option`}>
              {opts.showSortMoveButton && (
                <>
                  <Button
                    disabled={index === 0}
                    icon={<CaretUpOutlined />}
                    onClick={() => moveColumn(column, -1)}
                    size="small"
                    {...{ title: locale?.value?.customMoveUp }}
                    type="text"
                  />
                  <Button
                    disabled={index >= treeRows.value.length - 1}
                    icon={<CaretDownOutlined />}
                    onClick={() => moveColumn(column, 1)}
                    size="small"
                    {...{ title: locale?.value?.customMoveDown }}
                    type="text"
                  />
                </>
              )}
              {opts.showSortPutButton && (
                <>
                  <Button
                    icon={<VerticalAlignTopOutlined />}
                    onClick={() => putColumn(column, true)}
                    size="small"
                    {...{ title: locale?.value?.customMoveTop }}
                    type="text"
                  />
                  <Button
                    icon={<VerticalAlignBottomOutlined />}
                    onClick={() => putColumn(column, false)}
                    size="small"
                    {...{ title: locale?.value?.customMoveBottom }}
                    type="text"
                  />
                </>
              )}
            </div>
          )}
          {opts.allowFixed && (
            <div class={`${prefixCls.value}-custom--fixed-option`}>
              <Button
                class={{
                  'is--active': column.renderFixed === 'left',
                }}
                disabled={
                  disabled ||
                  (isMaxFixedColumn.value && column.renderFixed !== 'left')
                }
                icon={<PushpinOutlined />}
                onClick={(evnt: MouseEvent) =>
                  changeFixedOption(column, 'left', evnt)
                }
                size="small"
                {...{
                  title:
                    column.renderFixed === 'left'
                      ? locale?.value?.customFixedNone
                      : locale?.value?.customFixedLeft,
                }}
                type="text"
              />
              <Button
                class={{
                  'is--active': column.renderFixed === 'right',
                }}
                disabled={
                  disabled ||
                  (isMaxFixedColumn.value && column.renderFixed !== 'right')
                }
                icon={<PushpinOutlined rotate={270} />}
                onClick={(evnt: MouseEvent) =>
                  changeFixedOption(column, 'right', evnt)
                }
                size="small"
                {...{
                  title:
                    column.renderFixed === 'right'
                      ? locale?.value?.customFixedNone
                      : locale?.value?.customFixedRight,
                }}
                type="text"
              />
            </div>
          )}
        </li>
      );
    };

    const renderSimplePanel = () => {
      const opts = customOpts.value;
      const bodySlot = getSlot('default');
      return (
        <div
          class={[
            ...themeCls.value,
            `${prefixCls.value}-custom-wrapper`,
            `placement--${opts.placement}`,
            { 'is--active': visible.value },
          ]}
          onMouseenter={() => {
            if (opts.trigger !== 'hover') {
              return;
            }

            customStore.activeWrapper = true;
            $asTable.customOpenEvent(new Event('mouseenter'));
          }}
          onMouseleave={() => {
            if (opts.trigger !== 'hover') {
              return;
            }

            customStore.activeWrapper = false;
            setTimeout(() => {
              if (!customStore.activeBtn && !customStore.activeWrapper) {
                $asTable.customCloseEvent(new Event('mouseleave'));
              }
            }, 300);
          }}
          ref={refElem}
          style={customStore.defPopupStyle}
        >
          <div
            class={`${prefixCls.value}-custom-simple--body-wrapper`}
            ref={refBodyWrapperElem}
          >
            <div class={`${prefixCls.value}-custom--header`}>
              {opts.allowVisible ? (
                <div
                  class={`${prefixCls.value}-custom--checkbox-option`}
                  onClick={allOptionEvent}
                >
                  <Checkbox
                    checked={customStore.isAll}
                    indeterminate={customStore.isIndeterminate}
                    style={{ pointerEvents: 'none' }}
                  />
                  <span class={`${prefixCls.value}-custom--checkbox-label`}>
                    {locale?.value?.customAll}
                  </span>
                </div>
              ) : (
                <span class={`${prefixCls.value}-custom--title`}>
                  {locale?.value?.customTitle}
                </span>
              )}
              <div class={`${prefixCls.value}-custom--header-actions`}>
                {renderActions()}
              </div>
            </div>
            <div
              class={`${prefixCls.value}-custom--body`}
              ref={refCustomBodyElem}
            >
              {renderSlot('top')}
              {bodySlot ? (
                $asTable.callSlot(bodySlot, slotParams.value)
              ) : (
                <ul class={`${prefixCls.value}-custom--panel-list`}>
                  {treeRows.value.map((row, index) =>
                    renderRowOption(row.column, index, row.level),
                  )}
                </ul>
              )}
              {renderSlot('bottom')}
            </div>
          </div>
          {dragTipVNs()}
        </div>
      );
    };

    const renderPopupTable = () => {
      const opts = customOpts.value;
      const alignCell = (
        column: ColumnInfo,
        property: string,
        renderProperty: string,
        eName: string,
      ) => (
        <RadioGroup
          onChange={(evnt: any) => {
            changeAlignOption(
              column,
              evnt.target.value,
              property,
              renderProperty,
              eName,
            );
          }}
          options={alignOptions.value}
          optionType="button"
          size="small"
          value={(column as any)[renderProperty] || 'left'}
        />
      );
      return (
        <div class={`${prefixCls.value}-custom-popup-body`}>
          <table class={`${prefixCls.value}-custom-popup-table`}>
            <colgroup>
              {opts.allowVisible && <col style={{ width: '40px' }} />}
              <col style={{ width: '110px' }} />
              {opts.allowResizable && <col style={{ width: '110px' }} />}
              {opts.allowFixed && <col style={{ width: '80px' }} />}
              {opts.allowAlign && <col style={{ width: '130px' }} />}
              {opts.allowHeaderAlign && <col style={{ width: '130px' }} />}
              {opts.allowFooterAlign && <col style={{ width: '130px' }} />}
            </colgroup>
            <thead>
              <tr>
                {opts.allowVisible && (
                  <th>
                    <Checkbox
                      checked={customStore.isAll}
                      indeterminate={customStore.isIndeterminate}
                      onChange={(evnt: any) => {
                        $asTable.setCustomAllCheckbox(evnt.target.checked);
                      }}
                    />
                  </th>
                )}
                <th>{locale?.value?.customColTitle}</th>
                {opts.allowResizable && (
                  <th>{locale?.value?.customColWidth}</th>
                )}
                {opts.allowFixed && <th>{locale?.value?.customColFixed}</th>}
                {opts.allowAlign && <th>{locale?.value?.customColAlign}</th>}
                {opts.allowHeaderAlign && (
                  <th>{locale?.value?.customColHeaderAlign}</th>
                )}
                {opts.allowFooterAlign && (
                  <th>{locale?.value?.customColFooterAlign}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {treeRows.value.map((row) => {
                const { column, level } = row;
                const disabled = isColumnDisabled(column);
                const isGroup = !!(
                  column.children && column.children.length > 0
                );
                return (
                  <tr
                    class={[
                      `${prefixCls.value}-custom-popup--row`,
                      `level--${level}`,
                      {
                        'is--hidden': disabled || !column.renderVisible,
                        'is--group': isGroup,
                        'is--drag-top':
                          dragState.overId === column.id &&
                          dragState.pos === 'top',
                        'is--drag-bottom':
                          dragState.overId === column.id &&
                          dragState.pos === 'bottom',
                      },
                    ]}
                    draggable={!!opts.allowSort}
                    key={column.id}
                    onDragend={handleDragend}
                    onDragover={(evnt: DragEvent) =>
                      handleDragover(evnt, column)
                    }
                    onDragstart={(evnt: DragEvent) =>
                      handleDragstart(evnt, column)
                    }
                    onDrop={handleDrop}
                  >
                    {opts.allowVisible && (
                      <td>
                        <Checkbox
                          checked={!!column.renderVisible}
                          disabled={disabled}
                          indeterminate={!!column.halfVisible}
                          onChange={() =>
                            changeCheckboxOption(column, new Event('change'))
                          }
                        />
                      </td>
                    )}
                    <td>
                      <span
                        class={`${prefixCls.value}-custom-popup--name`}
                        style={{ paddingLeft: `${(level - 1) * 12}px` }}
                      >
                        {column.getTitle()}
                      </span>
                    </td>
                    {opts.allowResizable && (
                      <td>
                        {isGroup ? (
                          '-'
                        ) : (
                          <InputNumber
                            disabled={disabled}
                            max={column.maxWidth}
                            min={column.minWidth}
                            onChange={(value: any) => {
                              column.renderResizeWidth = Number(value);
                              changeColumnWidth(column);
                            }}
                            onUpdate:value={(value: any) => {
                              column.renderResizeWidth = Number(value);
                            }}
                            size="small"
                            type="number"
                            value={column.renderResizeWidth}
                          />
                        )}
                      </td>
                    )}
                    {opts.allowFixed && (
                      <td>
                        <div class={`${prefixCls.value}-custom--fixed-option`}>
                          <Button
                            class={{
                              'is--active': column.renderFixed === 'left',
                            }}
                            disabled={
                              disabled ||
                              (isMaxFixedColumn.value &&
                                column.renderFixed !== 'left')
                            }
                            icon={<PushpinOutlined />}
                            onClick={(evnt: MouseEvent) =>
                              changeFixedOption(column, 'left', evnt)
                            }
                            size="small"
                            type="text"
                          />
                          <Button
                            class={{
                              'is--active': column.renderFixed === 'right',
                            }}
                            disabled={
                              disabled ||
                              (isMaxFixedColumn.value &&
                                column.renderFixed !== 'right')
                            }
                            icon={<PushpinOutlined rotate={270} />}
                            onClick={(evnt: MouseEvent) =>
                              changeFixedOption(column, 'right', evnt)
                            }
                            size="small"
                            type="text"
                          />
                        </div>
                      </td>
                    )}
                    {opts.allowAlign && (
                      <td>
                        {isGroup
                          ? '-'
                          : alignCell(
                              column,
                              'align',
                              'renderAlign',
                              'customAlignChange',
                            )}
                      </td>
                    )}
                    {opts.allowHeaderAlign && (
                      <td>
                        {alignCell(
                          column,
                          'headerAlign',
                          'renderHeaderAlign',
                          'customHeaderAlignChange',
                        )}
                      </td>
                    )}
                    {opts.allowFooterAlign && (
                      <td>
                        {alignCell(
                          column,
                          'footerAlign',
                          'renderFooterAlign',
                          'customFooterAlignChange',
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    };

    const renderPopupPanel = () => {
      const opts = customOpts.value;
      const innerWidth =
        typeof window === 'undefined' ? 1200 : window.innerWidth;
      const content = (
        <>
          {renderSlot('top')}
          {renderPopupTable()}
          {renderSlot('bottom')}
          {dragTipVNs()}
        </>
      );
      if (opts.mode === 'drawer') {
        return (
          <Drawer
            classes={{ body: `${prefixCls.value}-custom--drawer-body` }}
            destroyOnHidden
            footer={opts.showFooter ? () => renderPopupActions() : undefined}
            mask={{
              closable: false,
            }}
            onClose={() => cancelCloseEvent()}
            open={visible.value}
            placement="right"
            rootClass={`${prefixCls.value}-custom-drawer-wrapper ${prefixCls.value}--ignore-clear`}
            title={locale?.value?.customTitle}
            width={Math.min(880, innerWidth * 0.6)}
          >
            <div
              class={`${prefixCls.value}-custom--popup-content`}
              ref={refElem}
            >
              {content}
            </div>
          </Drawer>
        );
      }
      return (
        <Modal
          bodyStyle={{
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
          }}
          centered
          destroyOnHidden
          footer={opts.showFooter ? () => renderPopupActions() : () => null}
          mask={{
            closable: false,
          }}
          onCancel={() => cancelCloseEvent()}
          open={visible.value}
          rootClass={`${prefixCls.value}-custom-modal-wrapper ${prefixCls.value}--ignore-clear`}
          title={locale?.value?.customTitle}
          width={Math.min(1000, innerWidth)}
        >
          <div class={`${prefixCls.value}-custom--popup-content`} ref={refElem}>
            {content}
          </div>
        </Modal>
      );
    };

    const refMaps = {
      refElem,
    };

    context.expose({
      getRefMaps: () => refMaps,
    });

    return () => {
      const mode = customOpts.value.mode;
      if (mode === 'modal' || mode === 'drawer') {
        return renderPopupPanel();
      }
      return renderSimplePanel();
    };
  },
});
