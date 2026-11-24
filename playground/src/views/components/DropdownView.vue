<script setup lang="ts">
/** 同样的复用方式：这个页面只是把 DemoDropdown 挂到了路由上 */
import DemoDropdown from '../../demos/DemoDropdown.vue';
</script>

<template>
  <section class="page">
    <h2>Dropdown 下拉菜单</h2>
    <p>
      内容来自
      <code>src/demos/DemoDropdown.vue</code>；覆盖触发方式、位置与箭头、受控
      open、自定义弹层、语义化样式、可多选菜单与事件回调。
    </p>

    <DemoDropdown />
  </section>
</template>
