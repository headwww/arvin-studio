import type { AnimatedConfig } from '@arvin-studio/headless';

import type { TabsProps } from '..';

import { getTransitionName, getTransitionProps } from '@arvin-studio/headless';

export default function useAnimateConfig(
  prefixCls: string,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  animated: TabsProps['animated'] = {
    inkBar: true,
    tabPane: false,
  },
): AnimatedConfig {
  let mergedAnimated: AnimatedConfig;

  if (animated === false) {
    mergedAnimated = {
      inkBar: false,
      tabPane: false,
    };
  } else if (animated === true) {
    mergedAnimated = {
      inkBar: true,
      tabPane: true,
    };
  } else {
    mergedAnimated = {
      inkBar: true,
      ...(typeof animated === 'object' && animated),
    };
  }

  if (mergedAnimated.tabPane) {
    mergedAnimated.tabPaneMotion = getTransitionProps(
      getTransitionName(prefixCls, 'switch'),
      { appear: false },
    );
  }

  return mergedAnimated;
}
