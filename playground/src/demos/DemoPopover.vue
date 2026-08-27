<script setup lang="ts">
import { ref } from 'vue';

import {
  Button,
  Popover,
} from '@arvin-studio/ui';

/** Popover 受控模式演示 */
const popoverOpen = ref(false);
</script>

<template>
    <section id="demo-popover" class="demo-section">
      <h3>Popover</h3>

      <h4>基础用法（title + content prop）</h4>
      <div class="row">
        <Popover title="Title" content="这是 Popover 的内容">
          <Button>基础 Popover</Button>
        </Popover>
        <Popover title="无箭头" content="..." :arrow="false">
          <Button>arrow=false</Button>
        </Popover>
      </div>

      <h4>#title / #content 插槽（内容可放任意节点）</h4>
      <div class="row">
        <Popover>
          <template #title>插槽标题</template>
          <template #content>
            <div class="popover-content">
              <p>插槽内容，可以放任意节点：</p>
              <Button type="primary">内容里的按钮</Button>
            </div>
          </template>
          <Button>插槽用法</Button>
        </Popover>
      </div>

      <h4>trigger 触发方式</h4>
      <div class="row">
        <Popover title="click" content="click 触发" trigger="click">
          <Button>click</Button>
        </Popover>
        <Popover title="focus" content="focus 触发" trigger="focus">
          <Button>focus</Button>
        </Popover>
      </div>

      <h4>placement 方向示例</h4>
      <div class="row">
        <Popover title="bottomRight" content="..." placement="bottomRight">
          <Button>bottomRight</Button>
        </Popover>
        <Popover title="leftTop" content="..." placement="leftTop">
          <Button>leftTop</Button>
        </Popover>
      </div>

      <h4>受控模式（v-model:open）</h4>
      <div class="row">
        <Popover
          v-model:open="popoverOpen"
          title="受控 Popover"
          content="..."
          trigger="click"
        >
          <Button>受控 Popover</Button>
        </Popover>
        <Button @click="popoverOpen = !popoverOpen">
          切换（当前：{{ popoverOpen }}）
        </Button>
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
h3 {
  margin: 20px 0 4px;
}

h4 {
  margin: 16px 0 4px;
}

.popover-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
