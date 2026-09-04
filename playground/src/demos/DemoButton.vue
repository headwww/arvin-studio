<script setup lang="ts">
import { Button } from '@arvin-studio/ui';
</script>

<template>
  <section id="demo-button" class="demo-section">
    <h3>Button</h3>

    <h4>type 类型</h4>
    <div class="row">
      <Button>default</Button>
      <Button type="primary">primary</Button>
      <Button type="dashed">dashed</Button>
      <Button type="link">link</Button>
      <Button type="text">text</Button>
    </div>

    <h4>variant / color 变体</h4>
    <div class="row">
      <Button color="pink" variant="solid">pink solid</Button>
      <Button color="blue" variant="outlined">blue outlined</Button>
      <Button color="green" variant="filled">green filled</Button>
      <Button color="gold" variant="dashed">gold dashed</Button>
      <Button variant="text">text</Button>
      <Button variant="link">link</Button>
    </div>

    <h4>size / shape</h4>
    <div class="row">
      <Button size="small">small</Button>
      <Button size="medium">medium</Button>
      <Button size="large">large</Button>
      <Button shape="circle">C</Button>
      <Button shape="round">round</Button>
      <Button shape="square">square</Button>
    </div>

    <h4>状态（disabled / loading / danger / ghost）</h4>
    <div class="row">
      <Button type="primary" disabled>disabled</Button>
      <Button type="primary" loading>loading</Button>
      <Button type="primary" danger>danger</Button>
      <Button ghost>ghost</Button>
      <Button danger>danger default</Button>
    </div>
    <div class="row">
      <Button type="primary" block>block 撑满父容器</Button>
    </div>

    <h4>图标 / iconPlacement / 链接按钮</h4>
    <div class="row">
      <Button type="primary" icon="⭐">icon start</Button>
      <Button type="primary" icon="⭐" icon-placement="end">icon end</Button>
      <Button type="primary" shape="circle" icon="👍" />
      <Button href="https://www.google.com" target="_blank" type="link">
        链接按钮
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
