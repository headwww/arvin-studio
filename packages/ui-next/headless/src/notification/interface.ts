import type { ComponentsType, NotificationProps } from './Notification';

export type Placement =
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'top'
  | 'topLeft'
  | 'topRight';

export type Key = number | string;

export type StackConfig =
  | boolean
  | {
      /**
       * Vertical offset applied between stacked notices.
       * @default 8
       */
      offset?: number;
      /**
       * When the notice count exceeds this threshold, notices will be stacked.
       * @default 3
       */
      threshold?: number;
    };

/**
 * Configuration accepted by the public `api.open` call.
 * Mirrors rc-notification@2.0 NotificationListConfig.
 */
export interface NotificationListConfig extends Omit<
  NotificationProps,
  'prefixCls'
> {
  key: Key;
  placement?: Placement;
  times?: number;
}

export type Placements = Partial<Record<Placement, NotificationListConfig[]>>;

export type InnerOpenConfig = NotificationListConfig & { times?: number };

// Re-export common surfaces consumers used to import from interface.ts directly.
export type { ComponentsType, NotificationProps };

export { type ClosableType } from './hooks/useClosable';
