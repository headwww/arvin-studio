import { createRouter, createWebHistory } from 'vue-router';

import { routes } from './routes';

/**
 * 路由实例本身没什么特别的：
 * 路由表直接来自 routes.ts，菜单由同一条记录生成，两边永远一致。
 */
export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

/** 顺手把菜单文案同步到浏览器标题 */
router.afterEach((to) => {
  document.title = `${to.meta.title} · Arvin Studio`;
});

export { routes };

export default router;
