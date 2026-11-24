<script lang="ts" setup>
import { h, nextTick, reactive, ref, watch } from 'vue';

import {
  CopyOutlined,
  DeleteOutlined,
  MoreOutlined,
  ReloadOutlined,
  SettingOutlined,
  StopOutlined,
} from '@arvin-studio/icons';
import { Column, ConfigProvider, Table } from '@arvin-studio/ui';
import enUS from '@arvin-studio/ui/locale/en_US';
// 1. 导入语言包（如果 @arvin-studio/ui 的路径不同，请按实际调整）
import zhCN from '@arvin-studio/ui/locale/zh_CN';

interface RowVO {
  address: string;
  content: string;
  date: string;
  name: string;
  rate: number;
  role: string;
}

const tableData = ref<RowVO[]>([
  {
    name: 'Test1',
    role: '前端',
    date: '2020-02-28',
    rate: 5,
    address: 'address1',
    content: 'xxxxx1<br>换行换行11111111111',
  },
  {
    name: 'Test2',
    role: '后端',
    date: '2020-02-22',
    rate: 2,
    address: 'address2',
    content: 'xxxxx1<br>换行换行2',
  },
  {
    name: 'Test3',
    role: '前端',
    date: '2020-01-01',
    rate: 0,
    address: 'address3',
    content: 'xxxxx1<br>换行换行<br>3333',
  },
  {
    name: 'Test4',
    role: '设计师',
    date: '2020-02-23',
    rate: 1,
    address: 'address4',
    content: 'xxxxx1<br>换行换行4',
  },
  {
    name: 'Test5',
    role: '前端',
    date: '2020-01-20',
    rate: 3,
    address: 'address5',
    content: 'xxxxx1<br>换行换行55',
  },
]);

const headerTooltipConfig = reactive<any>({
  showAll: true,
  enterable: true,
  contentMethod: ({ column }) => {
    const { field, title } = column;
    // 重写默认的提示内容
    if (field === 'date' || field === 'rate') {
      return `自定义表头：${title}`;
    }
    // 其余的单元格使用默认行为
    return null;
  },
});

const tooltipConfig = reactive<any>({
  showAll: true,
  enterable: true,
  contentMethod: ({ column, row }) => {
    const { field } = column;
    // 重写默认的提示内容
    if (field === 'date' || field === 'rate') {
      return `自定义单元格：${row[field]}`;
    }
    // 其余的单元格使用默认行为
    return null;
  },
});

const footerTooltipConfig = reactive<any>({
  showAll: true,
  enterable: true,
  contentMethod: ({ column, row }) => {
    const { field } = column;
    // 重写默认的提示内容
    if (field === 'date' || field === 'rate') {
      return `自定义表尾：${row[field]}`;
    }
    // 其余的单元格使用默认行为
    return null;
  },
});

const footerData = ref<any>([{ seq: '合计', date: '2020-09-05', rate: 999.8 }]);

const customConfig = reactive<any>({
  allowAlign: true,
  allowFixed: true,
  allowFooterAlign: true,
  allowHeaderAlign: true,
  allowResizable: true,
  allowSort: true,
  allowVisible: true,
  mode: 'simple',
  showFooter: true,
});

const tableRef = ref<any>();
const exportConfig = reactive<any>({
  types: ['csv', 'txt', 'html', 'xml'],
});
const importConfig = reactive<any>({
  types: ['csv', 'txt'],
});

const openExport = () => {
  tableRef.value?.openExport?.();
};

const openImport = () => {
  tableRef.value?.openImport?.();
};

const openCustom = (mode: 'drawer' | 'modal' | 'simple') => {
  customConfig.mode = mode;
  nextTick(() => {
    tableRef.value?.openCustom?.();
  });
};

const menuConfig = reactive<any>({
  header: {
    options: [
      [
        { code: 'header-clear-sort', name: '清除排序' },
        { code: 'header-clear-filter', name: '清除筛选' },
        { code: 'header-custom', name: '个性化设置' },
      ],
    ],
  },
  body: {
    options: [
      [
        {
          code: 'body-copy',
          name: '复制名称',
          prefixIcon: () => h(CopyOutlined),
          suffixConfig: { content: '⌘C' },
        },
        {
          code: 'body-remove',
          name: '删除行',
          prefixIcon: () => h(DeleteOutlined),
        },
      ],
      [
        {
          code: 'body-more',
          name: '更多操作',
          prefixIcon: () => h(MoreOutlined),
          children: [
            {
              code: 'body-reload',
              name: '重新加载',
              prefixIcon: () => h(ReloadOutlined),
            },
            {
              code: 'body-setting',
              name: '设置',
              prefixIcon: () => h(SettingOutlined),
            },
          ],
        },
      ],
      [
        {
          code: 'body-disabled',
          name: '禁用项',
          disabled: true,
          prefixIcon: () => h(StopOutlined),
        },
      ],
    ],
  },
  footer: {
    options: [[{ code: 'footer-total', name: '合计' }]],
  },
});

const handleMenuClick = ({ menu, row, $table }: any) => {
  switch (menu?.code) {
    case 'body-copy': {
      if (row?.name) {
        void navigator.clipboard?.writeText(String(row.name));
      }
      break;
    }
    case 'body-remove': {
      if (row) {
        tableData.value = tableData.value.filter((item) => item !== row);
      }
      break;
    }
    case 'header-clear-filter': {
      $table.clearFilter();
      break;
    }
    case 'header-clear-sort': {
      $table.clearSort();
      break;
    }
    case 'header-custom': {
      $table.openCustom();
      break;
    }
    default: {
      break;
    }
  }
};
const locale = ref(zhCN); // 响应式的语言包对象
const currentLang = ref<'en-US' | 'zh-CN'>('zh-CN'); // 语言标识
// 监听语言标识变化，切换对应的语言包
watch(currentLang, (lang) => {
  locale.value = lang === 'zh-CN' ? zhCN : enUS;
});

