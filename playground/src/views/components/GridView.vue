<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { Grid } from '@arvin-studio/ui';

interface RowVO {
  address: string;
  date: string;
  id: number;
  name: string;
  rate: number;
  role: string;
}

const allData: RowVO[] = Array.from({ length: 55 }, (_, index) => ({
  address: `address${index + 1}`,
  date: `2020-02-${String((index % 28) + 1).padStart(2, '0')}`,
  id: index + 1,
  name: `Test${index + 1}`,
  rate: index % 5,
  role: index % 2 === 0 ? '前端' : '后端',
}));

const pagerConfig = reactive({
  currentPage: 1,
  enabled: true,
  pageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  showSizeChanger: true,
  total: allData.length,
});

const gridRef = ref<any>();
const pageData = computed(() => {
  const start = (pagerConfig.currentPage - 1) * pagerConfig.pageSize;
  return allData.slice(start, start + pagerConfig.pageSize);
});

const columns = [
  { type: 'seq', title: '序号', width: 70 },
  { field: 'name', title: '名称', minWidth: 120, sortable: true },
  { field: 'role', title: '角色', width: 100 },
  { field: 'date', title: 'Date', width: 120 },
  { field: 'rate', title: 'Rate', width: 100 },
  { field: 'address', title: 'Address', minWidth: 180 },
];

const handlePageChange = ({ currentPage, pageSize }: any) => {
  pagerConfig.currentPage = currentPage;
  pagerConfig.pageSize = pageSize;
};
</script>

<template>
  <div style="padding: 16px">
    <div style="display: flex; gap: 8px; margin-bottom: 8px">
      <button @click="gridRef?.maximize()">最大化</button>
      <button @click="gridRef?.revert()">还原</button>
    </div>
    <Grid
      ref="gridRef"
      :columns="columns"
      :data="pageData"
      :pager-config="pagerConfig"
      border
      height="520"
      show-overflow
      @page-change="handlePageChange"
    >
      <template #top>
        <div style="padding: 8px 12px; font-weight: 600">Grid 示例（分页 + 顶部插槽）</div>
      </template>
      <template #bottom>
        <div style="padding: 8px 12px; color: #888">底部插槽</div>
      </template>
    </Grid>
  </div>
</template>
