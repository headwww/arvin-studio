import type { CSSProperties, TransitionGroupProps } from 'vue';

import type { VueNode } from '../util';
import type {
  InnerOpenConfig,
  Key,
  NotificationListConfig,
  Placement,
  Placements,
  StackConfig,
} from './interface';
import type { ComponentsType } from './Notification';
import type {
  NotificationClassNames,
  NotificationStyles,
} from './NotificationList';

import { defineComponent, shallowRef, Teleport, watch } from 'vue';

import NotificationList from './NotificationList';

export interface NotificationsProps {
  className?: (placement: Placement) => string;
  classNames?: NotificationClassNames;
  components?: ComponentsType;
  container?: HTMLElement | ShadowRoot;
  maxCount?: number;
  motion?:
    | ((placement: Placement) => TransitionGroupProps)
    | TransitionGroupProps;
  onAllRemoved?: VoidFunction;
  pauseOnHover?: boolean;
  prefixCls?: string;
  renderNotifications?: (
    node: VueNode,
    info: { key: Key; prefixCls: string },
  ) => VueNode;
  stack?: StackConfig;
  style?: (placement: Placement) => CSSProperties;
  styles?: NotificationStyles;
}

export interface NotificationsRef {
  close: (key: Key) => void;
  destroy: () => void;
  open: (config: NotificationListConfig) => void;
}

const defaults = {
  prefixCls: 'headless-notification',
} as NotificationsProps;

const Notifications = defineComponent<NotificationsProps>(
  (props = defaults, { expose }) => {
    const configList = shallowRef<NotificationListConfig[]>([]);

    const onNoticeClose = (key: Key) => {
      configList.value = configList.value.filter((item) => item.key !== key);
    };

    expose({
      open: (config: NotificationListConfig) => {
        const list = configList.value;
        let clone = [...list];
        const index = clone.findIndex((item) => item.key === config.key);
        const innerConfig: InnerOpenConfig = { ...config };
        if (index === -1) {
          innerConfig.times = 0;
          clone.push(innerConfig);
        } else {
          innerConfig.times =
            ((list[index] as InnerOpenConfig)?.times ?? 0) + 1;
          clone[index] = innerConfig;
        }
        const maxCount = props.maxCount ?? 0;
        if (maxCount > 0 && clone.length > maxCount) {
          clone = clone.slice(-maxCount);
        }
        configList.value = clone;
      },
      close: onNoticeClose,
      destroy: () => {
        configList.value = [];
      },
    });

    const placements = shallowRef<Placements>({});

    watch(configList, () => {
      const next: Placements = {};
      configList.value.forEach((config) => {
        const placement = (config.placement ?? 'topRight') as Placement;
        next[placement] ||= [];
        next[placement]!.push(config);
      });
      // Keep existing placements so empty lists can finish leave motion.
      Object.keys(placements.value).forEach((placement) => {
        next[placement as Placement] = next[placement as Placement] || [];
      });
      placements.value = next;
    });

    const onAllNoticeRemoved = (placement: Placement) => {
      const clone = { ...placements.value };
      const list = clone[placement] || [];
      if (list.length === 0) {
        delete clone[placement];
      }
      placements.value = clone;
    };

    const emptyRef = shallowRef(false);
    watch(placements, () => {
      if (Object.keys(placements.value).length > 0) {
        emptyRef.value = true;
      } else if (emptyRef.value) {
        props?.onAllRemoved?.();
        emptyRef.value = false;
      }
    });

    return () => {
      const { container } = props;
      const prefixCls = props.prefixCls ?? defaults.prefixCls!;
      if (!container) {
        return null;
      }

      return (
        <Teleport to={container}>
          {Object.keys(placements.value).map((rawPlacement) => {
            const placement = rawPlacement as Placement;
            const placementConfigList = placements.value[placement];
            const list = (
              <NotificationList
                className={props.className?.(placement)}
                classNames={props.classNames}
                components={props.components}
                configList={placementConfigList}
                key={placement}
                motion={props.motion}
                onAllRemoved={onAllNoticeRemoved}
                onNoticeClose={onNoticeClose}
                pauseOnHover={props.pauseOnHover}
                placement={placement}
                prefixCls={prefixCls}
                stack={props.stack}
                style={props.style?.(placement)}
                styles={props.styles}
              />
            );
            return props.renderNotifications
              ? props.renderNotifications(list, { prefixCls, key: placement })
              : list;
          })}
        </Teleport>
      );
    };
  },
  {
    name: 'Notifications',
  },
);

export default Notifications;
