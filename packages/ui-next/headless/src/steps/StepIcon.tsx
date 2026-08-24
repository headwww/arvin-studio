import type { CSSProperties, InjectionKey, Ref } from 'vue';

import { computed, defineComponent, inject, provide, ref } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass, pickAttrs } from '../util';
import { useStepsContext } from './Context';

export interface StepIconSemanticContextProps {
  className?: string;
  style?: CSSProperties;
}

const StepIconSemanticKey: InjectionKey<Ref<StepIconSemanticContextProps>> =
  Symbol('StepIconSemanticContext');

export function useStepIconSemanticContext() {
  return inject(
    StepIconSemanticKey,
    ref({}),
  ) as Ref<StepIconSemanticContextProps>;
}

export const StepIconSemanticContextProvider = defineComponent<{
  value: StepIconSemanticContextProps;
}>((props, { slots }) => {
  provide(
    StepIconSemanticKey,
    computed(() => props.value),
  );
  return () => {
    return slots?.default?.();
  };
});

const StepIcon = defineComponent(
  (_, { attrs, slots }) => {
    const stepsContext = useStepsContext();
    const stepIconSemanticContext = useStepIconSemanticContext();
    return () => {
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const {
        prefixCls,
        classNames = {},
        styles = {},
      } = stepsContext.value ?? {};

      const { className: itemClassName, style: itemStyle } =
        stepIconSemanticContext.value ?? {};

      const itemCls = `${prefixCls}-item`;

      return (
        <div
          {...pickAttrs(restAttrs, false)}
          class={clsx(
            `${itemCls}-icon`,
            classNames.itemIcon,
            itemClassName,
            className,
          )}
          style={[styles.itemIcon, itemStyle, style]}
        >
          {slots?.default?.()}
        </div>
      );
    };
  },
  {
    name: 'StepIcon',
    inheritAttrs: false,
  },
);

export default StepIcon;
