import type { InjectionKey } from 'vue';

import type {
  ConfigOptions as MessageConfig,
  MessageInstance,
} from '../message/interface';
import type { HookAPI as ModalHookAPI } from '../modal/useModal';
import type {
  NotificationConfig,
  NotificationInstance,
} from '../notification/interface';

import { defineComponent, inject, provide } from 'vue';

export interface AppConfig {
  message?: MessageConfig;
  notification?: NotificationConfig;
}

const AppConfigContextKey: InjectionKey<AppConfig> = Symbol('AppConfigContext');

export const AppConfigProvider = defineComponent<AppConfig>(
  (props, { slots }) => {
    provide(AppConfigContextKey, props);
    return () => {
      return slots?.default?.();
    };
  },
  {
    inheritAttrs: false,
    props: ['message', 'notification'],
  },
);

export function useAppConfig() {
  return inject(AppConfigContextKey, {} as AppConfig);
}

export interface useAppProps {
  message: MessageInstance;
  modal: ModalHookAPI;
  notification: NotificationInstance;
}

const AppContextKey: InjectionKey<useAppProps> = Symbol('AppContext');

export function useAppContext() {
  return inject(AppContextKey, {
    message: {},
    notification: {},
    modal: {},
  } as useAppProps);
}

export function useAppContextProvider(value: useAppProps) {
  provide(AppContextKey, value);
}
