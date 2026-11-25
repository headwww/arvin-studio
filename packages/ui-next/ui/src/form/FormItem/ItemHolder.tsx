import type { ReportMetaChange } from '../context';
import type { Meta } from '../types';
import type { FormItemProps } from './index';

import { computed, defineComponent, nextTick, shallowRef, watch } from 'vue';

import { isVisible } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../../_util/hooks';
import isNonNullable from '../../_util/isNonNullable';
import { Row } from '../../grid';
import { NoStyleItemContextProvider, useFormContext } from '../context';
import FormItemInput from '../FormItemInput';
import FormItemLabel from '../FormItemLabel';
import { getStatus } from '../util';
import StatusProvider from './StatusProvider';

export type ItemHolderProps = FormItemProps & {
  errors: any[];
  fieldId?: string;
  isRequired?: boolean;
  meta: Meta;
  onSubItemMetaChange: ReportMetaChange;
  warnings: any[];
};

const ItemHolder = defineComponent<ItemHolderProps>(
  (props, { attrs, slots }) => {
    const itemPrefixCls = computed(() => `${props.prefixCls}-item`);
    const formContext = useFormContext();
    const layout = computed(() => props?.layout ?? formContext.value?.layout);
    const vertical = computed(() => layout.value === 'vertical');
    // ======================== Margin ========================
    const itemRef = shallowRef<HTMLDivElement>();
    const hasHelp = computed(() => isNonNullable(props.help));
    const hasError = computed(
      () =>
        !!(hasHelp.value || props?.errors?.length || props?.warnings?.length),
    );
    const isOnScreen = computed(
      () => !!itemRef.value && isVisible(itemRef.value),
    );
    const marginBottom = shallowRef();
    watch(
      [hasError, isOnScreen],
      async () => {
        await nextTick();
        if (hasError.value && itemRef.value) {
          // The element must be part of the DOMTree to use getComputedStyle
          // https://stackoverflow.com/questions/35360711/getcomputedstyle-returns-a-cssstyledeclaration-but-all-properties-are-empty-on-a
          const itemStyle = getComputedStyle(itemRef.value);
          marginBottom.value = Number.parseInt(itemStyle.marginBottom, 10);
        }
      },
      {
        immediate: true,
      },
    );
    const onErrorVisibleChanged = (visible: boolean) => {
      if (!visible) {
        marginBottom.value = null;
      }
    };

    // ======================== Status ========================
    function getValidateState(isDebounce = false) {
      const _errors = isDebounce ? props?.errors : props?.meta?.errors;
      const _warnings = isDebounce ? props?.warnings : props?.meta?.warnings;
      return getStatus(
        _errors,
        _warnings,
        props?.meta,
        '',
        !!props?.hasFeedback,
        props?.validateStatus,
      );
    }

    return () => {
      const mergedValidateStatus = getValidateState();
      const {
        prefixCls,
        rootClass,
        hasFeedback,
        hidden,
        fieldId,
        required,
        isRequired,
        meta,
        help,
        onSubItemMetaChange,
        name,
      } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const debounceErrors = props?.errors;
      const debounceWarnings = props?.warnings;

      // ======================== Render ========================
      const itemClassName = clsx(itemPrefixCls.value, className, rootClass, {
        [`${itemPrefixCls.value}-with-help`]:
          hasHelp.value || debounceErrors.length || debounceWarnings.length,

        // Status
        [`${itemPrefixCls.value}-has-feedback`]:
          mergedValidateStatus && hasFeedback,
        [`${itemPrefixCls.value}-has-success`]:
          mergedValidateStatus === 'success',
        [`${itemPrefixCls.value}-has-warning`]:
          mergedValidateStatus === 'warning',
        [`${itemPrefixCls.value}-has-error`]: mergedValidateStatus === 'error',
        [`${itemPrefixCls.value}-is-validating`]:
          mergedValidateStatus === 'validating',
        [`${itemPrefixCls.value}-hidden`]: hidden,

        // Layout
        [`${itemPrefixCls.value}-${layout.value}`]: layout.value,
      });
      return (
        <div class={itemClassName} ref={itemRef} style={style}>
          <Row class={`${itemPrefixCls.value}-row`} {...restAttrs}>
            {/* Label */}
            <FormItemLabel
              {...props}
              htmlFor={props.htmlFor ?? fieldId}
              prefixCls={prefixCls!}
              required={required ?? isRequired}
              requiredMark={formContext.value?.requiredMark}
              vertical={vertical.value!}
            />
            {/* Input Group */}

            <FormItemInput
              {...props}
              {...meta}
              errors={debounceErrors}
              help={help}
              marginBottom={marginBottom.value}
              onErrorVisibleChanged={onErrorVisibleChanged}
              prefixCls={prefixCls!}
              status={mergedValidateStatus}
              warnings={debounceWarnings}
            >
              <NoStyleItemContextProvider value={onSubItemMetaChange}>
                <StatusProvider
                  errors={meta.errors}
                  hasFeedback={hasFeedback}
                  meta={meta}
                  name={name}
                  prefixCls={prefixCls!}
                  // Already calculated
                  validateStatus={mergedValidateStatus}
                  warnings={meta.warnings}
                >
                  {slots?.default?.()}
                </StatusProvider>
              </NoStyleItemContextProvider>
            </FormItemInput>
          </Row>
          {!!marginBottom.value && (
            <div
              class={`${itemPrefixCls.value}-margin-offset`}
              style={{
                marginBottom: `${-marginBottom.value}px`,
              }}
            />
          )}
        </div>
      );
    };
  },
  {
    name: 'FormItemHolder',
    inheritAttrs: false,
  },
);

export default ItemHolder;
