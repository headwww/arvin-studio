// oxlint-disable no-unused-vars
import type { CSSProperties, MaybeRef, TransitionGroupProps } from 'vue';

import type { VueNode } from '../../util';
import type {
  ClosableType,
  Key,
  NotificationListConfig,
  Placement,
  StackConfig,
} from '../interface';
import type { ComponentsType } from '../Notification';
import type {
  NotificationClassNames,
  NotificationStyles,
} from '../NotificationList';
import type { NotificationsProps, NotificationsRef } from '../Notifications';

import { computed, onMounted, shallowRef, unref, watch } from 'vue';

import Notifications from '../Notifications';

const defaultGetContainer = () => document.body;

type OptionalConfig = Partial<NotificationListConfig>;

export interface NotificationConfig {
  /** @private. Config for notification holder style. Safe to remove if refactor */
  className?: (placement: Placement) => string;
  classNames?: NotificationClassNames;
  closable?: ClosableType;
  components?: ComponentsType;
  duration?: false | null | number;
  /** Customize container. It will repeat call which means you should return same container element. */
  getContainer?: () => HTMLElement | ShadowRoot;
  maxCount?: number;
  motion?:
    | ((placement: Placement) => TransitionGroupProps)
    | TransitionGroupProps;
  /** @private Trigger when all the notification closed. */
  onAllRemoved?: VoidFunction;
  pauseOnHover?: boolean;
  placement?: Placement;
  prefixCls?: string;
  /** @private Slot for style in Notifications */
  renderNotifications?: NotificationsProps['renderNotifications'];
  showProgress?: boolean;
  stack?: StackConfig;
  /** @private. Config for notification holder style. Safe to remove if refactor */
  style?: (placement: Placement) => CSSProperties;
  styles?: NotificationStyles;
}

export interface NotificationAPI {
  close: (key: Key) => void;
  destroy: () => void;
  open: (config: OptionalConfig) => void;
}

interface OpenTask {
  config: NotificationListConfig;
  type: 'open';
}

interface CloseTask {
  key: Key;
  type: 'close';
}

interface DestroyTask {
  type: 'destroy';
}

type Task = CloseTask | DestroyTask | OpenTask;

let uniqueKey = 0;

function mergeConfig<T>(...objList: Partial<T>[]): T {
  const clone: any = {};
  objList.forEach((obj: any) => {
    if (obj) {
      Object.keys(obj).forEach((key) => {
        const val = obj[key];
        if (val !== undefined) {
          clone[key] = val;
        }
      });
    }
  });
  return clone;
}

export default function useNotification(
  rootConfig: MaybeRef<NotificationConfig> = {},
): [NotificationAPI, () => VueNode] {
  const configRef = computed(() => unref(rootConfig) || {});
  const container = shallowRef<HTMLElement | ShadowRoot>();
  const notificationRef = shallowRef<NotificationsRef>();

  const shareConfig = computed(() => {
    const {
      getContainer,
      motion,
      prefixCls,
      maxCount,
      className,
      style,
      onAllRemoved,
      stack,
      renderNotifications,
      pauseOnHover,
      classNames,
      styles,
      components,
      ...restConfig
    } = configRef.value;
    return restConfig;
  });

  const resolveContainer = () => {
    const getContainer = configRef.value.getContainer || defaultGetContainer;
    return getContainer();
  };

  const contextHolder = () => (
    <Notifications
      className={configRef.value.className}
      classNames={configRef.value.classNames}
      components={configRef.value.components}
      container={container.value}
      maxCount={configRef.value.maxCount}
      motion={configRef.value.motion}
      onAllRemoved={configRef.value.onAllRemoved}
      pauseOnHover={configRef.value.pauseOnHover}
      prefixCls={configRef.value.prefixCls}
      ref={notificationRef}
      renderNotifications={configRef.value.renderNotifications}
      stack={configRef.value.stack}
      style={configRef.value.style}
      styles={configRef.value.styles}
    />
  );

  const taskQueue = shallowRef<Task[]>([]);

  const api: NotificationAPI = {
    open(config) {
      const mergedConfig = mergeConfig<NotificationListConfig>(
        shareConfig.value as any,
        config,
      );
      if (mergedConfig.key === null || mergedConfig.key === undefined) {
        mergedConfig.key = `headless-notification-${uniqueKey}`;
        uniqueKey += 1;
      }
      taskQueue.value = [
        ...taskQueue.value,
        { type: 'open', config: mergedConfig },
      ];
    },
    close(key) {
      taskQueue.value = [...taskQueue.value, { type: 'close', key }];
    },
    destroy() {
      taskQueue.value = [...taskQueue.value, { type: 'destroy' }];
    },
  };

  onMounted(() => {
    container.value = resolveContainer();
  });
  watch(
    () => configRef.value.getContainer,
    () => {
      container.value = resolveContainer();
    },
  );
  watch(taskQueue, () => {
    if (!(notificationRef.value && taskQueue.value.length > 0)) {
      return;
    }

    taskQueue.value.forEach((task) => {
      switch (task.type) {
        case 'close': {
          notificationRef.value?.close(task.key);
          break;
        }
        case 'destroy': {
          notificationRef.value?.destroy();
          break;
        }
        case 'open': {
          notificationRef.value?.open(task.config);
          break;
        }
        default: {
          break;
        }
      }
    });
    taskQueue.value = [];
  });

  return [api, contextHolder];
}
