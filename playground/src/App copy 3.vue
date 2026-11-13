<script lang="ts" setup>
import { ref } from 'vue';

import { Column, Table } from '@arvin-studio/ui';

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
    sex: 'Man',
    age: 28,
    address: 'test abc',
  },
  {
    id: 10_002,
    name: 'Test2',
    role: 'Test',
    sex: 'Women',
    age: 22,
    address: 'Guangzhou',
  },
  {
    id: 10_003,
    name: 'Test3',
    role: 'PM',
    sex: 'Man',
    age: 32,
    address: 'Shanghai',
  },
  {
    id: 10_004,
    name: 'Test4',
    role: 'Designer',
    sex: 'Women',
    age: 24,
    address: 'Shanghai',
  },
]);
</script>

<template>
  <div>
    <Table :data="tableData">
      <Column type="seq" width="70" />
      <Column field="name" title="Name" />
      <Column field="sex" title="Sex" />
      <Column field="age" title="Age" />
    </Table>
  </div>
</template>
