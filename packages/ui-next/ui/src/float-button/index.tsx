import type { App } from 'vue';

import BackTop from './BackTop';
import FloatButton from './FloatButton';
import FloatButtonGroup from './FloatButtonGroup';
import PurePanel from './PurePanel';

(FloatButton as any).BackTop = BackTop;
(FloatButton as any).Group = FloatButtonGroup;
(FloatButton as any)._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

(FloatButton as any).install = (app: App) => {
  app.component(FloatButton.name, FloatButton);
  app.component(FloatButtonGroup.name, FloatButtonGroup);
  app.component(BackTop.name, BackTop);
};

export { BackTop, FloatButtonGroup };

export default FloatButton;

export { type FloatButtonProps, type FloatButtonRef } from './FloatButton';
export { type FloatButtonGroupProps } from './FloatButtonGroup';
