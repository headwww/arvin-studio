<script setup lang="ts">
/**
 * 现成的示例可以直接复用：
 * 新写的例子丢进 src/demos/，这里引一下、routes.ts 加一条记录就是一页。
 */
import DemoButton from '../../demos/DemoButton.vue';
</script>

<template>
  <section class="page">
    <h2>Button 按钮</h2>
    <p>内容来自 <code>src/demos/DemoButton.vue</code>。</p>

    <DemoButton />
  </section>
</template>
