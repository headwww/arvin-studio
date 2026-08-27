<script setup lang="ts">
import {
  Button,
  Space,
} from '@arvin-studio/ui';
</script>

<template>
    <section id="demo-space" class="demo-section">
      <h3>Space</h3>

      <h4>基础（size 预设）</h4>
      <div class="row">
        <Space size="small">
          <Button type="primary">small</Button>
          <Button>按钮</Button>
          <Button>按钮</Button>
        </Space>
        <Space size="large">
          <Button type="primary">large</Button>
          <Button>按钮</Button>
        </Space>
      </div>

      <h4>自定义间距 / wrap 换行</h4>
      <div class="row">
        <Space :size="24">
          <Button>24px 间距</Button>
          <Button>按钮</Button>
        </Space>
      </div>
      <div style="width: 360px">
        <Space :size="[8, 16]" wrap>
          <Button v-for="n in 8" :key="n">按钮 {{ n }}</Button>
        </Space>
      </div>

      <h4>vertical 垂直排列</h4>
      <div class="row">
        <Space vertical>
          <Button>上</Button>
          <Button>中</Button>
          <Button>下</Button>
        </Space>
      </div>

      <h4>separator 分隔符</h4>
      <div class="row">
        <Space separator="|">
          <span>一</span>
          <span>二</span>
          <span>三</span>
        </Space>
        <Space>
          <template #separator><span style="color: #f50">◆</span></template>
          <span>一</span>
          <span>二</span>
          <span>三</span>
        </Space>
      </div>

      <h4>align 对齐</h4>
      <div class="row">
        <Space align="start">
          <Button>start</Button>
          <span style="font-size: 24px">大</span>
          <span>小</span>
        </Space>
        <Space align="center">
          <Button>center</Button>
          <span style="font-size: 24px">大</span>
          <span>小</span>
        </Space>
        <Space align="end">
          <Button>end</Button>
          <span style="font-size: 24px">大</span>
          <span>小</span>
        </Space>
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
