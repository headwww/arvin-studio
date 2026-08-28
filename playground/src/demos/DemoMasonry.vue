<script setup lang="ts">
import { Masonry } from '@arvin-studio/ui';

/** 瀑布流数据：不同高度的卡片 */
const masonryItems = [
  { key: 'm1', height: 120, data: { title: '短卡片' } },
  { key: 'm2', height: 200, data: { title: '中卡片' } },
  { key: 'm3', height: 90, data: { title: '矮卡片' } },
  { key: 'm4', height: 160, data: { title: '卡片四' } },
  { key: 'm5', height: 240, data: { title: '高卡片' } },
  { key: 'm6', height: 130, data: { title: '卡片六' } },
  { key: 'm7', height: 180, data: { title: '卡片七' } },
  { key: 'm8', height: 110, data: { title: '卡片八' } },
];
</script>

<template>
  <section id="demo-masonry" class="demo-section">
    <h3>Masonry</h3>

    <h4>基础（items + columns + #itemRender 插槽）</h4>
    <Masonry :items="masonryItems" :columns="3" :gutter="[12, 12]">
      <template #itemRender="item">
        <div class="ms-card" :style="{ height: `${item.height}px` }">
          <b>{{ item.data.title }}</b>
          <span class="hint">#{{ item.index + 1 }}</span>
        </div>
      </template>
    </Masonry>
  </section>
</template>

<style scoped>
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}

.ms-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1677ff22, #1677ff11);
  border: 1px solid #dbeafe;
  border-radius: 8px;
}

.hint {
  font-size: 12px;
  color: #999;
}
</style>
