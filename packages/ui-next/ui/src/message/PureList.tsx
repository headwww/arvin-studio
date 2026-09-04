import type { CSSProperties, SlotsType } from 'vue';

import type { VueNode } from '../_util';
import type {
  ArgsClassNamesType,
  MessageSemanticClassNames,
  NoticeType,
} from './interface';

import { computed, defineComponent } from 'vue';

import { NotificationList } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { resolveMessageIcon } from './PurePanel';
import useStyle from './style';

export interface PureListItem {
  content?: VueNode;
  duration?: false | number;
  key: number | string;
  type: NoticeType;
}

export interface PureListProps {
  classes?: ArgsClassNamesType;
  items: PureListItem[];
  prefixCls?: string;
  style?: CSSProperties;
}

export interface PureListSlots {
  default?: () => any;
}

/**
 * @private Internal component. Do not use in production.
 */
const PureList = defineComponent<
  PureListProps,
  Record<string, never>,
  string,
  SlotsType<PureListSlots>
>(
  (props) => {
    const { getPrefixCls } = useComponentBaseConfig('message', props);
    const prefixCls = computed(() => getPrefixCls('message'));
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    return () => {
      const noticePrefixCls = `${prefixCls.value}-notice`;
      const classes = (props.classes ?? {}) as MessageSemanticClassNames;

      const configList = props.items.map((item) => {
        const { content, duration, key, type } = item;
        const typeIconCls = type
          ? `${noticePrefixCls}-icon-${type}`
          : undefined;
        return {
          key,
          duration: duration as any,
          icon: resolveMessageIcon(prefixCls.value, undefined, type),
          title: content,
          class: `${noticePrefixCls}-${type}`,
          classNames: {
            wrapper: `${prefixCls.value}-${type}`,
            icon: typeIconCls,
          },
        };
      }) as any;

      return (
        <NotificationList
          class={clsx(hashId.value, cssVarCls.value, rootCls.value)}
          classNames={
            {
              list: classes.list,
              listContent: classes.listContent,
              wrapper: classes.wrapper,
              title: classes.title,
              icon: classes.icon,
              root: classes.root,
            } as any
          }
          configList={configList}
          placement="top"
          prefixCls={prefixCls.value}
          stack={false}
          style={props.style}
        />
      );
    };
  },
  {
    name: 'MessagePureList',
    inheritAttrs: false,
  },
);

export default PureList;
