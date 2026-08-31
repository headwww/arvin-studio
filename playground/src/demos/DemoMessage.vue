<script setup lang="ts">
import { Button, message } from '@arvin-studio/ui';

const showMessage = (type: 'error' | 'info' | 'loading' | 'success' | 'warning') => {
  if (type === 'loading') {
    const hide = message.loading('加载中...', 0);
    setTimeout(hide, 2000);
    return;
  }
  message[type](`这是一条${type}消息`);
};
</script>

<template>
  <section id="demo-message" class="demo-section">
    <h3>Message</h3>

    <h4>静态方法（success / error / info / warning / loading）</h4>
    <div class="row">
      <Button type="primary" @click="showMessage('success')">success</Button>
      <Button danger @click="showMessage('error')">error</Button>
      <Button @click="showMessage('info')">info</Button>
      <Button @click="showMessage('warning')">warning</Button>
      <Button @click="showMessage('loading')">loading（2s 后关闭）</Button>
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
