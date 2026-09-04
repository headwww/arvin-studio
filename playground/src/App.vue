<script setup lang="ts">
import { Table } from '@arvin-studio/ui';

import { VxeColumn, VxeTable } from 'vxe-table';

import Button from './demos/DemoButton.vue';
import DemoCheckbox from './demos/DemoCheckbox.vue';

import 'vxe-table/es/style.css';
</script>

<template>
  <Table />
  <VxeTable>
    <VxeColumn />
  </VxeTable>
  <Button />
  <DemoCheckbox />
</template>
