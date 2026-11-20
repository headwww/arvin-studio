import type { Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import {
  AppstoreOutlined,
  CodeOutlined,
  HomeOutlined,
} from '@arvin-studio/icons';

/**
 * 给 vue-router 的 meta 补上本项目用到的字段。
 * 左侧菜单完全由 meta 生成，所以这里把每个字段的含义写清楚。
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** 只在路由里存在、不进菜单（详情页、404 这类）时设为 true */
    hideInMenu?: boolean;
    /** 菜单图标，直接放 @arvin-studio/icons 里的组件 */
    icon?: Component;
    /** 菜单排序，越小越靠前；不写就按下面的声明顺序 */
    order?: number;
    /** 菜单文案，必填：漏写 TypeScript 会直接报错 */
    title: string;
  }
}

/**
 * 唯一数据源：这里加一条记录 = 路由表多一个页面 + 左侧菜单多一项。
 *
 * 用法（新增一个功能）：
 *   1. 在 src/views/ 下新建 XxxView.vue，页面逻辑写在那里；
 *   2. 在下面补一条记录，component 指向这个文件，meta.title 就是菜单文案。
 *
 * 约定：
 *   - 有 children 的记录会自动变成可展开的子菜单，父级 key 是它的完整路径；
 *   - 子路由的 path 可以写相对路径（如 'button'），最终路径会自动拼成 /components/button；
 *   - 菜单的 key 就是路由的完整路径，点击菜单时直接 router.push(key)。
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: '首页', icon: HomeOutlined, order: 1 },
  },
  {
    path: '/components',
    name: 'Components',
    redirect: '/components/table',
    meta: { title: '组件示例', icon: AppstoreOutlined, order: 2 },
    children: [
      {
        path: 'table',
        name: 'ComponentTable',
        component: () => import('../views/components/TableView.vue'),
        meta: { title: 'Table 表格' },
      },
      {
        path: 'button',
        name: 'ComponentButton',
        component: () => import('../views/components/ButtonView.vue'),
        meta: { title: 'Button 按钮' },
      },
      {
        path: 'scrollbar',
        name: 'ComponentScrollbar',
        component: () => import('../views/components/ScrollbarView.vue'),
        meta: { title: 'Scrollbar 滚动条' },
      },
      {
        path: 'shared-tooltip',
        name: 'ComponentSharedTooltip',
        component: () => import('../views/components/SharedTooltipView.vue'),
        meta: { title: 'SharedTooltip 共享提示' },
      },
      {
        path: 'position-popup',
        name: 'ComponentPositionPopup',
        component: () => import('../views/components/PositionPopupView.vue'),
        meta: { title: 'PositionPopup 定位弹层' },
      },
      {
        path: 'menu',
        name: 'ComponentMenu',
        component: () => import('../views/components/MenuView.vue'),
        meta: { title: 'Menu 导航菜单' },
      },
      {
        path: 'vxetable',
        name: 'VxeTable',
        component: () => import('../views/components/VxeTableView.vue'),
        meta: { title: 'VxeTable' },
      },
    ],
  },
  {
    path: '/example',
    name: 'Example',
    component: () => import('../views/ExampleView.vue'),
    meta: { title: '写业务的页面', icon: CodeOutlined, order: 3 },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: '页面不存在', hideInMenu: true },
  },
];
