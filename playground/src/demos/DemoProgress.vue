<script setup lang="ts">
import { ref } from 'vue';

import { Button, Progress } from '@arvin-studio/ui';

/** Progress 演示状态 */
const percent = ref(30);
const increase = () => {
  percent.value = Math.min(100, percent.value + 10);
};
const decrease = () => {
  percent.value = Math.max(0, percent.value - 10);
};
</script>

<template>
  <section id="demo-progress" class="demo-section">
    <h3>Progress</h3>

    <h4>线型（percent / status / strokeColor）</h4>
    <div class="prog-box">
      <Progress :percent="percent" />
      <Progress :percent="percent" status="active" />
      <Progress :percent="100" status="success" />
      <Progress :percent="70" status="exception" />
      <Progress :percent="60" :stroke-color="{ from: '#108ee9', to: '#87d068' }" />
    </div>
    <div class="row">
      <Button @click="increase">+10</Button>
      <Button @click="decrease">-10</Button>
      <span class="hint">当前：{{ percent }}%</span>
    </div>

    <h4>圆形 / dashboard</h4>
    <div class="row">
      <Progress type="circle" :percent="percent" />
      <Progress type="circle" :percent="percent" status="exception" />
      <Progress type="dashboard" :percent="percent" />
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

.prog-box {
  width: 100%;
  max-width: 640px;
  padding: 8px 0;
}
</style>
