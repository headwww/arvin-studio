import type { RouteRecordRaw } from 'vue-router';

import type { MenuItemType } from '@arvin-studio/ui';

import { routes } from './routes';

/**
 * 由路由表生成菜单：routes.ts 是唯一数据源，这里只做转换，不用手动维护菜单。
 * 菜单项的 key 就是路由的完整路径，所以点击菜单时可以直接 router.push(key)。
 */

/** 子路由写相对路径时，拼出完整路径 */
function joinPath(parentPath: string, path: string) {
  if (path.startsWith('/')) {
    return path;
  }
  return `${parentPath}/${path}`.replaceAll(/\/{2,}/g, '/');
}

function toMenuItems(
  records: RouteRecordRaw[],
  parentPath = '',
): MenuItemType[] {
  return records
    .toSorted(
      (a, b) =>
        (a.meta?.order ?? Number.MAX_SAFE_INTEGER) -
        (b.meta?.order ?? Number.MAX_SAFE_INTEGER),
    )
    .filter((record) => !record.meta?.hideInMenu)
    .map((record) => {
      const path = joinPath(parentPath, record.path);
      const children = record.children?.length
        ? toMenuItems(record.children, path)
        : [];

      const item: MenuItemType = {
        key: path,
        label: record.meta?.title ?? path,
        icon: record.meta?.icon,
      };
      // 有 children 的项会自动渲染成可展开的子菜单
      if (children.length > 0) {
        item.children = children;
      }
      return item;
    });
}

/** 左侧菜单数据；新增路由后自动出现在菜单里，不需要改这里 */
export const menuItems: MenuItemType[] = toMenuItems(routes);

/** 递归时只关心 key 和 children，用这个窄类型收窄菜单项的联合类型 */
interface MenuNode {
  children?: MenuNode[];
  key?: number | string;
}

function findOpenKeysIn(nodes: MenuNode[], path: string): string[] {
  for (const item of nodes) {
    if (!item?.children?.length) {
      continue;
    }

    const key = String(item.key);
    if (item.children.some((child) => String(child?.key) === path)) {
      return [key];
    }

    const deeper = findOpenKeysIn(item.children, path);
    if (deeper.length > 0) {
      return [key, ...deeper];
    }
  }
  return [];
}

/**
 * 找出当前路由需要展开的父级菜单 key。
 * 例如路由是 /components/button 时返回 ['/components']，进入页面就会自动展开。
 */
export function findOpenKeys(items: MenuItemType[], path: string): string[] {
  return findOpenKeysIn(items as MenuNode[], path);
}
