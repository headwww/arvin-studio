<script setup lang="ts">
import { ref } from 'vue';

import { Button, Empty } from '@arvin-studio/ui';

/** Empty 演示状态：刷新按钮反馈 */
const refreshMsg = ref('');
const onRefresh = () => {
  refreshMsg.value = '已触发刷新（演示）';
};
</script>

<template>
  <section id="demo-empty" class="demo-section">
    <h3>Empty</h3>

    <h4>基础（默认插画 + 默认描述）</h4>
    <div class="empty-box">
      <Empty />
    </div>

    <h4>自定义描述 + 操作区（footer 插槽）</h4>
    <div class="empty-box">
      <Empty description="暂无数据，请稍后重试">
        <Button type="primary" @click="onRefresh">刷新</Button>
        <span class="hint">{{ refreshMsg }}</span>
      </Empty>
    </div>

    <h4>简单图（PRESENTED_IMAGE_SIMPLE）</h4>
    <div class="empty-box">
      <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" description="列表为空" />
    </div>

    <h4>自定义图片 / 描述插槽</h4>
    <div class="empty-box">
      <Empty>
        <template #image>🔍</template>
        <template #description>
          <b>没有找到相关内容</b>，换个关键词试试？
        </template>
      </Empty>
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

.empty-box {
  width: 100%;
  max-width: 640px;
  padding: 16px 0;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 8px;
}

.hint {
  color: #999;
  font-size: 12px;
  margin-left: 8px;
}
</style>
