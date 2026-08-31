<script setup lang="ts">
import { ref } from 'vue';

import { Rate } from '@arvin-studio/ui';

/** Rate 演示状态 */
const rateValue = ref(3);
const rateHalf = ref(2.5);
</script>

<template>
  <section id="demo-rate" class="demo-section">
    <h3>Rate</h3>

    <h4>基础（v-model:value）</h4>
    <div class="row">
      <Rate v-model:value="rateValue" />
      <span class="hint">当前：{{ rateValue }}</span>
    </div>

    <h4>allowHalf 半星 / count 数量 / disabled</h4>
    <div class="row">
      <Rate v-model:value="rateHalf" allow-half />
      <Rate v-model:value="rateValue" :count="10" />
      <Rate v-model:value="rateValue" disabled />
    </div>

    <h4>character 自定义 / tooltips 提示</h4>
    <div class="row">
      <Rate v-model:value="rateValue" character="⭐" />
      <Rate v-model:value="rateValue" :tooltips="['很差', '较差', '一般', '满意', '超赞']" />
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
