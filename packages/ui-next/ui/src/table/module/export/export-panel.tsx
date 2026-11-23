import type { PropType } from 'vue';

import type {
  AsTableConstructor,
  AsTableDefines,
} from '../../types/table';

import { computed, defineComponent, inject } from 'vue';

import { eachTree, searchTree } from '@arvin-studio/kit';

import { Button, Checkbox, Input, Modal, Select } from '../../..';
import enUS from '../../../locale/en_US';
import useLocale from '../../../locale/useLocale';
import { formatText } from '../../util';

export default defineComponent({
  name: 'TableExportPanel',
  props: {
    defaultOptions: {
      type: Object as PropType<any>,
      default: () => ({}),
    },
    storeData: {
      type: Object as PropType<any>,
      default: () => ({}),
    },
  },
  setup(props) {
    const $asTable = inject('$asTable') as AsTableConstructor;
    const [locale] = useLocale('Table', enUS.Table);
    const t = (key: string, fallback: string) =>
      (locale?.value as any)?.[key] || fallback;
    const { defaultOptions, storeData } = props;

    const columns = computed<AsTableDefines.ColumnInfo[]>(
      () => storeData.columns || [],
    );

    const isAll = computed(() =>
      (storeData.columns || []).every(
        (column: any) => column.disabled || column.checked,
      ),
    );

    const isIndeterminate = computed(
      () =>
        !isAll.value &&
        (storeData.columns || []).some(
          (column: any) =>
            !column.disabled && (column.checked || column.halfChecked),
        ),
    );

    const updateParentCheck = (column: any) => {
      const match = (searchTree as any)(
        storeData.columns || [],
        (item: any) => item === column,
        { children: 'children' },
      );
      let parent = match && match.parent;
      while (parent) {
        parent.checked = (parent.children || []).every(
          (child: any) => child.checked,
        );
        parent.halfChecked =
          !parent.checked &&
          (parent.children || []).some(
            (child: any) => child.checked || child.halfChecked,
          );
        const parentMatch = (searchTree as any)(
          storeData.columns || [],
          (item: any) => item === parent,
          { children: 'children' },
        );
        parent = parentMatch && parentMatch.parent;
      }
    };

    const changeOption = (column: any) => {
      if (column.disabled) {
        return;
      }
      const checked = !column.checked;
      eachTree(
        [column],
        (item: any) => {
          item.checked = checked;
          item.halfChecked = false;
        },
        { children: 'children' },
      );
      updateParentCheck(column);
    };

    const allColumnEvent = () => {
      const checked = !isAll.value;
      eachTree(
        storeData.columns || [],
        (column: any) => {
          if (column.disabled) {
          	return;
          }

          column.checked = checked;
          column.halfChecked = false;
        },
        { children: 'children' },
      );
    };

    const getExportOption = () => {
      const checkedColumns = (searchTree as any)(
        storeData.columns || [],
        (column: any) => column.checked,
        { children: 'children', original: true },
      );
      return {
        ...defaultOptions,
        _columns: checkedColumns,
        isMerge:
          defaultOptions.isMerge && isAll.value
            ? defaultOptions.isMerge
            : false,
      };
    };

    const cancelEvent = () => {
      storeData.visible = false;
    };

    const confirmEvent = () => {
      const options = getExportOption();
      if (storeData.isPrint) {
        storeData.visible = false;
        Promise.resolve($asTable.print(options)).catch(() => undefined);
      } else {
        Promise.resolve($asTable.exportData(options)).then(() => {
          storeData.visible = false;
        });
      }
    };

    const getColumnTitle = (column: any) =>
      formatText(column.getTitle ? column.getTitle() : column.title || '', 1);

    const renderColumn = (column: any, level: number) => {
      const isGroup = column.children && column.children.length > 0;
      return (
        <div key={column.id}>
          <div
            class="as-table-export-panel--column-option"
            onClick={() => changeOption(column)}
            style={{ paddingLeft: `${8 + level * 18}px` }}
            title={column.type === 'html' ? '' : getColumnTitle(column)}
          >
            <Checkbox
              checked={!!column.checked}
              disabled={!!column.disabled}
              indeterminate={!!column.halfChecked}
              style={{ pointerEvents: 'none' }}
            />
            <span class="as-table-export-panel--column-label">
              {column.type === 'html' ? (
                <span innerHTML={getColumnTitle(column)} />
              ) : (
                getColumnTitle(column)
              )}
            </span>
          </div>
          {isGroup
            ? column.children.map((child: any) =>
                renderColumn(child, level + 1),
              )
            : null}
        </div>
      );
    };

    const renderParameter = () => {
      const hasEmptyData = defaultOptions.mode === 'empty';
      const checkboxes = [
        {
          key: 'isHeader',
          label: t('exportHeader', '表头'),
          checked: hasEmptyData ? true : defaultOptions.isHeader,
          disabled: hasEmptyData,
        },
        {
          key: 'isFooter',
          label: t('exportFooter', '表尾'),
          checked: defaultOptions.isFooter,
          disabled: !storeData.hasFooter,
        },
        {
          key: 'isTitle',
          label: t('exportTitleOpt', '标题'),
          checked: hasEmptyData ? false : defaultOptions.isTitle,
          disabled: hasEmptyData || !defaultOptions.isHeader,
        },
        {
          key: 'isColgroup',
          label: t('exportColgroup', '列分组'),
          checked: defaultOptions.isColgroup,
          disabled: !storeData.hasColgroup || !storeData.hasMerge,
        },
        {
          key: 'original',
          label: t('exportOriginal', '原始值'),
          checked: defaultOptions.original,
          disabled: hasEmptyData,
        },
        {
          key: 'isMerge',
          label: t('exportMerge', '合并单元格'),
          checked: defaultOptions.isMerge,
          disabled: !storeData.hasMerge || !isAll.value,
        },
        {
          key: 'useStyle',
          label: t('exportUseStyle', '使用样式'),
          checked: defaultOptions.useStyle,
          disabled: false,
        },
        {
          key: 'isTreeAllExpanded',
          label: t('exportTreeExpand', '展开树节点'),
          checked: defaultOptions.isTreeAllExpanded,
          disabled: !storeData.hasTree,
        },
        {
          key: 'isRowGroupAllExpanded',
          label: t('exportRowGroupExpand', '展开分组'),
          checked: defaultOptions.isRowGroupAllExpanded,
          disabled: !storeData.hasRowGroup,
        },
      ];
      return (
        <div class="as-table-export-panel--params">
          {checkboxes.map((item) => (
            <label class="as-table-export-panel--param" key={item.key}>
              <Checkbox
                checked={!!item.checked}
                disabled={!!item.disabled}
                onUpdate:checked={(checked: boolean) => {
                  defaultOptions[item.key] = checked;
                }}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      );
    };

    const widthModeOptions = [
      { value: 'auto', label: t('exportWidthModeAuto', '自动') },
      { value: 'default', label: t('exportWidthModeDefault', '默认') },
      { value: 'scale', label: t('exportWidthModeScale', '缩放') },
    ];

    const renderFooter = () => (
      <div class="as-table-export-panel--footer">
        <Button onClick={cancelEvent}>
          {t('exportCancel', '取消')}
        </Button>
        <Button onClick={confirmEvent} type="primary">
          {t(storeData.isPrint ? 'exportPrint' : 'exportConfirm', '确定')}
        </Button>
      </div>
    );

    const renderVN = () => {
      const title = storeData.isPrint
        ? t('exportPrintTitle', '打印')
        : t('exportTitle', '导出');
      return (
        <Modal
          bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
          class="as-table-export-popup"
          footer={renderFooter}
          onCancel={cancelEvent}
          open={!!storeData.visible}
          title={title}
          width={660}
        >
          <div class="as-table-export-panel">
            <div class="as-table-export-panel--field">
              <label>{t('exportName', '文件名')}</label>
              <Input
                onUpdate:value={(value: any) => {
                  defaultOptions.filename = value;
                }}
                placeholder={t('exportNamePlaceholder', '请输入文件名')}
                value={defaultOptions.filename}
              />
            </div>
            <div class="as-table-export-panel--field">
              <label>{t('exportType', '文件类型')}</label>
              <Select
                onUpdate:value={(value: any) => {
                  defaultOptions.type = value;
                }}
                options={storeData.typeList}
                value={defaultOptions.type}
              />
            </div>
            <div class="as-table-export-panel--field">
              <label>{t('exportSheetName', '工作表名')}</label>
              <Input
                onUpdate:value={(value: any) => {
                  defaultOptions.sheetName = value;
                }}
                placeholder={t('exportSheetNamePlaceholder', '请输入工作表名')}
                value={defaultOptions.sheetName}
              />
            </div>
            <div class="as-table-export-panel--field">
              <label>{t('exportMode', '数据范围')}</label>
              <Select
                onUpdate:value={(value: any) => {
                  defaultOptions.mode = value;
                }}
                options={storeData.modeList}
                value={defaultOptions.mode}
              />
            </div>
            <div class="as-table-export-panel--field is--column">
              <label>{t('exportColumn', '列')}</label>
              <div class="as-table-export-panel--columns">
                <div
                  class="as-table-export-panel--column-option is--all"
                  onClick={allColumnEvent}
                  title={t('allTitle', '全选/取消')}
                >
                  <Checkbox
                    checked={isAll.value}
                    indeterminate={isIndeterminate.value}
                    style={{ pointerEvents: 'none' }}
                  />
                  <span class="as-table-export-panel--column-label">
                    {t('allTitle', '全选/取消')}
                  </span>
                </div>
                <div class="as-table-export-panel--column-body">
                  {columns.value.map((column) => renderColumn(column, 0))}
                </div>
              </div>
            </div>
            {storeData.isPrint ? (
              <div class="as-table-export-panel--field">
                <label>{t('exportWidthMode', '宽度模式')}</label>
                <Select
                  onUpdate:value={(value: any) => {
                    defaultOptions.widthMode = value;
                  }}
                  options={widthModeOptions}
                  value={defaultOptions.widthMode}
                />
              </div>
            ) : null}
            <div class="as-table-export-panel--field is--params">
              <label>{t('exportOpts', '参数')}</label>
              <div>{renderParameter()}</div>
            </div>
          </div>
        </Modal>
      );
    };

    return renderVN;
  },
});
