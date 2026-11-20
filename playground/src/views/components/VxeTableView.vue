<script lang="ts" setup>
import type { VxeTableInstance } from 'vxe-table';

import { ref } from 'vue';

interface RowVO {
  address: string;
  age: number;
  id: number;
  name: string;
  role: string;
  sex: string;
}

const tableRef = ref<VxeTableInstance<RowVO>>();

const nameOptions = ref([
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
]);

const sexOptions = ref([
  { label: 'Man', value: 'Man' },
  { label: 'Woman', value: 'Woman' },
]);

const ageOptions = ref([
  { label: '28', value: 28 },
  { label: '22', value: 22 },
  { label: '38', value: 38 },
]);

const tableData = ref([
  {
    id: 10_001,
    name: 'Test1',
    role: 'Develop',
    sex: 'Woman',
    age: 28,
    address: 'test abc',
  },
  {
    id: 10_002,
    name: 'Test2',
    role: 'Test',
    sex: 'Man',
    age: 22,
    address: 'Guangzhou',
  },
  {
    id: 10_003,
    name: 'Test3',
    role: 'PM',
    sex: 'Woman',
    age: 32,
    address: 'Shanghai',
  },
  {
    id: 10_004,
    name: 'Test4',
    role: 'Designer',
    sex: 'Man',
    age: 54,
    address: 'Shanghai',
  },
  {
    id: 10_005,
    name: 'Test5',
    role: 'Develop',
    sex: 'Man',
    age: 44,
    address: 'Guangzhou',
  },
  {
    id: 10_006,
    name: 'Test6',
    role: 'Develop',
    sex: 'Woman',
    age: 24,
    address: 'Shanghai',
  },
  {
    id: 10_007,
    name: 'Test7',
    role: 'Test',
    sex: 'Man',
    age: 52,
    address: 'test abc',
  },
  {
    id: 10_008,
    name: 'Test8',
    role: 'PM',
    sex: 'Woman',
    age: 34,
    address: 'Guangzhou',
  },
  {
    id: 10_009,
    name: 'Test9',
    role: 'PM',
    sex: 'Man',
    age: 24,
    address: 'test abc',
  },
  {
    id: 100_010,
    name: 'Test10',
    role: 'Test',
    sex: 'Woman',
    age: 39,
    address: 'Shanghai',
  },
  {
    id: 100_011,
    name: 'Test12',
    role: 'PM',
    sex: 'Woman',
    age: 37,
    address: 'test abc',
  },
  {
    id: 100_012,
    name: 'Test12',
    role: 'Develop',
    sex: 'Man',
    age: 44,
    address: 'test abc',
  },
  {
    id: 100_013,
    name: 'Test13',
    role: 'Develop',
    sex: 'Woman',
    age: 33,
    address: 'Shanghai',
  },
  {
    id: 100_014,
    name: 'Test14',
    role: 'PM',
    sex: 'Man',
    age: 46,
    address: 'Shanghai',
  },
  {
    id: 100_015,
    name: 'Test15',
    role: 'Test',
    sex: 'Woman',
    age: 39,
    address: 'Guangzhou',
  },
  {
    id: 100_016,
    name: 'Test16',
    role: 'Develop',
    sex: 'Man',
    age: 24,
    address: 'test abc',
  },
  {
    id: 100_017,
    name: 'Test17',
    role: 'Test',
    sex: 'Woman',
    age: 42,
    address: 'test abc',
  },
  {
    id: 100_018,
    name: 'Test18',
    role: 'Develop',
    sex: 'Man',
    age: 24,
    address: 'Shanghai',
  },
  {
    id: 100_019,
    name: 'Test19',
    role: 'PM',
    sex: 'Woman',
    age: 51,
    address: 'Guangzhou',
  },
  {
    id: 100_020,
    name: 'Test20',
    role: 'Develop',
    sex: 'Woman',
    age: 49,
    address: 'Shanghai',
  },
]);

const getDataEvent = () => {
  const $table = tableRef.value;
  if ($table) {
    const { visibleData } = $table.getTableData();
    console.log(visibleData);
  }
};
</script>

<template>
  <div>
    <vxe-table ref="tableRef" border height="300" :data="tableData">
      <vxe-column type="seq" width="70" />
      <vxe-column field="name" title="Name" :filters="nameOptions" />
      <vxe-column field="sex" title="Sex" :filters="sexOptions" />
      <vxe-column field="age" title="Age" :filters="ageOptions" />
      <vxe-column field="address" title="Address" />
    </vxe-table>
  </div>
</template>
