import type {
  CSSProperties,
  RendererElement,
  RendererNode,
  VNode,
  VNodeNormalizedChildren,
} from 'vue';

import type { VueNode } from '../../util';
import type {
  CollapsePanelProps,
  CollapseProps,
  ItemType,
  Key,
} from '../interface';

import { clsx, toArray } from '@arvin-studio/kit';

import { isEmptyElement } from '../../util';
import { cloneElement } from '../../util/vnode';
import CollapsePanel from '../Panel';

function mergeSemantic<T>(
  source: Partial<Record<string, T>> | undefined,
  target: Partial<Record<string, T>> | undefined,
  mergeFunc: (
    sourceValue: T | undefined,
    targetValue: T | undefined,
  ) => T | undefined,
): Partial<Record<string, T>> | undefined {
  if (!source && !target) return undefined;
  const keys = new Set([
    ...Object.keys(source || {}),
    ...Object.keys(target || {}),
  ]);
  const result: Partial<Record<string, T>> = {};
  keys.forEach((key) => {
    const merged = mergeFunc(source?.[key], target?.[key]);
    if (merged !== undefined) {
      result[key] = merged;
    }
  });
  return result;
}

function mergeSemanticClassNames(
  source: Partial<Record<string, string>> | undefined,
  target: Partial<Record<string, string>> | undefined,
) {
  return mergeSemantic(source, target, (s, t) => clsx(s, t) || undefined);
}

function mergeSemanticStyles(
  source: Partial<Record<string, CSSProperties>> | undefined,
  target: Partial<Record<string, CSSProperties>> | undefined,
) {
  return mergeSemantic(source, target, (s, t) => {
    if (!s && !t) return undefined;
    return { ...s, ...t };
  });
}

type Props = Pick<
  CollapsePanelProps,
  | 'classNames'
  | 'expandIcon'
  | 'onItemClick'
  | 'openMotion'
  | 'prefixCls'
  | 'styles'
> &
  Pick<CollapseProps, 'accordion' | 'collapsible' | 'destroyOnHidden'> & {
    activeKey: Key[];
  };

interface ChildrenSlots {
  default?: () => VueNode;
}

function convertItemsToNodes(items: ItemType[], props: Props) {
  const {
    prefixCls,
    accordion,
    collapsible,
    onItemClick,
    activeKey,
    openMotion,
    expandIcon,
    destroyOnHidden,
    classNames: collapseClassNames,
    styles: collapseStyles,
  } = props;

  return items.map((item, index) => {
    const {
      label,
      key: rawKey,
      collapsible: rawCollapsible,
      onItemClick: rawOnItemClick,
      destroyOnHidden: rawDestroyOnHidden,
      ...restProps
    } = item;

    const key = String(rawKey ?? index);
    const mergeCollapsible = rawCollapsible ?? collapsible;
    const mergedDestroyOnHidden = rawDestroyOnHidden ?? destroyOnHidden;

    const handleItemClick = (value: Key) => {
      if (mergeCollapsible === 'disabled') return;

      onItemClick?.(value);
      rawOnItemClick?.(value);
    };

    // eslint-disable-next-line no-useless-assignment
    let isActive = false;

    isActive = accordion ? activeKey?.[0] === key : activeKey.includes(key);

    return (
      <CollapsePanel
        {...restProps}
        accordion={accordion}
        classNames={mergeSemanticClassNames(
          collapseClassNames,
          restProps.classNames,
        )}
        collapsible={mergeCollapsible}
        destroyOnHidden={mergedDestroyOnHidden}
        expandIcon={expandIcon}
        header={label}
        isActive={isActive}
        key={key}
        onItemClick={handleItemClick}
        openMotion={openMotion}
        panelKey={key}
        prefixCls={prefixCls}
        styles={mergeSemanticStyles(collapseStyles, restProps.styles) as any}
      />
    );
  });
}

/**
 * @deprecated The next major version will be removed
 */
function getNewChild(
  child: VNode<RendererNode, RendererElement, CollapsePanelProps>,
  index: number,
  props: Props,
) {
  if (isEmptyElement(child) || !child) return null;

  if (
    typeof child === 'boolean' ||
    typeof child === 'number' ||
    typeof child === 'string'
  ) {
    return child;
  }

  const {
    prefixCls,
    accordion,
    collapsible,
    onItemClick,
    activeKey,
    openMotion,
    expandIcon,
    classNames: collapseClassNames,
    styles: collapseStyles,
    destroyOnHidden,
  } = props;

  const key = child.key || String(index);

  const {
    header,
    headerClass,
    collapsible: childCollapsible,
    onItemClick: childOnItemClick,
    destroyOnHidden: childDestroyOnHidden,
    classNames: childClassNames,
    styles: childStyles,
  } = child.props || {};

  // eslint-disable-next-line no-useless-assignment
  let isActive = false;
  isActive = accordion ? activeKey[0] === key : activeKey.includes(key as Key);

  const mergeCollapsible = childCollapsible ?? collapsible;

  const handleItemClick = (value: Key) => {
    if (mergeCollapsible === 'disabled') return;
    onItemClick?.(value);
    childOnItemClick?.(value);
  };

  const childProps = {
    key,
    panelKey: key,
    header,
    headerClass,
    classNames: mergeSemanticClassNames(collapseClassNames, childClassNames),
    styles: mergeSemanticStyles(collapseStyles, childStyles),
    isActive,
    prefixCls,
    destroyOnHidden: childDestroyOnHidden ?? destroyOnHidden,
    openMotion,
    accordion,
    children: (child.children as ChildrenSlots)?.default?.(),
    onItemClick: handleItemClick,
    expandIcon,
    collapsible: mergeCollapsible,
  };

  Object.keys(childProps).forEach((propName) => {
    if (childProps[propName as keyof typeof childProps] === undefined) {
      delete childProps[propName as keyof typeof childProps];
    }
  });

  return cloneElement(child, childProps);
}

export function useItems(
  items?: ItemType[],
  children?: () => VNode | VNodeNormalizedChildren,
  props?: Props,
) {
  if (Array.isArray(items)) {
    return convertItemsToNodes(items, props!);
  }

  return toArray(children?.()).map((target, index) =>
    getNewChild(target, index, props!),
  );
}
