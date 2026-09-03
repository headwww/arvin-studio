import type { VueNode } from '../_util';
import type { ColProps } from '../grid';
import type { ValidateStatus } from './FormItem';
import type { ColPropsWithClass } from './FormItemLabel.tsx';

import { computed, defineComponent, nextTick, shallowRef, watch } from 'vue';

import { filterEmpty, get, set } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import { responsiveArrayReversed } from '../_util/responsiveObserver';
import { getSlotPropsFnRun } from '../_util/tools';
import { Col } from '../grid';
import {
  FormItemPrefixContextProvider,
  useFormContext,
  useFormContextProvider,
} from './context';
import ErrorList from './ErrorList';
import FallbackCmp from './style/fallbackCmp';

const GRID_MAX = 24;

interface FormItemInputMiscProps {
  errors: any[];
  marginBottom?: null | number;
  onErrorVisibleChanged?: (visible: boolean) => void;
  prefixCls: string;
  warnings: any[];
}

export interface FormItemInputProps {
  extra?: VueNode;
  fieldId?: string;
  help?: VueNode;
  label?: VueNode;
  labelCol?: ColProps;
  status?: ValidateStatus;
  wrapperCol?: ColProps;
}

const FormItemInput = defineComponent<
  FormItemInputMiscProps & FormItemInputProps
>(
  (props, { slots }) => {
    const baseClassName = computed(() => `${props.prefixCls}-item`);
    const formContext = useFormContext();
    const contextClassNames = computed(() => formContext.value?.classes ?? {});
    const contextStyles = computed(() => formContext.value?.styles ?? {});

    const extraRef = shallowRef<HTMLDivElement>();
    const extraHeight = shallowRef(0);

    watch(
      () => props.extra,
      async () => {
        await nextTick();
        extraHeight.value =
          props.extra && extraRef.value ? extraRef.value.clientHeight : 0;
      },
      {
        immediate: true,
      },
    );

    const subFormContext = computed(() =>
      omit(formContext.value ?? {}, ['labelCol', 'wrapperCol']),
    );
    useFormContextProvider(subFormContext);

    return () => {
      const {
        wrapperCol,
        labelCol,
        marginBottom,
        warnings,
        errors,
        prefixCls,
        status,
        fieldId,
        onErrorVisibleChanged,
      } = props;
      const label = getSlotPropsFnRun({}, props, 'label');
      const extra = getSlotPropsFnRun({}, props, 'extra');
      const help = getSlotPropsFnRun({}, props, 'help');
      const children = filterEmpty(slots?.default?.() ?? []);
      const mergedWrapperColFn = () => {
        let mergedWrapper: ColPropsWithClass = {
          // eslint-disable-next-line unicorn/no-useless-fallback-in-spread
          ...(wrapperCol || formContext.value?.wrapperCol || {}),
        } as ColPropsWithClass;
        if (
          label === null &&
          !labelCol &&
          !wrapperCol &&
          formContext.value?.labelCol
        ) {
          const list = [undefined, ...responsiveArrayReversed] as const;
          list.forEach((size) => {
            const _size = size ? [size] : [];
            const formLabel = get(formContext?.value?.labelCol, _size);
            const formLabelObj = typeof formLabel === 'object' ? formLabel : {};

            const wrapper = get(mergedWrapper, _size);
            const wrapperObj = typeof wrapper === 'object' ? wrapper : {};
            if (
              'span' in formLabelObj &&
              !('offset' in wrapperObj) &&
              formLabelObj.span < GRID_MAX
            ) {
              mergedWrapper = set(
                mergedWrapper,
                [..._size, 'offset'],
                formLabelObj.span,
              );
            }
          });
        }
        return mergedWrapper;
      };
      const mergedWrapperCol = mergedWrapperColFn();

      const className = clsx(
        `${baseClassName.value}-control`,
        mergedWrapperCol?.class,
      );
      // Pass to sub FormItem should not with col info
      const inputDom = (
        <div class={`${baseClassName.value}-control-input`}>
          <div
            class={clsx(
              `${baseClassName.value}-control-input-content`,
              contextClassNames.value?.content,
            )}
            style={contextStyles.value?.content}
          >
            {children}
          </div>
        </div>
      );
      const errorListDom =
        marginBottom !== null || errors.length > 0 || warnings.length > 0 ? (
          <FormItemPrefixContextProvider prefixCls={prefixCls} status={status}>
            <ErrorList
              class={clsx(
                `${baseClassName.value}-explain-connected`,
                contextClassNames.value?.help,
              )}
              errors={errors}
              fieldId={fieldId}
              help={help}
              helpItemClassName={contextClassNames.value?.helpItem}
              helpItemStyle={contextStyles.value?.helpItem}
              helpStatus={status}
              onVisibleChanged={onErrorVisibleChanged}
              style={contextStyles.value?.help}
              warnings={warnings}
            />
          </FormItemPrefixContextProvider>
        ) : null;

      const extraProps: { id?: string } = {};

      if (fieldId) {
        extraProps.id = `${fieldId}_extra`;
      }

      // If extra = 0, && will goes wrong
      // 0&&error -> 0

      const extraDom = extra ? (
        <div
          {...extraProps}
          class={clsx(
            `${baseClassName.value}-extra`,
            contextClassNames.value?.extra,
          )}
          ref={extraRef}
          style={contextStyles.value?.extra}
        >
          {extra}
        </div>
      ) : null;
      const additionalDom =
        errorListDom || extraDom ? (
          <div
            class={`${baseClassName.value}-additional`}
            style={
              marginBottom
                ? { minHeight: `${marginBottom + extraHeight.value}px` }
                : {}
            }
          >
            {errorListDom}
            {extraDom}
          </div>
        ) : null;
      const dom = (
        <>
          {inputDom}
          {additionalDom}
        </>
      );
      return (
        <>
          <Col {...mergedWrapperCol} class={className}>
            {dom}
          </Col>
          <FallbackCmp prefixCls={prefixCls} />
        </>
      );
    };
  },
  {
    name: 'FormItemInput',
    inheritAttrs: false,
  },
);

export default FormItemInput;
