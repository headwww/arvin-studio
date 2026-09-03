<script setup lang="ts">
import { Timeline, TimelineItem } from '@arvin-studio/ui';

/** items 配置式（title 时间标签 + content 内容） */
const items = [
  { key: '1', title: '2024-01-01', content: '创建任务' },
  { key: '2', title: '2024-01-05', content: '开发中' },
  { key: '3', title: '2024-01-20', content: '完成开发' },
];
</script>

<template>
  <section id="demo-timeline" class="demo-section">
    <h3>Timeline</h3>

    <h4>基础（items 配置式 / TimelineItem 子项）</h4>
    <div class="tl-box">
      <Timeline :items="items" />
    </div>
    <div class="tl-box">
      <Timeline>
        <TimelineItem content="创建项目" />
        <TimelineItem content="编码实现" />
        <TimelineItem content="测试发布" />
      </Timeline>
    </div>

    <h4>颜色 / 图标 / 自定义点</h4>
    <div class="tl-box">
      <Timeline>
        <TimelineItem color="green" content="成功步骤" />
        <TimelineItem color="red" content="失败步骤" />
        <TimelineItem color="gray" content="等待步骤" />
        <TimelineItem icon="🎉" content="自定义图标" />
      </Timeline>
    </div>

    <h4>mode="alternate" 交替（带时间标签）</h4>
    <div class="tl-box">
      <Timeline mode="alternate" :items="items" />
    </div>

    <h4>pending 待定 / reverse 倒序</h4>
    <div class="tl-box">
      <Timeline :items="items" pending="进行中..." />
    </div>
    <div class="tl-box">
      <Timeline :items="items" reverse />
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

.tl-box {
  width: 100%;
  max-width: 480px;
  padding: 8px 0;
}
</style>
