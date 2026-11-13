<script setup lang="ts">
/** 同样的复用方式：这个页面只是把 DemoMenu 挂到了路由上 */
import DemoMenu from '../../demos/DemoMenu.vue';
</script>

<template>
  <section class="page">
    <h2>Menu 导航菜单</h2>
    <p>
      内容来自
      <code>src/demos/DemoMenu.vue</code>；左侧那一整块导航用的也是同一个 Menu
      组件，只是 items 由路由表生成。
    </p>

    <DemoMenu />
  </section>
</template>