// 切换函数，供按钮调用
const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'zh-CN' ? 'en-US' : 'zh-CN';
};
</script>

<template>
  <div>
    <ConfigProvider :locale="locale">
      <!-- 2. 添加一个简单的切换按钮 -->
      <button style="margin-bottom: 16px" @click="toggleLanguage">
        切换语言（当前：{{ currentLang === 'zh-CN' ? '中文' : 'English' }}）
      </button>
      <div style="display: flex; gap: 8px; margin-bottom: 16px">
        <button @click="openCustom('simple')">自定义列 · 弹层</button>
        <button @click="openCustom('drawer')">自定义列 · 抽屉</button>
        <button @click="openCustom('modal')">自定义列 · 弹窗</button>
        <button @click="openExport">导出</button>
        <button @click="openImport">导入</button>
      </div>
      <Table
        height="300"
        ref="tableRef"
        :custom-config="customConfig"
        :export-config="exportConfig"
        :import-config="importConfig"
        :edit-config="{
          trigger: 'click',
          mode: 'cell',
          showStatus: true,
        }"
        border="full"
        keep-source
        show-footer
        :row-config="{
          useKey: true,
          resizable: true,
          drag: true,
          isCurrent: true,
          isHover: true,
        }"
        :column-config="{
          isCurrent: true,
          isHover: true,
          useKey: true,
          resizable: true,
          drag: true,
        }"
        :footer-data="footerData"
        :tooltip-config="tooltipConfig"
        :header-tooltip-config="headerTooltipConfig"
        :footer-tooltip-config="footerTooltipConfig"
        :menu-config="menuConfig"
        @menu-click="handleMenuClick"
        show-overflow
        :checkbox-config="{
          labelField: 'name',
          highlight: true,
          range: true,
        }"
        :data="tableData"
      >
        <Column field="seq" type="seq" width="70" row-resize />
        <Column
          field="name"
          title="名称"
          sortable
          :filters="[
            { label: 'Test1', value: 'Test1' },
            { label: 'Test2', value: 'Test2' },
            { label: 'Test3', value: 'Test3' },
            { label: 'Test4', value: 'Test4' },
            { label: 'Test5', value: 'Test5' },
            { label: 'Test6', value: 'Test6' },
            { label: 'Test7', value: 'Test7' },
            { label: 'Test8', value: 'Test8' },
            { label: 'Test9', value: 'Test9' },
            { label: 'Test10', value: 'Test10' },
          ]"
          :edit-render="{ autoFocus: 'input' }"
        >
          <template #edit="{ row }">
            <vxe-input v-model="row.name" />
          </template>
          <template #default="{ row }">
            <span>{{ row.name }}</span>
          </template>
        </Column>
        <Column sortable type="checkbox" field="role" title="角色" />
        <Column field="date" title="Date" />
        <Column field="rate" title="Rate" />
        <Column sort-type="string" sortable field="address" title="Address" />
        <Column type="html" field="content" title="Content" width="200" />
      </Table>
      <Table
        :custom-config="customConfig"
        :edit-config="{
          trigger: 'click',
          mode: 'cell',
          showStatus: true,
        }"
        :round="true"
        stripe
        keep-source
        show-footer
        :row-config="{ useKey: true, resizable: true, drag: true }"
        :column-config="{ useKey: true, resizable: true, drag: true }"
        :footer-data="footerData"
        :tooltip-config="tooltipConfig"
        :header-tooltip-config="headerTooltipConfig"
        :footer-tooltip-config="footerTooltipConfig"
        :menu-config="menuConfig"
        @menu-click="handleMenuClick"
        show-overflow
        :checkbox-config="{
          labelField: 'name',
          highlight: true,
          range: true,
        }"
        :data="tableData"
      >
        <Column drag-sort field="seq" type="seq" width="70" row-resize />
        <Column
          field="name"
          title="名称"
          :filters="[
            { label: 'Test1', value: 'Test1' },
            { label: 'Test2', value: 'Test2' },
            { label: 'Test3', value: 'Test3' },
            { label: 'Test4', value: 'Test4' },
            { label: 'Test5', value: 'Test5' },
            { label: 'Test6', value: 'Test6' },
            { label: 'Test7', value: 'Test7' },
            { label: 'Test8', value: 'Test8' },
            { label: 'Test9', value: 'Test9' },
            { label: 'Test10', value: 'Test10' },
          ]"
          :edit-render="{ autoFocus: 'input' }"
        >
          <template #edit="{ row }">
            <vxe-input v-model="row.name" />
          </template>
          <template #default="{ row }">
            <span>{{ row.name }}</span>
          </template>
        </Column>
        <Column type="checkbox" field="role" title="角色" />
        <Column field="date" title="Date" />
        <Column field="rate" title="Rate" />
        <Column field="address" title="Address" />
        <Column
          :filters="[
            { label: 'Test1', value: 'Test1' },
            { label: 'Test2', value: 'Test2' },
            { label: 'Test3', value: 'Test3' },
            { label: 'Test4', value: 'Test4' },
            { label: 'Test5', value: 'Test5' },
            { label: 'Test6', value: 'Test6' },
            { label: 'Test7', value: 'Test7' },
            { label: 'Test8', value: 'Test8' },
            { label: 'Test9', value: 'Test9' },
            { label: 'Test10', value: 'Test10' },
          ]"
          type="html"
          field="content"
          title="Content"
          width="200"
        />
      </Table>
    </ConfigProvider>
  </div>
</template>
