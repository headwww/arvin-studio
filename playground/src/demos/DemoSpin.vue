<script setup lang="ts">
import { ref } from 'vue';

import { Spin, Switch } from '@arvin-studio/ui';

/** Spin 演示状态 */
const spinLoading = ref(true);
</script>

<template>
  <section id="demo-spin" class="demo-section">
    <h3>Spin</h3>

    <h4>切换加载状态</h4>
    <div class="row">
      <Switch v-model:checked="spinLoading" />
      <span class="hint">{{ spinLoading ? '加载中' : '加载完成' }}</span>
    </div>

    <h4>基础（size 尺寸）</h4>
    <div class="row">
      <Spin :spinning="spinLoading" size="small" />
      <Spin :spinning="spinLoading" />
      <Spin :spinning="spinLoading" size="large" />
    </div>

    <h4>包裹内容（spinning 时遮罩）</h4>
    <div class="spin-box">
      <Spin :spinning="spinLoading" description="加载中...">
        <div class="spin-content">
          <h4>受保护的内容区域</h4>
          <p>加载时此区域会被 Spin 遮罩覆盖。</p>
        </div>
      </Spin>
    </div>

    <h4>自定义 indicator / percent</h4>
    <div class="row">
      <Spin :spinning="true" indicator="⏳" />
      <Spin :spinning="true" :percent="60" />
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

.spin-box {
  width: 100%;
  max-width: 640px;
  padding: 8px 0;
}

.spin-content {
  height: 160px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
}

.spin-content h4 {
  margin: 0 0 8px;
}

.spin-content p {
  margin: 0;
  color: #666;
}
</style>
