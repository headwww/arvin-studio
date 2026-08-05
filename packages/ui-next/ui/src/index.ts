import type { App } from 'vue';

import * as components from './components';

export * from './components';

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
}
