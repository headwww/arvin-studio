<script setup lang="ts">
import { ref } from 'vue';

import { Button, Modal } from '@arvin-studio/ui';

/** Modal 基础演示状态 */
const modalOpen = ref(false);
</script>

<template>
  <section id="demo-modal" class="demo-section">
    <h3>Modal</h3>

    <h4>基础（v-model:open + title + 默认 footer）</h4>
    <div class="row">
      <Button type="primary" @click="modalOpen = true">打开模态框</Button>
    </div>
    <Modal v-model:open="modalOpen" title="基础模态框">
      <p>这是 Modal 内容，支持任意节点。</p>
    </Modal>

    <h4>静态方法（confirm / info / success / error / warning）</h4>
    <div class="row">
      <Button
        @click="Modal.confirm({ title: '确认操作', content: '确定要执行该操作吗？' })"
      >
        confirm
      </Button>
      <Button @click="Modal.info({ title: '提示', content: '这是一条提示' })">info</Button>
      <Button @click="Modal.success({ title: '成功', content: '操作成功' })">success</Button>
      <Button danger @click="Modal.error({ title: '错误', content: '出错了' })">error</Button>
      <Button @click="Modal.warning({ title: '警告', content: '请注意' })">warning</Button>
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

p {
  margin: 0;
}
</style>
