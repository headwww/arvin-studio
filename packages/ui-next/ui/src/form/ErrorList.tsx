import type { CSSProperties } from 'vue';

import type { VueNode } from '../_util';
import type { ValidateStatus } from './FormItem';

import { computed, defineComponent, Transition, TransitionGroup } from 'vue';

import {
  getTransitionGroupProps,
  getTransitionProps,
} from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import initCollapseMotion from '../_util/motion';
import { getSlotPropsFnRun } from '../_util/tools';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useFormItemPrefixContext } from './context';
import useStyle from './style';

const EMPTY_LIST: any[] = [];

interface ErrorEntity {
  class?: string;
  error: any;
  errorStatus?: string;
  key: string;
  style?: CSSProperties;
}

function toErrorEntity(
  error: any,
  prefix: string,
  errorStatus?: string,
  index = 0,
): ErrorEntity {
  return {
    key: typeof error === 'string' ? error : `${prefix}-${index}`,
    error,
    errorStatus,
  };
}

export interface ErrorListProps {
  errors?: any[];
  fieldId?: string;
  help?: VueNode;
  /** ant-design 6.4 #57607: per-item class for each help/error line. */
  helpItemClassName?: string;
  helpItemStyle?: CSSProperties;
  helpStatus?: ValidateStatus;
  onVisibleChanged?: (visible: boolean) => void;
  warnings?: any[];
}

const ErrorList = defineComponent<ErrorListProps>(
  (props, { attrs }) => {
    const formItemPrefixContext = useFormItemPrefixContext();
    const prefixCls = computed(
      () => formItemPrefixContext.value?.prefixCls ?? '',
    );
    const baseClassName = computed(() => `${prefixCls.value}-item-explain`);
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    // We have to debounce here again since somewhere use ErrorList directly still need no shaking
    // ref: https://github.com/ant-design/ant-design/issues/36336
    return () => {
      const { fieldId, errors, warnings, helpStatus } = props;
      const help = getSlotPropsFnRun({}, props, 'help');

      const debounceErrors = errors || EMPTY_LIST;
      const debouncedWarnings = warnings || EMPTY_LIST;
      const hasHelp = isNonNullable(help);
      const fullKeyListFn = () => {
        if (hasHelp) {
          return [toErrorEntity(help, 'help', helpStatus)];
        }
        return [
          ...debounceErrors.map((error, index) =>
            toErrorEntity(error, 'error', 'error', index),
          ),
          ...debouncedWarnings.map((warning, index) =>
            toErrorEntity(warning, 'warning', 'warning', index),
          ),
        ];
      };
      const fullKeyList = fullKeyListFn();

      const filledKeyFullKeyListFn = () => {
        const keysCount: Record<string, number> = {};
        fullKeyList.forEach(({ key }) => {
          keysCount[key] = (keysCount[key] || 0) + 1;
        });
        return fullKeyList.map((entity, index) => ({
          ...entity,
          key:
            keysCount[entity.key]! > 1
              ? `${entity.key}-fallback-${index}`
              : entity.key,
        }));
      };
      const filledKeyFullKeyList = filledKeyFullKeyListFn() as ErrorEntity[];

      const helpProps: { id?: string } = {};

      if (fieldId) {
        helpProps.id = `${fieldId}_help`;
      }

      const { className: rootClassName } = getAttrStyleAndClass(attrs);
      const collapseMotion = initCollapseMotion(prefixCls.value);
      const transitionPropsName = `${prefixCls.value}-show-help`;
      const transitionProps = {
        name: transitionPropsName,
        ...getTransitionProps(transitionPropsName),
        appear: true,
        css: true,
        onAfterEnter: () => {
          props.onVisibleChanged?.(true);
        },
        onAfterLeave: () => {
          props.onVisibleChanged?.(false);
        },
      };
      const transitionGroupPropsName = `${prefixCls.value}-show-help-item`;
      const transitionGroupProps = {
        ...getTransitionGroupProps(transitionGroupPropsName),
        ...collapseMotion,
        name: `${prefixCls.value}-show-help-item`,
      };
      return (
        <Transition {...transitionProps}>
          {filledKeyFullKeyList.length > 0 && (
            <div
              class={clsx(
                baseClassName.value,
                cssVarCls.value,
                rootCls.value,
                rootClassName,
                hashId.value,
              )}
            >
              <TransitionGroup {...transitionGroupProps} appear={true}>
                {filledKeyFullKeyList.map((itemProps) => {
                  const {
                    key,
                    error,
                    errorStatus,
                    class: itemClassName,
                    style: itemStyle,
                  } = itemProps;
                  return (
                    <div
                      class={clsx(itemClassName, props.helpItemClassName, {
                        [`${baseClassName.value}-${errorStatus}`]:
                          !!errorStatus,
                      })}
                      key={key}
                      style={{ ...props.helpItemStyle, ...itemStyle }}
                    >
                      {error}
                    </div>
                  );
                })}
              </TransitionGroup>
            </div>
          )}
        </Transition>
      );
    };
  },
  {
    name: 'FormErrorList',
    inheritAttrs: false,
  },
);

export default ErrorList;
