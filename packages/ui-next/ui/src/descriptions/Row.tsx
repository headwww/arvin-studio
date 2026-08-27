import type { SlotsType } from 'vue';

import type { InternalDescriptionsItemType, RenderDescriptionsItem } from '.';
import type { EmptyEmit } from '../_util/types';
import type { DescriptionsContextProps } from './DescriptionsContext.ts';

import { defineComponent } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';

import { getSlotPropsFnRun } from '../_util/tools';
import Cell from './Cell';
import { useDescriptionsCtx } from './DescriptionsContext';

interface CellConfig {
  component: [string, string] | string;
  showContent?: boolean;
  showLabel?: boolean;
  type: 'content' | 'item' | 'label';
}
function renderCells(
  items: InternalDescriptionsItemType[],
  { colon, prefixCls, bordered, labelRender, contentRender }: RowProps,
  {
    component,
    type,
    showLabel,
    showContent,
    styles: rootStyles,
  }: CellConfig & DescriptionsContextProps,
) {
  return items.map((item, index) => {
    const {
      prefixCls: itemPrefixCls = prefixCls,
      span = 1,
      key,
      styles,
      style,
    } = item;
    let label = getSlotPropsFnRun({}, item, 'label');
    let children = getSlotPropsFnRun({}, item, 'content');

    const className = item.class;
    if (labelRender) {
      const _oldLabel = label;
      label =
        labelRender({ item, index: item?._$index ?? index, value: label }) ??
        label;
      const arrLabel = Array.isArray(label) ? label : [label];
      const _label = filterEmpty(arrLabel);
      label = _label.length > 0 ? _label : _oldLabel;
    }
    if (contentRender) {
      const _oldChild = children;
      children =
        contentRender({
          item,
          index: item?._$index ?? index,
          value: children,
        }) ?? children;
      const arrChild = Array.isArray(children) ? children : [children];
      const _child = filterEmpty(arrChild);
      children = _child.length > 0 ? _child : _oldChild;
    }

    if (typeof component === 'string') {
      return (
        <Cell
          bordered={bordered}
          class={className}
          colon={colon}
          component={component}
          content={showContent ? children : null}
          itemPrefixCls={itemPrefixCls}
          key={`${type}-${key || index}`}
          label={showLabel ? label : null}
          span={span}
          style={style}
          styles={{
            label: {
              ...rootStyles?.label,
              ...styles?.label,
            },
            content: {
              ...rootStyles?.content,
              ...styles?.content,
            },
          }}
          type={type}
        />
      );
    }

    return [
      <Cell
        bordered={bordered}
        class={className}
        colon={colon}
        component={component[0]}
        itemPrefixCls={itemPrefixCls}
        key={`label-${key || index}`}
        label={label}
        span={1}
        style={{
          ...rootStyles?.label,
          ...style,
          ...styles?.label,
        }}
        type="label"
      />,
      <Cell
        bordered={bordered}
        class={className}
        component={component[1]}
        content={children}
        itemPrefixCls={itemPrefixCls}
        key={`content-${key || index}`}
        span={span * 2 - 1}
        style={{
          ...rootStyles?.content,
          ...style,
          ...styles?.content,
        }}
        type="content"
      />,
    ];
  });
}

export interface RowProps {
  bordered?: boolean;
  colon: boolean;
  contentRender?: RenderDescriptionsItem;
  index: number;
  labelRender?: RenderDescriptionsItem;
  prefixCls: string;
  row: InternalDescriptionsItemType[];
  vertical: boolean;
}

export interface RowSlots {
  default?: () => any;
}
const Row = defineComponent<RowProps, EmptyEmit, string, SlotsType<RowSlots>>(
  (props) => {
    const descContext = useDescriptionsCtx();
    return () => {
      const { prefixCls, vertical, row, index, bordered } = props;

      if (vertical) {
        return (
          <>
            <tr class={`${prefixCls}-row`} key={`label-${index}`}>
              {renderCells(row, props, {
                component: 'th',
                type: 'label',
                showLabel: true,
                ...descContext.value,
              })}
            </tr>
            <tr class={`${prefixCls}-row`} key={`content-${index}`}>
              {renderCells(row, props, {
                component: 'td',
                type: 'content',
                showContent: true,
                ...descContext.value,
              })}
            </tr>
          </>
        );
      }

      return (
        <tr class={`${prefixCls}-row`} key={index}>
          {renderCells(row, props, {
            component: bordered ? ['th', 'td'] : 'td',
            type: 'item',
            showLabel: true,
            showContent: true,
            ...descContext.value,
          })}
        </tr>
      );
    };
  },
);

export default Row;
