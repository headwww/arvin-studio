<script setup lang="ts">
import { App, Button } from '@arvin-studio/ui';

/** 由根 App 组件提供 message / notification / modal 上下文 */
const app = App.useApp();
</script>

<template>
  <section id="demo-app" class="demo-section">
    <h3>App</h3>

    <h4>useApp：在根 App 组件内获取 message / notification / modal 上下文</h4>
    <div class="row">
      <Button type="primary" @click="app.message.success('App 上下文消息')">
        app.message
      </Button>
      <Button
        @click="app.notification.open({ message: '通知标题', description: 'App 上下文的通知内容' })"
      >
        app.notification
      </Button>
      <Button
        @click="app.modal.confirm({ title: '确认操作', content: 'App 上下文的确认框' })"
      >
        app.modal
      </Button>
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
