import type { FloatButtonProps } from './FloatButton';
import type { FloatButtonGroupProps } from './FloatButtonGroup';

import { computed, defineComponent } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import { pureAttrs } from '../_util/hooks';
import { useConfig } from '../config-provider/context';
import BackTop from './BackTop';
import FloatButton, { floatButtonPrefixCls } from './FloatButton';
import FloatButtonGroup from './FloatButtonGroup';

export interface PureFloatButtonProps extends Omit<FloatButtonProps, 'target'> {
  backTop?: boolean;
}

type ClassNamesType =
  | FloatButtonGroupProps['classes']
  | PureFloatButtonProps['classes'];
type StylesType =
  | FloatButtonGroupProps['styles']
  | PureFloatButtonProps['styles'];

export interface PurePanelProps
  extends
    Omit<PureFloatButtonProps, 'classes' | 'styles'>,
    Omit<FloatButtonGroupProps, 'classes' | 'styles'> {
  classes?: ClassNamesType;
  /** Convert to FloatGroup when configured */
  items?: PureFloatButtonProps[];
  styles?: StylesType;
}

const PureFloatButton = defineComponent<PureFloatButtonProps>(
  (props, { slots, attrs }) => {
    return () => {
      if (props.backTop) {
        return (
          <BackTop
            {...(attrs as any)}
            {...omit(props, ['backTop'])}
            v-slots={slots}
            visibilityHeight={0}
          />
        );
      }
      return (
        <FloatButton
          {...omit(props, ['backTop'])}
          v-slots={slots}
          {...(attrs as any)}
        />
      );
    };
  },
  {
    name: 'AsFloatButtonPure',
    inheritAttrs: false,
  },
);

const PurePanel = defineComponent<PurePanelProps>(
  (props, { attrs, slots }) => {
    const config = useConfig();
    const prefixCls = computed(() =>
      config.value?.getPrefixCls?.(floatButtonPrefixCls, props.prefixCls),
    );
    const pureCls = computed(() => `${prefixCls.value}-pure`);

    const renderItems = () =>
      (props.items ?? []).map((item, index) => (
        <PureFloatButton key={index} {...item} />
      ));

    return () => {
      if (props.items && props.items.length > 0) {
        return (
          <FloatButtonGroup
            {...pureAttrs(attrs)}
            {...omit(props, ['items', 'classes', 'styles'])}
            class={clsx((attrs as any).class, pureCls.value)}
            classes={props.classes as FloatButtonGroupProps['classes']}
            styles={props.styles as FloatButtonGroupProps['styles']}
            v-slots={{ default: () => renderItems() }}
          />
        );
      }

      return (
        <PureFloatButton
          {...pureAttrs(attrs)}
          {...omit(props, ['items'])}
          class={clsx((attrs as any).class, pureCls.value)}
          classes={props.classes as FloatButtonProps['classes']}
          styles={props.styles as FloatButtonProps['styles']}
          v-slots={slots}
        />
      );
    };
  },
  {
    name: 'AsFloatButtonPurePanel',
    inheritAttrs: false,
  },
);

export default PurePanel;
