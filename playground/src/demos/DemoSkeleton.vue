<script setup lang="ts">
import { ref } from 'vue';

import {
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonInput,
  SkeletonNode,
  Switch,
} from '@arvin-studio/ui';

/** Skeleton 演示状态：loading 切换真实内容与骨架屏 */
const skeletonLoading = ref(true);
</script>

<template>
  <section id="demo-skeleton" class="demo-section">
    <h3>Skeleton</h3>

    <h4>loading 切换（骨架屏 vs 真实内容）</h4>
    <div class="row">
      <Switch v-model:checked="skeletonLoading" />
      <span class="hint">{{ skeletonLoading ? '正在加载骨架屏' : '已加载完成' }}</span>
    </div>
    <div class="skeleton-box">
      <Skeleton :loading="skeletonLoading" active>
        <div>
          <h4>加载完成后的真实内容</h4>
          <p>这里是真实数据渲染的内容。</p>
        </div>
      </Skeleton>
    </div>

    <h4>基础骨架（active + avatar / title / paragraph）</h4>
    <div class="skeleton-box">
      <Skeleton active avatar :paragraph="{ rows: 4 }" />
    </div>

    <h4>round 圆角 + 只有标题</h4>
    <div class="skeleton-box">
      <Skeleton active round />
    </div>

    <h4>子组件（Avatar / Button / Input / Image / Node）</h4>
    <div class="row">
      <SkeletonAvatar active size="large" />
      <SkeletonButton active />
      <SkeletonInput active />
    </div>
    <div class="row">
      <SkeletonImage active />
      <SkeletonNode active>自定义节点</SkeletonNode>
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

.skeleton-box {
  width: 100%;
  max-width: 640px;
  padding: 8px 0;
}
</style>
