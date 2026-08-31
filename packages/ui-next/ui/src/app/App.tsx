import type { App as AppVue } from 'vue';

import type { ComponentBaseProps } from '../config-provider/context';
import type { AppConfig } from './context';

import { computed, defineComponent, Fragment } from 'vue';

import { getAttrStyleAndClass } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { useComponentBaseConfig } from '../config-provider/context';
import { useMessage } from '../message';
import { useModal } from '../modal';
import { useNotification } from '../notification';
import {
  AppConfigProvider,
  useAppConfig,
  useAppContextProvider,
} from './context';
import useStyle from './style';

export interface AppProps extends AppConfig, ComponentBaseProps {
  component?: any;
}

const App = defineComponent<AppProps>(
  (props, { slots, attrs, expose }) => {
    const {
      direction,
      prefixCls,
      class: contextClassName,
      style: contextStyle,
    } = useComponentBaseConfig('app', props);
    const [hashId, cssVarCls] = useStyle(prefixCls);

    const appConfig = useAppConfig();

    const mergedAppConfig = computed(() => {
      return {
        message: { ...appConfig.message, ...props?.message },
        notification: { ...appConfig.notification, ...props?.notification },
      };
    });

    const [messageApi, MessageContextHolder] = useMessage(
      computed(() => mergedAppConfig?.value?.message) as any,
    );

    const [notificationApi, NotificationContextHolder] = useNotification(
      computed(() => mergedAppConfig?.value?.notification) as any,
    );
    const [ModalApi, ModalContextHolder] = useModal();

    useAppContextProvider({
      message: messageApi,
      notification: notificationApi,
      modal: ModalApi,
    });

    // Expose imperative API so consumers can call e.g. ref.value.message.success().
    // Mirrors ant-design 6.4.0 PR #56951.
    expose({
      message: messageApi,
      notification: notificationApi,
      modal: ModalApi,
    });

    return () => {
      const { rootClass } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const customClassName = clsx(
        hashId.value,
        prefixCls.value,
        className,
        rootClass,
        cssVarCls.value,
        {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
      );
      const { component = 'div' } = props;

      // ============================ Render ============================
      const Component = component === false ? Fragment : component;
      const rootProps = {
        ...restAttrs,
        class: clsx(contextClassName.value, customClassName),
        style: { ...contextStyle.value, ...style },
      };
      return (
        <AppConfigProvider {...mergedAppConfig.value}>
          <Component {...(component === false ? undefined : rootProps)}>
            <MessageContextHolder />
            <NotificationContextHolder />
            <ModalContextHolder />
            {slots?.default?.()}
          </Component>
        </AppConfigProvider>
      );
    };
  },
  {
    name: 'AsApp',
    inheritAttrs: false,
  },
);

(App as any).install = (app: AppVue) => {
  app.component(App.name, App);
};

export default App;
