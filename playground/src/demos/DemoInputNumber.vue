<script setup lang="ts">
import { ref } from 'vue';

import {
  InputNumber,
} from '@arvin-studio/ui';

/** InputNumber 演示状态 */
const numValue = ref(3);
</script>

<template>
    <section id="demo-inputnumber" class="demo-section">
      <h3>InputNumber</h3>

      <h4>基础（v-model:value）</h4>
      <div class="row">
        <InputNumber v-model:value="numValue" />
        <span>值：{{ numValue }}</span>
      </div>

      <h4>min / max / step / precision</h4>
      <div class="row">
        <InputNumber :min="0" :max="100" :step="5" default-value="50" />
        <InputNumber :precision="2" :step="0.5" default-value="1.5" />
        <span class="hint">支持键盘上下键 / 滚轮 / 步进器调整</span>
      </div>

      <h4>disabled / controls / prefix / suffix</h4>
      <div class="row">
        <InputNumber disabled default-value="3" />
        <InputNumber :controls="false" default-value="7" />
        <InputNumber prefix="¥" suffix="元" default-value="99" />
      </div>
    </section>
</template>

<style scoped>
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
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}
</style>
