<script setup lang="ts">
import { ref } from 'vue';

import {
  Button,
  Popconfirm,
} from '@arvin-studio/ui';

/** Popconfirm 最近一次操作结果（演示 confirm / cancel 事件） */
const popconfirmResult = ref('未操作');
/** Popconfirm 受控模式演示 */
const popconfirmOpen = ref(false);

const onConfirm = () => {
  popconfirmResult.value = '已确认';
};

const onCancel = () => {
  popconfirmResult.value = '已取消';
};
</script>

<template>
    <section id="demo-popconfirm" class="demo-section">
      <h3>Popconfirm</h3>

      <h4>基础用法（默认 click 触发，title + confirm / cancel 事件）</h4>
      <div class="row">
        <Popconfirm
          title="确定删除这条记录吗？"
          @confirm="onConfirm"
          @cancel="onCancel"
        >
          <Button type="primary" danger>删除</Button>
        </Popconfirm>
        <span>最近操作：{{ popconfirmResult }}</span>
      </div>

      <h4>description 描述 + 自定义按钮文字</h4>
      <div class="row">
        <Popconfirm
          title="删除任务"
          description="删除后不可恢复，请谨慎操作"
          ok-text="确认删除"
          cancel-text="再想想"
          @confirm="onConfirm"
        >
          <Button type="primary" danger>危险操作</Button>
        </Popconfirm>
      </div>

      <h4>okType / showCancel</h4>
      <div class="row">
        <Popconfirm title="确定发布？" ok-type="primary" @confirm="onConfirm">
          <Button type="primary">发布</Button>
        </Popconfirm>
        <Popconfirm
          title="只保留确定按钮"
          :show-cancel="false"
          @confirm="onConfirm"
        >
          <Button>showCancel=false</Button>
        </Popconfirm>
      </div>

      <h4>自定义图标 / 插槽</h4>
      <div class="row">
        <Popconfirm title="自定义图标" icon="❓" @confirm="onConfirm">
          <Button>icon prop</Button>
        </Popconfirm>
        <Popconfirm @confirm="onConfirm">
          <template #title>插槽标题</template>
          <template #description>插槽描述，可放任意节点</template>
          <template #icon>⚠️</template>
          <Button>插槽用法</Button>
        </Popconfirm>
      </div>

      <h4>placement / disabled / 受控（v-model:open）</h4>
      <div class="row">
        <Popconfirm title="bottom 方向" placement="bottom" @confirm="onConfirm">
          <Button>bottom</Button>
        </Popconfirm>
        <Popconfirm title="禁用状态" disabled @confirm="onConfirm">
          <Button disabled>disabled</Button>
        </Popconfirm>
        <Popconfirm
          v-model:open="popconfirmOpen"
          title="受控 Popconfirm"
          @confirm="onConfirm"
        >
          <Button>受控</Button>
        </Popconfirm>
        <Button @click="popconfirmOpen = !popconfirmOpen">
          切换（当前：{{ popconfirmOpen }}）
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
