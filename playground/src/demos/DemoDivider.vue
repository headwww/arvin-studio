<script setup lang="ts">
import { Divider } from '@arvin-studio/ui';
</script>

<template>
  <section id="demo-divider" class="demo-section">
    <h3>Divider</h3>

    <h4>基础（无文字 / 带文字）</h4>
    <div class="divider-box">
      <Divider />
      <Divider>Divider</Divider>
    </div>

    <h4>titlePlacement 文字位置</h4>
    <div class="divider-box">
      <Divider title-placement="start">start 左对齐</Divider>
      <Divider title-placement="center">center 居中</Divider>
      <Divider title-placement="end">end 右对齐</Divider>
    </div>

    <h4>dashed / variant 线型</h4>
    <div class="divider-box">
      <Divider dashed>dashed 虚线</Divider>
      <Divider variant="dotted">dotted 点线</Divider>
      <Divider variant="solid">solid 实线</Divider>
    </div>

    <h4>plain / size</h4>
    <div class="divider-box">
      <Divider plain>plain 朴素文字</Divider>
      <Divider size="small">small</Divider>
      <Divider size="large">large</Divider>
    </div>

    <h4>vertical 垂直分割（配合 flex 排列）</h4>
    <div class="row">
      <span>首页</span>
      <Divider vertical />
      <span>新闻</span>
      <Divider vertical />
      <span>关于</span>
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

.divider-box {
  width: 100%;
  max-width: 720px;
  padding: 8px 0;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
</style>
