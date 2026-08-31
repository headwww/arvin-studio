<script setup lang="ts">
import { ref } from 'vue';

import { QRCode } from '@arvin-studio/ui';

/** QRCode 演示状态 */
const qrValue = ref('https://example.com');
const qrStatus = ref<'active' | 'expired' | 'loading'>('active');
</script>

<template>
  <section id="demo-qrcode" class="demo-section">
    <h3>QRCode</h3>

    <h4>基础（value 生成二维码 / size）</h4>
    <div class="row">
      <QRCode :value="qrValue" />
      <QRCode :value="qrValue" :size="120" />
    </div>

    <h4>icon 中间图标 / bordered</h4>
    <div class="row">
      <QRCode :value="qrValue" icon="https://i.pravatar.cc/32?img=5" :icon-size="24" />
      <QRCode :value="qrValue" :bordered="false" />
    </div>

    <h4>status 状态（expired / loading + refresh）</h4>
    <div class="row">
      <QRCode :value="qrValue" status="expired" @refresh="qrStatus = 'active'" />
      <QRCode :value="qrValue" status="loading" />
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
