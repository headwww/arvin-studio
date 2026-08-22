import type { CSSProperties } from 'vue';

import type { Group } from './interface';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

// ============================== Types ===============================
export interface GroupHeaderProps {
  className?: string;
  fixed?: boolean;
  group: Group;
  groupItems: any[];
  groupKey: any;
  prefixCls: string;
  sticky?: boolean;
  style?: CSSProperties;
}

export default defineComponent<GroupHeaderProps>((props) => {
  return () => {
    const {
      group,
      groupKey,
      groupItems,
      prefixCls,
      fixed,
      sticky,
      className: customClassName,
      style,
    } = props;

    const className = clsx(
      `${prefixCls}-group-header`,
      {
        [`${prefixCls}-group-header-sticky`]: sticky,
        [`${prefixCls}-group-header-fixed`]: fixed,
      },
      customClassName,
    );
    return (
      <div class={className} style={style}>
        {group.title(groupKey, groupItems)}
      </div>
    );
  };
});
