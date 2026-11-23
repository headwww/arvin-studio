import type { PropType } from 'vue';

import type { AsTableConstructor } from '../../types/table';

import { computed, defineComponent, inject } from 'vue';

import { Button, Modal, Select } from '../../..';
import enUS from '../../../locale/en_US';
import useLocale from '../../../locale/useLocale';

export default defineComponent({
  name: 'TableImportPanel',
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

    const hasFile = computed(() => !!storeData.file);

    const parseTypeLabel = computed(() => {
      const { type, typeList } = storeData;
      if (type) {
        const item = (typeList || []).find(
          (option: any) => option.value === type,
        );
        return item ? item.label : `*.${type}`;
      }
      return (typeList || [])
        .map((item: any) => `*.${item.value}`)
        .join(', ');
    });

    const selectFileEvent = () => {
      $asTable
        .readFile({
          types: (storeData.typeList || []).map((item: any) => item.value),
        })
        .then((params) => {
          const { file } = params;
          const type = (file.name.split('.').pop() || '').toLowerCase();
          Object.assign(storeData, {
            file,
            filename: file.name,
            type,
          });
        })
        .catch(() => undefined);
    };

    const clearFileEvent = () => {
      Object.assign(storeData, {
        file: null,
        filename: '',
        type: '',
      });
    };

    const cancelEvent = () => {
      storeData.visible = false;
      (props as any).storeData.visible = false;
      // 关闭后重置 initStore.import
      ($asTable as any).closeImport?.();
    };

    const importEvent = () => {
      if (!storeData.file) {
        return;
      }
      Promise.resolve(
        $asTable.importByFile(storeData.file, { ...defaultOptions }),
      ).then(() => {
        storeData.visible = false;
        ($asTable as any).closeImport?.();
      });
    };

    const renderFooter = () => (
      <div class="as-table-export-panel--footer">
        <Button onClick={cancelEvent}>{t('importCancel', '取消')}</Button>
        <Button disabled={!hasFile.value} onClick={importEvent} type="primary">
          {t('importConfirm', '导入')}
        </Button>
      </div>
    );

    return () => (
      <Modal
        class="as-table-import-popup"
        footer={renderFooter}
        onCancel={cancelEvent}
        open={!!storeData.visible}
        title={t('importTitle', '导入')}
        width={540}
      >
        <div class="as-table-import-panel">
          <div class="as-table-export-panel--field">
            <label>{t('importFile', '文件')}</label>
            <div class="as-table-import-panel--file">
              {hasFile.value ? (
                <div class="as-table-import-panel--selected">
                  <span title={storeData.filename}>{storeData.filename}</span>
                  <Button onClick={clearFileEvent} size="small" type="text">
                    ×
                  </Button>
                </div>
              ) : (
                <Button onClick={selectFileEvent}>
                  {t('importSelectFile', '选择文件')}
                </Button>
              )}
            </div>
          </div>
          <div class="as-table-export-panel--field">
            <label>{t('importType', '文件类型')}</label>
            <div class="as-table-import-panel--type">{parseTypeLabel.value}</div>
          </div>
          <div class="as-table-export-panel--field">
            <label>{t('importMode', '导入模式')}</label>
            <Select
              onUpdate:value={(value: any) => {
                defaultOptions.mode = value;
              }}
              options={storeData.modeList}
              value={defaultOptions.mode}
            />
          </div>
        </div>
      </Modal>
    );
  },
});
