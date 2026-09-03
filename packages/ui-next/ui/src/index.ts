import type { App, Plugin } from 'vue';

import { StyleProvider } from '@arvin-studio/cssinjs';

import * as components from './components';
import version from './version';

export * from './components';

export type { ThemeConfig } from './config-provider/context';

let prefix = 'As';

export function setPrefix(newPrefix: string) {
  prefix = newPrefix;
}

export function install(app: App) {
  app.config.globalProperties._as_prefix = prefix;
  Object.keys(components).forEach((key) => {
    const component = (components as any)[key];
    if ('install' in component) {
      app.use(component);
    }
  });
  app.component('AsStyleProvider', StyleProvider);
}

export default {
  setPrefix,
  install,
  version,
} as Plugin;

export { type SizeType } from './config-provider/size-context';
export type { GlobalToken } from './theme';
export { StyleProvider, version };

export { default as theme } from './theme';
