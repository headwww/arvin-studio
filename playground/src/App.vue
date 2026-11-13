<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';

import { Layout, LayoutContent, LayoutSider, Menu } from '@arvin-studio/ui';

import { findOpenKeys, menuItems } from './router/menu';

const route = useRoute();
const router = useRouter();

/** 菜单项的 key 就是路由的完整路径，所以高亮项跟着当前路由走就行 */
const selectedKeys = computed(() => [route.path]);

/** 展开的父级菜单；跳进子页面时自动展开它所属的父级 */
const openKeys = ref<string[]>(findOpenKeys(menuItems, route.path));
watch(
  () => route.path,
  (path) => {
    openKeys.value = [
      ...new Set([...openKeys.value, ...findOpenKeys(menuItems, path)]),
    ];
  },
);

/** 点击菜单 = 跳路由；选中状态由路由驱动，所以不用自己维护 */
function handleMenuClick(info: { key: number | string }) {
  const path = String(info.key);
  if (path !== route.path) {
    router.push(path);
  }
}
</script>

<template>
  <Layout class="app-layout" has-sider>
    <LayoutSider class="app-sider" collapsible theme="light" :width="220">
      <div class="app-logo">Arvin Studio</div>

      <Menu
        v-model:open-keys="openKeys"
        :items="menuItems"
        :selected-keys="selectedKeys"
        mode="inline"
        @click="handleMenuClick"
      />
    </LayoutSider>

    <LayoutContent class="app-main">
      <RouterView />
    </LayoutContent>
  </Layout>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    sans-serif;
}

.app-layout {
  min-height: 100vh;
}

.app-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  color: rgb(0 0 0 / 88%);
  border-bottom: 1px solid rgb(5 5 5 / 6%);
}

.app-main {
  padding: 24px;
  overflow: auto;
  background: #fff;
}

/* 页面通用排版，写新页面时直接用 */
.page h2 {
  margin: 0 0 8px;
  font-size: 20px;
}

.page h3 {
  margin: 20px 0 8px;
  font-size: 16px;
}

.page p {
  margin: 8px 0;
  color: rgb(0 0 0 / 65%);
}

.page code {
  padding: 2px 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  background: rgb(0 0 0 / 6%);
  border-radius: 4px;
}

.page pre {
  padding: 12px 16px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
  background: rgb(0 0 0 / 4%);
  border-radius: 8px;
}
</style>
