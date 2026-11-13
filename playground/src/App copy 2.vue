<script lang="ts" setup>
import { reactive, ref } from 'vue';

interface RowVO {
  date: string;
  keyId: number;
  name: string;
  parentId: null | number;
  size: number;
  type: string;
}

const tableData = ref<RowVO[]>([
  {
    keyId: 10_000,
    parentId: null,
    name: 'Test1',
    type: 'mp3',
    size: 1024,
    date: '2020-08-01',
  },
  {
    keyId: 10_050,
    parentId: null,
    name: 'Test2',
    type: 'mp4',
    size: 0,
    date: '2021-04-01',
  },
  {
    keyId: 24_300,
    parentId: 10_050,
    name: 'Test3',
    type: 'avi',
    size: 1024,
    date: '2020-03-01',
  },
  {
    keyId: 20_045,
    parentId: 24_300,
    name: 'Test4',
    type: 'html',
    size: 600,
    date: '2021-04-01',
  },
  {
    keyId: 10_053,
    parentId: 24_300,
    name: 'Test5',
    type: 'avi',
    size: 0,
    date: '2021-04-01',
  },
  {
    keyId: 24_330,
    parentId: 10_053,
    name: 'Test6',
    type: 'txt',
    size: 25,
    date: '2021-10-01',
  },
  {
    keyId: 21_011,
    parentId: 10_053,
    name: 'Test7',
    type: 'pdf',
    size: 512,
    date: '2020-01-01',
  },
  {
    keyId: 22_200,
    parentId: 10_053,
    name: 'Test8',
    type: 'js',
    size: 1024,
    date: '2021-06-01',
  },
  {
    keyId: 23_666,
    parentId: null,
    name: 'Test9',
    type: 'xlsx',
    size: 2048,
    date: '2020-11-01',
  },
  {
    keyId: 23_677,
    parentId: 23_666,
    name: 'Test10',
    type: 'js',
    size: 1024,
    date: '2021-06-01',
  },
  {
    keyId: 23_671,
    parentId: 23_677,
    name: 'Test11',
    type: 'js',
    size: 1024,
    date: '2021-06-01',
  },
  {
    keyId: 23_672,
    parentId: 23_677,
    name: 'Test12',
    type: 'js',
    size: 1024,
    date: '2021-06-01',
  },
  {
    keyId: 23_688,
    parentId: 23_666,
    name: 'Test13',
    type: 'js',
    size: 1024,
    date: '2021-06-01',
  },
  {
    keyId: 23_681,
    parentId: 23_688,
    name: 'Test14',
    type: 'js',
    size: 1024,
    date: '2021-06-01',
  },
  {
    keyId: 23_682,
    parentId: 23_688,
    name: 'Test15',
    type: 'js',
    size: 1024,
    date: '2021-06-01',
  },
  {
    keyId: 24_555,
    parentId: null,
    name: 'Test16',
    type: 'avi',
    size: 224,
    date: '2020-10-01',
  },
  {
    keyId: 24_566,
    parentId: 24_555,
    name: 'Test17',
    type: 'js',
    size: 1024,
    date: '2021-06-01',
  },
  {
    keyId: 24_577,
    parentId: 24_555,
    name: 'Test18',
    type: 'js',
    size: 1024,
    date: '2021-06-01',
  },
]);

const treeConfig = reactive<any>({
  transform: true,
  rowField: 'keyId',
  parentField: 'parentId',
});
</script>

<template>
  <div>
    <vxe-table border :tree-config="treeConfig" :data="tableData">
      <vxe-column type="seq" width="70" />
      <vxe-column field="name" title="Name" min-width="300" tree-node />
      <vxe-column field="size" title="Size" />
      <vxe-column field="type" title="Type" />
      <vxe-column field="date" title="Date" />
    </vxe-table>
  </div>
</template>
