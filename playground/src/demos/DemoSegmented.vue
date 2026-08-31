<script setup lang="ts">
import { ref } from 'vue';

import { Segmented } from '@arvin-studio/ui';

/** Segmented 演示状态 */
const segValue = ref('月');
const segValue2 = ref('vue');
/** 对象 options（含 disabled） */
const segOptions = [
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Solid', value: 'solid', disabled: true },
];
</script>

<template>
  <section id="demo-segmented" class="demo-section">
    <h3>Segmented</h3>

    <h4>基础（options 字符串数组 + v-model:value）</h4>
    <div class="row">
      <Segmented v-model:value="segValue" :options="['日', '周', '月']" />
      <span class="hint">当前：{{ segValue }}</span>
    </div>

    <h4>对象 options（含 disabled）/ 图标</h4>
    <div class="row">
      <Segmented v-model:value="segValue2" :options="segOptions" />
      <Segmented
        :options="[
          { value: 'list', icon: '📋', label: '列表' },
          { value: 'grid', icon: '🔲', label: '网格' },
        ]"
      />
    </div>

    <h4>size / disabled / block</h4>
    <div class="row">
      <Segmented size="small" :options="['S', 'M', 'L']" />
      <Segmented :options="['A', 'B']" disabled />
    </div>
    <div class="row">
      <Segmented block :options="['区块一', '区块二', '区块三']" />
    </div>
  </section>
</template>

<style scoped>
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

.hint {
  color: #999;
  font-size: 12px;
}
</style>
