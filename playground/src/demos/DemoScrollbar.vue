<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';

import { Button, Scrollbar, Switch } from '@arvin-studio/ui';
import type {
  AsScrollbarDefines,
  AsScrollbarInstance,
} from '@arvin-studio/ui';

const basicRef = ref<AsScrollbarInstance>();
const horizontalRef = ref<AsScrollbarInstance>();
const bothRef = ref<AsScrollbarInstance>();

const rowCount = ref(24);
const autoHide = ref(true);
const visible = ref(true);
const loading = ref(false);

const rows = computed(() =>
  Array.from({ length: rowCount.value }, (_, index) => index + 1),
);
const tags = Array.from({ length: 16 }, (_, index) => `标签 ${index + 1}`);

const scrollInfo = ref('还没有滚动');
const horizontalInfo = ref('还没有滚动');

function handleScroll(params: AsScrollbarDefines.ScrollEventParams) {
  const boundary = [
    params.isTop ? '顶部' : '',
    params.isBottom ? '底部' : '',
    params.isLeft ? '最左' : '',
    params.isRight ? '最右' : '',
  ].filter(Boolean);

  scrollInfo.value = `top: ${Math.round(params.scrollTop)}, left: ${Math.round(
    params.scrollLeft,
  )}${boundary.length > 0 ? `（${boundary.join(' / ')}）` : ''}`;
}

function handleBoundary(
  params: AsScrollbarDefines.ScrollBoundaryEventParams,
) {
  const direction = params.direction;
  if (direction) {
    scrollInfo.value = `到达边界：${direction}`;
  }
}

function handleHorizontalScroll(
  params: AsScrollbarDefines.ScrollEventParams,
) {
  horizontalInfo.value = `left: ${Math.round(params.scrollLeft)}, top: ${Math.round(
    params.scrollTop,
  )}`;
}

function scrollToBottom() {
  basicRef.value?.scrollTo({ top: 9999 });
}

function scrollToTop() {
  basicRef.value?.scrollTo(0, 0);
}

async function addRows() {
  rowCount.value += 8;
  await nextTick();
  await basicRef.value?.recalculate();
}

function readPosition() {
  if (!basicRef.value) {
    return;
  }
  scrollInfo.value = `读取位置 → top: ${basicRef.value.getScrollTop()}, left: ${basicRef.value.getScrollLeft()}`;
}

function resetHorizontal() {
  horizontalRef.value?.clearScroll();
}

function resetBoth() {
  bothRef.value?.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
}
</script>

<template>
  <section id="demo-scrollbar" class="demo-section">
    <h3>Scrollbar 滚动条</h3>

    <div class="demo-grid">
      <div class="demo-card">
        <h4>纵向滚动 + 事件</h4>
        <div class="controls">
          <Switch v-model:checked="autoHide" size="small" /> 自动隐藏
          <Switch v-model:checked="visible" size="small" /> 显示滚动条
        </div>

        <Scrollbar
          ref="basicRef"
          class="v-scroll"
          :auto-hide="autoHide"
          :visible="visible"
          @scroll="handleScroll"
          @scroll-boundary="handleBoundary"
        >
          <div class="list">
            <div v-for="row in rows" :key="row" class="list-item">
              列表项 {{ row }}
            </div>
          </div>
        </Scrollbar>

        <div class="controls">
          <Button size="small" @click="scrollToBottom">滚动到底部</Button>
          <Button size="small" @click="scrollToTop">回到顶部</Button>
          <Button size="small" @click="addRows">追加内容 + 重算</Button>
          <Button size="small" @click="readPosition">读取位置</Button>
        </div>
        <p class="status">{{ scrollInfo }}</p>
      </div>

      <div class="demo-card">
        <h4>横向滚动</h4>
        <Scrollbar
          ref="horizontalRef"
          class="h-scroll"
          @scroll="handleHorizontalScroll"
        >
          <div class="tag-row">
            <div v-for="tag in tags" :key="tag" class="tag">{{ tag }}</div>
          </div>
        </Scrollbar>
        <div class="controls">
          <Button size="small" @click="resetHorizontal">clearScroll</Button>
          <Button
            size="small"
            @click="horizontalRef?.scrollTo({ left: 9999 })"
          >
            滚到最右
          </Button>
        </div>
        <p class="status">{{ horizontalInfo }}</p>
      </div>

      <div class="demo-card">
        <h4>双向滚动 + fluentOverlay + padding</h4>
        <Scrollbar
          ref="bothRef"
          class="both-scroll"
          fluent-overlay
          padding
          :x-config="{ position: 'top' }"
          :y-config="{ position: 'left' }"
        >
          <div class="canvas">
            <span class="canvas-label">900 × 520 的滚动内容</span>
          </div>
        </Scrollbar>
        <div class="controls">
          <Button size="small" @click="resetBoth">回到左上角</Button>
        </div>
      </div>

      <div class="demo-card">
        <h4>native 模式</h4>
        <Scrollbar native class="native-scroll">
          <div class="list">
            <div v-for="row in rows.slice(0, 14)" :key="row" class="list-item">
              native 列表项 {{ row }}
            </div>
          </div>
        </Scrollbar>
      </div>

      <div class="demo-card">
        <h4>loading 状态</h4>
        <div class="controls">
          <Switch v-model:checked="loading" size="small" /> loading
        </div>
        <Scrollbar :loading="loading" class="loading-scroll">
          <div class="list">
            <div v-for="row in rows.slice(0, 8)" :key="row" class="list-item">
              内容 {{ row }}
            </div>
          </div>
        </Scrollbar>
      </div>
    </div>
  </section>
</template>

<style scoped>
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 0 0 12px;
  font-size: 14px;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.demo-card {
  min-width: 0;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 10px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 8px 0;
  font-size: 13px;
  color: #666;
}

.v-scroll {
  height: 220px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.h-scroll {
  height: 84px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.both-scroll {
  height: 260px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.native-scroll,
.loading-scroll {
  height: 180px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.list {
  padding: 8px;
}

.list-item {
  padding: 8px 10px;
  margin-bottom: 6px;
  font-size: 13px;
  background: #fafafa;
  border-radius: 6px;
}

.tag-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  width: max-content;
  padding: 12px;
}

.tag {
  flex: none;
  padding: 8px 16px;
  font-size: 13px;
  color: #1677ff;
  white-space: nowrap;
  background: #e6f4ff;
  border-radius: 999px;
}

.canvas {
  position: relative;
  width: 900px;
  height: 520px;
  background:
    linear-gradient(90deg, rgb(22 119 255 / 8%) 1px, transparent 1px) 0 0 / 40px
      40px,
    linear-gradient(rgb(22 119 255 / 8%) 1px, transparent 1px) 0 0 / 40px 40px,
    #fafcff;
}

.canvas-label {
  position: absolute;
  top: 24px;
  left: 24px;
  padding: 8px 12px;
  font-size: 13px;
  color: #1677ff;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.status {
  min-height: 18px;
  margin: 8px 0 0;
  font-size: 12px;
  color: #888;
}
</style>
