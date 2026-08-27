<script setup lang="ts">
import { ref } from 'vue';

import {
  Button,
  Tooltip,
} from '@arvin-studio/ui';

/** Tooltip 受控模式演示 */
const tooltipOpen = ref(false);

/** Tooltip 的 12 个方向，用于循环展示 placement 用法 */
const tooltipPlacements = [
  'top',
  'topLeft',
  'topRight',
  'bottom',
  'bottomLeft',
  'bottomRight',
  'left',
  'leftTop',
  'leftBottom',
  'right',
  'rightTop',
  'rightBottom',
] as const;
</script>

<template>
    <section id="demo-tooltip" class="demo-section">
      <h3>Tooltip</h3>

      <h4>基础用法（title prop，默认 hover 触发 + top 方向）</h4>
      <div class="row">
        <Tooltip title="prompt text">
          <Button>基础 Tooltip</Button>
        </Tooltip>
        <Tooltip title="默认打开" default-open>
          <Button>defaultOpen</Button>
        </Tooltip>
      </div>

      <h4>#title 插槽</h4>
      <div class="row">
        <Tooltip>
          <template #title><b>粗体标题</b> · 插槽内容</template>
          <Button>#title 插槽</Button>
        </Tooltip>
      </div>

      <h4>placement 十二个方向</h4>
      <div class="row">
        <Tooltip
          v-for="p in tooltipPlacements"
          :key="p"
          :placement="p"
          :title="`placement: ${p}`"
        >
          <Button>{{ p }}</Button>
        </Tooltip>
      </div>

      <h4>arrow 箭头控制</h4>
      <div class="row">
        <Tooltip title="无箭头" :arrow="false">
          <Button>arrow=false</Button>
        </Tooltip>
        <Tooltip
          title="箭头指向中心"
          :arrow="{ pointAtCenter: true }"
          placement="bottom"
        >
          <Button>pointAtCenter</Button>
        </Tooltip>
      </div>

      <h4>trigger 触发方式</h4>
      <div class="row">
        <Tooltip title="click 触发" trigger="click">
          <Button>click</Button>
        </Tooltip>
        <Tooltip title="focus 触发" trigger="focus">
          <Button>focus</Button>
        </Tooltip>
        <Tooltip title="右键触发" trigger="contextMenu">
          <Button>contextMenu</Button>
        </Tooltip>
        <Tooltip title="hover + focus 组合" :trigger="['hover', 'focus']">
          <Button>hover + focus</Button>
        </Tooltip>
      </div>

      <h4>color 颜色</h4>
      <div class="row">
        <Tooltip title="pink" color="pink">
          <Button>pink</Button>
        </Tooltip>
        <Tooltip title="blue" color="blue">
          <Button>blue</Button>
        </Tooltip>
        <Tooltip title="自定义色 #f50" color="#f50">
          <Button>#f50</Button>
        </Tooltip>
      </div>

      <h4>鼠标延迟</h4>
      <div class="row">
        <Tooltip
          title="进出各延迟 0.5s"
          :mouse-enter-delay="0.5"
          :mouse-leave-delay="0.5"
        >
          <Button>0.5s 延迟</Button>
        </Tooltip>
        <Tooltip title="隐藏即销毁" destroy-on-hidden>
          <Button>destroyOnHidden</Button>
        </Tooltip>
      </div>

      <h4>受控模式（v-model:open）</h4>
      <div class="row">
        <Tooltip v-model:open="tooltipOpen" title="受控 Tooltip">
          <Button>受控 Tooltip</Button>
        </Tooltip>
        <Button @click="tooltipOpen = !tooltipOpen">
          切换（当前：{{ tooltipOpen }}）
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
</style>
