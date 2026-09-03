import type { VueNode } from '../_util';
import type {
  BreadcrumbProps,
  InternalRouteType,
  ItemType,
} from './Breadcrumb';

import { pickAttrs } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { getSlotPropsFnRun } from '../_util/tools';
import { checkRenderNode } from '../_util/vueNode';

type AddParameters<
  TFunction extends (...args: any) => any,
  TParameters extends [...args: any],
> = (
  ...args: [...Parameters<TFunction>, ...TParameters]
) => ReturnType<TFunction>;

type ItemRender = NonNullable<BreadcrumbProps['itemRender']>;
type InternalItemRenderParams = AddParameters<
  ItemRender,
  [href?: string, index?: number]
>;

function getBreadcrumbName(
  route: InternalRouteType,
  params: any,
  titleRender?: BreadcrumbProps['titleRender'],
  index?: number,
) {
  const title = getSlotPropsFnRun({}, { title: route.title }, 'title');
  const _renderTitle = checkRenderNode(
    titleRender?.({ item: route, index: index! }),
  );
  const _title = _renderTitle === undefined ? title : _renderTitle;
  if (_title === undefined || _title === null) {
    return null;
  }
  const paramsKeys = Object.keys(params).join('|');
  return typeof _title === 'object'
    ? _title
    : String(_title).replaceAll(
        new RegExp(`:(${paramsKeys})`, 'g'),
        (replacement, key) => params[key] || replacement,
      );
}

export function renderItem(
  prefixCls: string,
  item: ItemType,
  children: VueNode,
  href?: string,
) {
  if (children === null || children === undefined) {
    return null;
  }

  const { class: className, onClick, ...restItem } = item;

  const passedProps = {
    ...pickAttrs(restItem, {
      data: true,
      aria: true,
    }),
    onClick,
  };

  if (href !== undefined) {
    return (
      <a
        {...passedProps}
        class={clsx(`${prefixCls}-link`, className)}
        href={href}
      >
        {children}
      </a>
    );
  }
  return (
    <span {...passedProps} class={clsx(`${prefixCls}-link`, className)}>
      {children}
    </span>
  );
}

export default function useItemRender(
  prefixCls: string,
  itemRender?: ItemRender,
  titleRender?: BreadcrumbProps['titleRender'],
) {
  const mergedItemRender: InternalItemRenderParams = (
    item,
    params,
    routes,
    path,
    href,
    index,
  ) => {
    if (itemRender) {
      return itemRender(item, params, routes, path);
    }

    const name = getBreadcrumbName(item, params, titleRender, index);

    return renderItem(prefixCls, item, name, href);
  };

  return mergedItemRender;
}
