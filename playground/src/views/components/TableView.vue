<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';

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
      <Table
        :edit-config="{
          trigger: 'click',
          mode: 'cell',
          showStatus: true,
        }"
        keep-source
        show-footer
        :row-config="{ useKey: true, resizable: true, drag: true }"
        :column-config="{ useKey: true, resizable: true, drag: true }"
        :footer-data="footerData"
        :tooltip-config="tooltipConfig"
        :header-tooltip-config="headerTooltipConfig"
        :footer-tooltip-config="footerTooltipConfig"
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
          type="checkbox"
          field="name"
          title="名称"
          :edit-render="{ autoFocus: 'input' }"
        >
          <template #edit="{ row }">
            <vxe-input v-model="row.name" />
          </template>
          <template #default="{ row }">
            <span>{{ row.name }}</span>
          </template>
        </Column>
        <Column field="role" title="角色" />
        <Column field="date" title="Date" />
        <Column field="rate" title="Rate" />
        <Column field="address" title="Address" />
        <Column type="html" field="content" title="Content" width="200" />
      </Table>
    </ConfigProvider>
  </div>
</template>
