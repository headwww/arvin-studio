<script setup lang="ts">
import DemoPositionPopup from '../../demos/DemoPositionPopup.vue';
</script>

<template>
  <section class="page">
    <h2>PositionPopup 定位弹层</h2>
    <p>
      x / y 是文档坐标：<code>rect + scrollX / scrollY</code>。弹层默认 Teleport
      到 body（可用 <code>get-container</code> 指定选择器、节点或函数），再按
      absolute 定位，内容由业务通过默认插槽自己写。
    </p>
    <p>本页内容来自 <code>src/demos/DemoPositionPopup.vue</code>。</p>

    <DemoPositionPopup />
  </section>
</template>
