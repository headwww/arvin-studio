<script lang="ts" setup>
import type { VxeColumnPropTypes } from 'vxe-table';

import { ref } from 'vue';

interface RowVO {
  address: string;
  age: number;
  id: number;
  name: string;
  role: string;
  sex: string;
}

const tableData = ref<RowVO[]>([
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
    age: 24,
    address: 'Shanghai',
  },
]);

const sexOptions = ref<VxeColumnPropTypes.Filters>([
  { label: 'Man', value: 'Man' },
  { label: 'Woman', value: 'Woman' },
]);

const ageOptions = ref<VxeColumnPropTypes.Filters>([
  { label: '28', value: 28 },
  { label: '22', value: 22 },
  { label: '38', value: 38 },
]);
</script>

<template>
  <div>
    <vxe-table
      :filter-config="{ transfer: true }"
      border
      height="400"
      :data="tableData"
    >
      <vxe-column field="id" title="ID" />
      <vxe-column field="name" title="Name" />
      <vxe-column
        field="sex"
        title="Sex"
        :filters="sexOptions"
        :filter-multiple="false"
      />
      <vxe-column field="age" title="Age" :filters="ageOptions" />
      <vxe-column field="time" title="Time" />
    </vxe-table>
    <vxe-table
      :filter-config="{ transfer: true }"
      border
      height="400"
      :data="tableData"
    >
      <vxe-column field="id" title="ID" />
      <vxe-column field="name" title="Name" />
      <vxe-column
        field="sex"
        title="Sex"
        :filters="sexOptions"
        :filter-multiple="false"
      />
      <vxe-column field="age" title="Age" :filters="ageOptions" />
      <vxe-column field="time" title="Time" />
    </vxe-table>
    <vxe-table
      :filter-config="{ transfer: true }"
      border
      height="400"
      :data="tableData"
    >
      <vxe-column field="id" title="ID" />
      <vxe-column field="name" title="Name" />
      <vxe-column
        field="sex"
        title="Sex"
        :filters="sexOptions"
        :filter-multiple="false"
      />
      <vxe-column field="age" title="Age" :filters="ageOptions" />
      <vxe-column field="time" title="Time" />
    </vxe-table>
  </div>
</template>
