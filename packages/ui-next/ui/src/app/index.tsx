import type { App as AppPlugin } from 'vue';

import App_ from './App';
import useApp from './useApp';

type CompoundedComponent = typeof App_ & {
  useApp: typeof useApp;
};

const App = App_ as CompoundedComponent;
(App as any).install = (app: AppPlugin) => {
  app.component(App.name, App);
};

App.useApp = useApp;

export default App as typeof App_ & {
  useApp: typeof useApp;
};

export { type AppProps } from './App';
