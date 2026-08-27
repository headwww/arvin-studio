<script setup lang="ts">
import { ref } from 'vue';

import { Button, Drawer } from '@arvin-studio/ui';

type DrawerPlacement = 'bottom' | 'left' | 'right' | 'top';

/** Drawer 演示状态 */
const drawerOpen = ref(false);
const drawerPlacement = ref<DrawerPlacement>('right');
const drawerSize = ref<'default' | 'large'>('default');

const openDrawer = (placement: DrawerPlacement = 'right', size: 'default' | 'large' = 'default') => {
  drawerPlacement.value = placement;
  drawerSize.value = size;
  drawerOpen.value = true;
};
</script>

<template>
  <section id="demo-drawer" class="demo-section">
    <h3>Drawer</h3>

    <h4>基础（v-model:open + title / 内容）</h4>
    <div class="row">
      <Button type="primary" @click="openDrawer()">打开抽屉</Button>
    </div>

    <h4>placement 四个方向 / size</h4>
    <div class="row">
      <Button @click="openDrawer('top')">top</Button>
      <Button @click="openDrawer('right')">right</Button>
      <Button @click="openDrawer('bottom')">bottom</Button>
      <Button @click="openDrawer('left')">left</Button>
      <Button type="primary" @click="openDrawer('right', 'large')">right + large</Button>
    </div>

    <Drawer
      v-model:open="drawerOpen"
      :placement="drawerPlacement"
      :size="drawerSize"
      title="基础抽屉"
      destroy-on-hidden
      mask-closable
    >
      <template #extra><Button size="small">更多</Button></template>
      <p>这是抽屉内容，支持任意节点。</p>
      <p>当前方向：{{ drawerPlacement }}，尺寸：{{ drawerSize }}</p>
      <template #footer>
        <div class="drawer-footer">
          <Button @click="drawerOpen = false">取消</Button>
          <Button type="primary" @click="drawerOpen = false">确定</Button>
        </div>
      </template>
    </Drawer>
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

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
