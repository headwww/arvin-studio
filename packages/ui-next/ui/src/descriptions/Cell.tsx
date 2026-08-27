import type { VueNode } from '../_util';
import type {
  CellSemanticClassNames,
  CellSemanticStyles,
} from './DescriptionsContext';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getSlotPropsFnRun } from '../_util/tools';
import { useDescriptionsCtx } from './DescriptionsContext';

function notEmpty(val: any) {
  return val !== undefined && val !== null;
}

export interface CellProps {
  bordered?: boolean;
  classes?: CellSemanticClassNames;
  colon?: boolean;
  component: string;
  content?: VueNode;
  itemPrefixCls: string;
  label?: VueNode;
  span: number;
  styles?: CellSemanticStyles;
  type?: 'content' | 'item' | 'label';
}

const Cell = defineComponent<CellProps>((props, { attrs, slots }) => {
  const descContext = useDescriptionsCtx();
  return () => {
    const {
      component,
      bordered,
      type,
      itemPrefixCls,
      span,
      styles,
      classes,
      colon,
    } = props;
    const { classes: descriptionsClassNames } = descContext.value;
    const Component = component as any;
    const label = getSlotPropsFnRun(slots, props, 'label');
    const content = getSlotPropsFnRun(slots, props, 'content');
    if (bordered) {
      return (
        <Component
          class={clsx(
            {
              [`${itemPrefixCls}-item-label`]: type === 'label',
              [`${itemPrefixCls}-item-content`]: type === 'content',
            },
            type === 'label' ? descriptionsClassNames?.label : undefined,
            type === 'content' ? descriptionsClassNames?.content : undefined,
          )}
          colSpan={span}
          {...attrs}
        >
          {notEmpty(label) && (
            <span class={classes?.label} style={styles?.label}>
              {label}
            </span>
          )}
          {notEmpty(content) && (
            <span class={classes?.content} style={styles?.content}>
              {content}
            </span>
          )}
        </Component>
      );
    }
    return (
      <Component
        class={clsx(`${itemPrefixCls}-item`)}
        {...attrs}
        colSpan={span}
      >
        <div class={`${itemPrefixCls}-item-container`}>
          {(label || label === 0) && (
            <span
              class={clsx(
                `${itemPrefixCls}-item-label`,
                descriptionsClassNames?.label,
                {
                  [`${itemPrefixCls}-item-no-colon`]: !colon,
                },
                classes?.label,
              )}
              style={styles?.label}
            >
              {label}
            </span>
          )}
          {(content || content === 0) && (
            <span
              class={clsx(
                `${itemPrefixCls}-item-content`,
                descriptionsClassNames?.content,
                classes?.content,
              )}
              style={styles?.content}
            >
              {content}
            </span>
          )}
        </div>
      </Component>
    );
  };
});

export default Cell;
