<script setup lang="ts">
import { ref } from 'vue';

import { Button, Steps } from '@arvin-studio/ui';

/** Steps 演示状态 */
const current = ref(1);
/** items 配置式（title / content） */
const stepItems = [
  { key: 's1', title: '填写信息', content: '第一步描述' },
  { key: 's2', title: '确认订单', content: '第二步描述' },
  { key: 's3', title: '完成支付', content: '第三步描述' },
];

const next = () => {
  current.value = Math.min(stepItems.length - 1, current.value + 1);
};
const prev = () => {
  current.value = Math.max(0, current.value - 1);
};
</script>

<template>
  <section id="demo-steps" class="demo-section">
    <h3>Steps</h3>

    <h4>基础（items + v-model:current + 操作按钮）</h4>
    <div class="steps-box">
      <Steps v-model:current="current" :items="stepItems" />
    </div>
    <div class="row">
      <Button @click="prev" :disabled="current === 0">上一步</Button>
      <Button
        type="primary"
        @click="next"
        :disabled="current === stepItems.length - 1"
      >
        下一步
      </Button>
      <span class="hint">当前第 {{ current + 1 }} 步</span>
    </div>

    <h4>status 状态（error 中断）</h4>
    <div class="steps-box">
      <Steps :items="stepItems" status="error" />
    </div>

    <h4>orientation 垂直方向</h4>
    <div class="steps-box">
      <Steps orientation="vertical" :items="stepItems" :current="2" />
    </div>

    <h4>type 变体（dot / navigation）</h4>
    <div class="steps-box">
      <Steps type="dot" :items="stepItems" :current="1" />
    </div>
    <div class="steps-box">
      <Steps type="navigation" :items="stepItems" :current="1" />
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

.steps-box {
  width: 100%;
  max-width: 720px;
  padding: 8px 0;
}
</style>
