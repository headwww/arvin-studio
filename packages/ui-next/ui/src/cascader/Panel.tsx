import type { SlotsType } from 'vue';

import type {
  CascaderDefaultOptionType as DefaultOptionType,
  CascaderProps as VcCascaderProps,
} from '@arvin-studio/headless';

import type { CascaderProps } from './index';

import { computed, defineComponent } from 'vue';

import { CascaderPanel as VcCascaderPanel } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import { DefaultRenderEmpty } from '../config-provider/default-render-empty';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useBase from './hooks/useBase';
import useCheckable from './hooks/useCheckable';
import useIcons from './hooks/useIcons';
import useStyle from './style';
import usePanelStyle from './style/panel';

export type PanelPickType =
  | 'changeOnSelect'
  | 'defaultValue'
  | 'direction'
  | 'disabled'
  | 'expandIcon'
  | 'expandTrigger'
  | 'fieldNames'
  | 'loadData'
  | 'loadingIcon'
  | 'multiple'
  | 'notFoundContent'
  | 'optionRender'
  | 'options'
  | 'prefixCls'
  | 'rootClass'
  | 'showCheckedStrategy'
  | 'value';

export interface CascaderPanelProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean = boolean,
> /* @vue-ignore */
  extends
    CascaderPanelEmitsProps,
    Pick<CascaderProps<OptionType, ValueField, Multiple>, PanelPickType> {}

export interface CascaderPanelEmits {
  change: NonNullable<VcCascaderProps['onChange']>;
  'update:value': (value: any) => void;
}
export interface CascaderPanelEmitsProps {
  onChange?: CascaderPanelEmits['change'];
  'onUpdate:value'?: CascaderPanelEmits['update:value'];
}

export interface CascaderPanelSlots {
  expandIcon?: () => any;
  notFoundContent?: () => any;
  optionRender?: (option: DefaultOptionType) => any;
}

const CascaderPanel = defineComponent<
  CascaderPanelProps,
  CascaderPanelEmits,
  string,
  SlotsType<CascaderPanelSlots>
>(
  (props, { attrs, emit, slots }) => {
    const { prefixCls: customizePrefixCls, direction: propDirection } =
      toPropsRefs(props, 'prefixCls', 'direction');
    const {
      cascaderPrefixCls,
      direction: mergedDirection,
      renderEmpty,
    } = useBase(customizePrefixCls, propDirection);

    const { expandIcon: contextExpandIcon, loadingIcon: contextLoadingIcon } =
      useComponentBaseConfig('cascader', props, ['expandIcon', 'loadingIcon']);
    const isRtl = computed(() => mergedDirection.value === 'rtl');

    const rootCls = useCSSVarCls(cascaderPrefixCls);
    const [hashId, cssVarCls] = useStyle(cascaderPrefixCls, rootCls);
    usePanelStyle(cascaderPrefixCls);

    const disabled = useDisabledContext();
    const mergedDisabled = computed(() => props.disabled ?? disabled.value);

    const onChange: VcCascaderProps['onChange'] = (value, selectedOptions) => {
      emit('change', value, selectedOptions);
      emit('update:value', value);
    };

    return () => {
      const {
        rootClass,
        multiple,
        optionRender,
        expandIcon,
        prefixCls: _prefixCls,
        direction: _direction,
        loadingIcon,
        ...rest
      } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const customExpandIcon =
        getSlotPropsFnRun(slots, props, 'expandIcon', false) ?? expandIcon;
      const { expandIcon: mergedExpandIcon, loadingIcon: mergedLoadingIcon } =
        useIcons({
          contextExpandIcon: contextExpandIcon.value,
          contextLoadingIcon: contextLoadingIcon.value,
          expandIcon: customExpandIcon,
          loadingIcon,
          isRtl: isRtl.value,
        });
      const checkable = useCheckable(cascaderPrefixCls.value, multiple);

      const slotNotFound = getSlotPropsFnRun(
        slots,
        props,
        'notFoundContent',
        false,
      );
      let mergedNotFoundContent = slotNotFound;
      // eslint-disable-next-line unicorn/prefer-ternary
      if (slotNotFound === undefined) {
        mergedNotFoundContent = renderEmpty.value?.('Cascader') || (
          <DefaultRenderEmpty componentName="Cascader" />
        );
      }

      const mergedOptionRender = slots.optionRender
        ? (option: DefaultOptionType) => slots.optionRender?.(option)
        : optionRender;

      return (
        <VcCascaderPanel
          {...restAttrs}
          {...(rest as any)}
          checkable={checkable}
          className={clsx(
            rootClass,
            cssVarCls.value,
            rootCls.value,
            hashId.value,
            className,
          )}
          direction={mergedDirection.value}
          disabled={mergedDisabled.value}
          expandIcon={mergedExpandIcon}
          loadingIcon={mergedLoadingIcon}
          notFoundContent={mergedNotFoundContent}
          onChange={onChange}
          optionRender={mergedOptionRender}
          prefixCls={cascaderPrefixCls.value}
          style={style}
        />
      );
    };
  },
  {
    name: 'AsCascaderPanel',
    inheritAttrs: false,
  },
);

export default CascaderPanel;
