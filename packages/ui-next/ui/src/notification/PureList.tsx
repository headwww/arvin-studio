import type { CSSProperties, SlotsType } from 'vue';

import type { VueNode } from '../_util';
import type {
  IconType,
  NotificationClassNamesType,
  NotificationPlacement,
} from './interface';

import { computed, createVNode, defineComponent } from 'vue';

import { NotificationList } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { getCloseIcon, TypeIcon } from './PurePanel';
import useStyle from './style';

export interface PureListItem {
  actions?: VueNode;
  description?: VueNode;
  duration?: false | number;
  key: number | string;
  showProgress?: boolean;
  title?: VueNode;
  type: IconType;
}

export interface PureListProps {
  classes?: NotificationClassNamesType;
  items: PureListItem[];
  placement?: NotificationPlacement;
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
    const { getPrefixCls } = useComponentBaseConfig('notification', props);
    const prefixCls = computed(() => getPrefixCls('notification'));
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    return () => {
      const noticePrefixCls = `${prefixCls.value}-notice`;
      const configList = props.items.map((item) => {
        const {
          actions,
          description,
          duration,
          key,
          showProgress,
          title,
          type,
        } = item;
        const typeIconCls = `${noticePrefixCls}-icon-${type}`;
        return {
          key,
          actions,
          closable: {
            closeIcon: getCloseIcon(noticePrefixCls),
          },
          description,
          duration: duration as any,
          icon: TypeIcon[type] ? createVNode(TypeIcon[type]) : null,
          showProgress,
          title,
          class: `${noticePrefixCls}-${type}`,
          classNames: {
            icon: typeIconCls,
          },
        };
      }) as any;

      return (
        <NotificationList
          class={clsx(hashId.value, cssVarCls.value, rootCls.value)}
          classNames={props.classes as any}
          configList={configList}
          placement={props.placement ?? 'topRight'}
          prefixCls={prefixCls.value}
          stack={false}
          style={props.style}
        />
      );
    };
  },
  {
    name: 'NotificationPureList',
    inheritAttrs: false,
  },
);

export default PureList;
