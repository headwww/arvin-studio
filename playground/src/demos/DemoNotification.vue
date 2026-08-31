<script setup lang="ts">
import { Button, notification } from '@arvin-studio/ui';

const openNotification = (placement: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight') => {
  notification.open({
    message: '通知标题',
    description: '这是一条通知内容，可配置 placement / duration。',
    placement,
  });
};
</script>

<template>
  <section id="demo-notification" class="demo-section">
    <h3>Notification</h3>

    <h4>静态方法 + placement 位置</h4>
    <div class="row">
      <Button @click="openNotification('topRight')">topRight</Button>
      <Button @click="openNotification('topLeft')">topLeft</Button>
      <Button @click="openNotification('bottomRight')">bottomRight</Button>
      <Button @click="openNotification('bottomLeft')">bottomLeft</Button>
      <Button @click="openNotification('top')">top</Button>
      <Button @click="openNotification('bottom')">bottom</Button>
    </div>

    <h4>类型方法（success / error / info / warning）</h4>
    <div class="row">
      <Button type="primary" @click="notification.success({ message: '成功', description: '操作成功' })">
        success
      </Button>
      <Button danger @click="notification.error({ message: '错误', description: '操作失败' })">
        error
      </Button>
      <Button @click="notification.info({ message: '信息', description: '这是一条信息' })">info</Button>
      <Button @click="notification.warning({ message: '警告', description: '请注意' })">warning</Button>
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
</style>
