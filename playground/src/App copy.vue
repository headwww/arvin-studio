<script setup lang="ts">
import type { VxeGridProps, VxeTablePropTypes } from 'vxe-table';

import { onMounted, reactive, ref } from 'vue';

import { Column, Table } from '@arvin-studio/ui';

import { VxeColumn, VxeTable } from 'vxe-table';

interface RowVO {
  address: string;
  age: number;
  date: string;
  id: number;
  name: string;
  role: string;
  sex: string;
}

const aggregateConfig = reactive<VxeTablePropTypes.AggregateConfig<RowVO>>({
  groupFields: ['role'],
});

const tableData = ref<RowVO[]>([
  {
    id: 10_001,
    name: 'Test1',
    role: 'Develop',
    sex: 'Woman',
    age: 28,
    date: '2025-02-01',
    address: 'test abc',
  },
  {
    id: 10_002,
    name: 'Test2',
    role: 'Test',
    sex: 'Man',
    age: 22,
    date: '2025-01-01',
    address: 'Guangzhou',
  },
  {
    id: 10_003,
    name: 'Test3',
    role: 'PM',
    sex: 'Woman',
    age: 32,
    date: '2025-05-01',
    address: 'Shanghai',
  },
  {
    id: 10_004,
    name: 'Test4',
    role: 'Designer',
    sex: 'Man',
    age: 32,
    date: '2025-01-01',
    address: 'test abc',
  },
  {
    id: 10_005,
    name: 'Test5',
    role: 'Develop',
    sex: 'Man',
    age: 30,
    date: '2025-01-01',
    address: 'Shanghai',
  },
  {
    id: 10_006,
    name: 'Test6',
    role: 'Designer',
    sex: 'Man',
    age: 30,
    date: '2025-03-01',
    address: 'test abc',
  },
  {
    id: 10_007,
    name: 'Test7',
    role: 'Test',
    sex: 'Woman',
    age: 29,
    date: '2025-05-01',
    address: 'test abc',
  },
  {
    id: 10_008,
    name: 'Test8',
    role: 'PM',
    sex: 'Woman',
    age: 35,
    date: '2025-11-01',
    address: 'test abc',
  },
  {
    id: 10_009,
    name: 'Test9',
    role: 'Test',
    sex: 'Man',
    age: 21,
    date: '2025-05-01',
    address: 'test abc',
  },
  {
    id: 10_010,
    name: 'Test10',
    role: 'PM',
    sex: 'Woman',
    age: 28,
    date: '2025-03-01',
    address: 'test abc',
  },
  {
    id: 10_011,
    name: 'Test11',
    role: 'Test',
    sex: 'Woman',
    age: 29,
    date: '2025-03-01',
    address: 'test abc',
  },
  {
    id: 10_012,
    name: 'Test12',
    role: 'Develop',
    sex: 'Man',
    age: 37,
    date: '2025-10-01',
    address: 'test abc',
  },
  {
    id: 10_013,
    name: 'Test13',
    role: 'Test',
    sex: 'Woman',
    age: 24,
    date: '2025-02-01',
    address: 'test abc',
  },
  {
    id: 10_014,
    name: 'Test14',
    role: 'Develop',
    sex: 'Man',
    age: 34,
    date: '2025-08-01',
    address: 'test abc',
  },
  {
    id: 10_015,
    name: 'Test15',
    role: 'Designer',
    sex: 'Man',
    age: 21,
    date: '2025-05-01',
    address: 'test abc',
  },
  {
    id: 10_016,
    name: 'Test16',
    role: 'Designer',
    sex: 'Woman',
    age: 21,
    date: '2025-10-01',
    address: 'test abc',
  },
  {
    id: 10_017,
    name: 'Test17',
    role: 'Test',
    sex: 'Man',
    age: 31,
    date: '2025-12-01',
    address: 'test abc',
  },
  {
    id: 10_018,
    name: 'Test18',
    role: 'Develop',
    sex: 'Woman',
    age: 32,
    date: '2025-10-01',
    address: 'test abc',
  },
  {
    id: 10_019,
    name: 'Test19',
    role: 'Test',
    sex: 'Man',
    age: 37,
    date: '2025-02-01',
    address: 'test abc',
  },
]);

onMounted(() => {
  tableData.value.push({
    id: 10_020,
    name: 'Test20',
    role: 'Develop',
    sex: 'Man',
    age: 41,
    date: '2025-03-01',
    address: 'test abc',
  });
});

const gridOptions = reactive<VxeGridProps<RowVO>>({
  columns: [
    {
      slots: {
        defa,
      },
    },
  ],
});
</script>

<template>
  <Table :data="tableData">
    <Column />
  </Table>
  <VxeTable :aggregate-config="aggregateConfig" :data="tableData">
    <VxeColumn
      sortable
      field="name"
      :sort-config="{
        multiple: true,
      }"
      title="Name"
      min-width="300"
      row-group-node
    />
    <VxeColumn so sortable field="role" title="Role" />
    <VxeColumn field="sex" title="Sex" />
    <VxeColumn sortable agg-func="sum" field="age" title="Age" />
    <VxeColumn field="address" title="Address" />
  </VxeTable>
</template>
