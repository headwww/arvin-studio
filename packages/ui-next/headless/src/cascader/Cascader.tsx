import type { CSSProperties } from 'vue';

import type {
  BaseSelectProps,
  BaseSelectPropsWithoutPrivate,
  BaseSelectRef,
  BaseSelectSemanticName,
  DisplayValueType,
  Placement,
} from '../select';
import type { BuildInPlacements } from '../trigger';
import type { VueNode } from '../util';
import type { SHOW_CHILD } from './utils/commonUtil';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { omit } from '@arvin-studio/kit';

import { BaseSelect } from '../select';
import useEvent from '../util/hooks/useEvent';
import useId from '../util/hooks/useId';
import useMergedState from '../util/hooks/useMergedState';
import { useCascaderProvider } from './context';
import useDisplayValues from './hooks/useDisplayValues';
import useMissingValues from './hooks/useMissingValues';
import useOptions from './hooks/useOptions';
import useSearchConfig from './hooks/useSearchConfig';
import useSearchOptions from './hooks/useSearchOptions';
import useSelect from './hooks/useSelect';
import useValues from './hooks/useValues';
import OptionList from './OptionList';
import {
  fillFieldNames,
  SHOW_PARENT,
  toPathKeys,
  toRawValues,
} from './utils/commonUtil';
import { formatStrategyValues, toPathOptions } from './utils/treeUtil';

export interface BaseOptionType {
  children?: DefaultOptionType[];
  disableCheckbox?: boolean;
  disabled?: boolean;
  isLeaf?: boolean;
  label?: VueNode;
  value?: null | number | string;
}

export type DefaultOptionType = BaseOptionType & Record<string, any>;

export interface SearchConfig<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> {
  autoClearSearchValue?: boolean;
  filter?: (
    inputValue: string,
    options: OptionType[],
    fieldNames: FieldNames<OptionType, ValueField>,
  ) => boolean;
  limit?: false | number;
  matchInputWidth?: boolean;
  onSearch?: (value: string) => void;
  render?: (
    inputValue: string,
    path: OptionType[],
    prefixCls: string,
    fieldNames: FieldNames<OptionType, ValueField>,
  ) => VueNode;
  searchValue?: string;
  sort?: (
    a: OptionType[],
    b: OptionType[],
    inputValue: string,
    fieldNames: FieldNames<OptionType, ValueField>,
  ) => number;
}

export type ShowCheckedStrategy = typeof SHOW_CHILD | typeof SHOW_PARENT;

interface BaseCascaderProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> extends Omit<
  BaseSelectPropsWithoutPrivate,
  'labelInValue' | 'mode' | 'showSearch' | 'tokenSeparators'
> {
  // Search
  /** @deprecated please use showSearch.autoClearSearchValue */
  autoClearSearchValue?: boolean;
  builtinPlacements?: BuildInPlacements;
  // Value
  changeOnSelect?: boolean;
  checkable?: boolean | VueNode;

  displayRender?: (label: string[], selectedOptions?: OptionType[]) => VueNode;
  // Icon
  expandIcon?: VueNode;
  // Trigger
  expandTrigger?: 'click' | 'hover';
  fieldNames?: FieldNames<OptionType, ValueField>;

  // MISC
  id?: string;
  loadData?: (selectOptions: OptionType[]) => void;
  loadingIcon?: VueNode;
  onPopupVisibleChange?: (open: boolean) => void;

  /** @deprecated please use showSearch.onSearch */
  onSearch?: (value: string) => void;

  optionRender?: (option: OptionType) => VueNode;
  // Options
  options?: OptionType[];
  placement?: Placement;

  popupClassName?: string;
  popupMenuColumnStyle?: CSSProperties;

  /** @private Internal usage. Do not use in your production. */
  popupPrefixCls?: string;
  prefixCls?: string;

  /** @deprecated please use showSearch.searchValue */
  searchValue?: string;

  showCheckedStrategy?: ShowCheckedStrategy;
  showSearch?: boolean | SearchConfig<OptionType>;
}

export interface FieldNames<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> {
  children?: keyof OptionType;
  label?: keyof OptionType;
  value?: keyof OptionType | ValueField;
}

export type ValueType<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> = keyof OptionType extends ValueField
  ? unknown extends OptionType['value']
    ? OptionType[ValueField]
    : OptionType['value']
  : OptionType[ValueField];

export type GetValueType<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean | VueNode = false,
> = false extends Multiple
  ? ValueType<Required<OptionType>, ValueField>[]
  : ValueType<Required<OptionType>, ValueField>[][];

export type GetOptionType<
  OptionType extends DefaultOptionType = DefaultOptionType,
  Multiple extends boolean | VueNode = false,
> = false extends Multiple ? OptionType[] : OptionType[][];

export type SemanticName = BaseSelectSemanticName;
export type PopupSemantic = 'list' | 'listItem';
export interface CascaderProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean | VueNode = false,
> extends BaseCascaderProps<OptionType, ValueField> {
  checkable?: Multiple;
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>;
  };
  defaultValue?: GetValueType<OptionType, ValueField, Multiple>;
  onChange?: (
    value: GetValueType<OptionType, ValueField, Multiple>,
    selectOptions: GetOptionType<OptionType, Multiple>,
  ) => void;
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>;
  };
  value?: GetValueType<OptionType, ValueField, Multiple>;
}

export type SingleValueType = (number | string)[];

export type LegacyKey = number | string;

export type InternalValueType = SingleValueType | SingleValueType[];

export interface InternalFieldNames extends Required<FieldNames> {
  key: string;
}

export type InternalCascaderProps = Omit<
  CascaderProps,
  'defaultValue' | 'onChange' | 'value'
> & {
  defaultValue?: InternalValueType;
  onChange?: (
    value: InternalValueType,
    selectOptions: BaseOptionType[] | BaseOptionType[][],
  ) => void;
  value?: InternalValueType;
};

export type CascaderRef = Omit<BaseSelectRef, 'scrollTo'>;

const cascaderDefaults: CascaderProps = {
  prefixCls: 'vc-cascader',
  expandIcon: '>',
  showCheckedStrategy: SHOW_PARENT,
  popupMatchSelectWidth: false,
};

const omitKeyList = [
  'id',
  'prefixCls',
  'fieldNames',
  'optionRender',

  // Value
  'value',
  'defaultValue',
  'onChange',
  'changeOnSelect',
  'displayRender',
  'checkable',
  'showCheckedStrategy',

  // Search
  'showSearch',
  'searchValue',
  'onSearch',
  'autoClearSearchValue',

  // Trigger
  'expandTrigger',

  // Options
  'options',
  'popupPrefixCls',
  'loadData',
  'popupMenuColumnStyle',

  'popupClassName',
  'popupStyle',
  'open',
  'placement',
  'builtinPlacements',
  'onPopupVisibleChange',
  'popupMatchSelectWidth',

  // Icon
  'expandIcon',
  'loadingIcon',

  // Style
  'classNames',
  'styles',
];

const Cascader = defineComponent<CascaderProps>(
  (props = cascaderDefaults, { attrs, slots, expose }) => {
    const baseSelectRef = shallowRef<BaseSelectRef | null>(null);

    expose({
      focus: (options?: FocusOptions) => baseSelectRef.value?.focus(options),
      blur: () => baseSelectRef.value?.blur(),
      nativeElement: computed(() => baseSelectRef.value?.nativeElement),
    });

    const mergedId = useId(props.id);
    const multiple = computed(() => !!props.checkable);

    // =========================== Values ===========================
    const internalRawValues = shallowRef(props?.value ?? props?.defaultValue);
    watch(
      () => props.value,
      () => {
        internalRawValues.value = props?.value;
      },
    );
    const setRawValues = (values: InternalValueType) => {
      internalRawValues.value = values as any;
    };

    const rawValues = computed(() =>
      toRawValues(internalRawValues.value as any),
    );

    // ========================= FieldNames =========================
    const mergedFieldNames = computed(() => fillFieldNames(props.fieldNames));

    // =========================== Option ===========================
    const [mergedOptions, getPathKeyEntities, getValueByKeyPath] = useOptions(
      mergedFieldNames,
      computed(() => props.options as DefaultOptionType[] | undefined),
    );

    // =========================== Search ===========================
    const [mergedShowSearch, searchConfig] = useSearchConfig(
      computed(() => props.showSearch),
      computed(() => ({
        autoClearSearchValue: props.autoClearSearchValue,
        searchValue: props.searchValue,
        onSearch: props.onSearch,
      })),
    );

    const mergedAutoClearSearchValue = computed(
      () => searchConfig.value.autoClearSearchValue !== false,
    );
    const mergedShowCheckedStrategy = computed(
      () => props.showCheckedStrategy ?? cascaderDefaults.showCheckedStrategy,
    );

    const [internalSearchValue, setSearchValue] = useMergedState('', {
      value: computed(() => searchConfig.value.searchValue) as any,
    });
    const mergedSearchValue = computed(() => internalSearchValue.value || '');

    const onInternalSearch: BaseSelectProps['onSearch'] = (
      searchText,
      info,
    ) => {
      setSearchValue(searchText);
      if (info.source !== 'blur') {
        searchConfig.value.onSearch?.(searchText);
      }
    };

    const mergedPopupPrefixCls = computed(
      () =>
        props.popupPrefixCls || props.prefixCls || cascaderDefaults.prefixCls!,
    );

    const searchOptions = useSearchOptions(
      mergedSearchValue,
      mergedOptions,
      mergedFieldNames,
      mergedPopupPrefixCls,
      searchConfig,
      computed(() => !!props.changeOnSelect || multiple.value),
    );

    // =========================== Values ===========================
    const getMissingValues = useMissingValues(mergedOptions, mergedFieldNames);

    // Fill `rawValues` with checked conduction values
    const valuesInfo = useValues(
      multiple,
      rawValues,
      getPathKeyEntities,
      getValueByKeyPath,
      getMissingValues,
    );

    const checkedValues = computed(() => valuesInfo.value[0]);
    const halfCheckedValues = computed(() => valuesInfo.value[1]);
    const missingCheckedValues = computed(() => valuesInfo.value[2]);

    const deDuplicatedValues = computed(() => {
      const checkedKeys = toPathKeys(checkedValues.value);
      const deduplicateKeys = formatStrategyValues(
        checkedKeys,
        getPathKeyEntities,
        mergedShowCheckedStrategy.value,
      );

      return [
        ...missingCheckedValues.value,
        ...getValueByKeyPath(deduplicateKeys),
      ];
    });

    const displayValues = useDisplayValues(
      deDuplicatedValues,
      mergedOptions,
      mergedFieldNames,
      multiple,
      computed(() => props.displayRender),
    );

    // =========================== Change ===========================
    const triggerChange = useEvent((nextValues: InternalValueType) => {
      setRawValues(nextValues);

      // Save perf if no need trigger event
      if (props.onChange) {
        const nextRawValues = toRawValues(nextValues);

        const valueOptions = nextRawValues.map((valueCells) =>
          toPathOptions(
            valueCells,
            mergedOptions.value,
            mergedFieldNames.value,
          ).map((valueOpt) => valueOpt.option),
        );

        const triggerValues = multiple.value ? nextRawValues : nextRawValues[0];
        const triggerOptions = multiple.value ? valueOptions : valueOptions[0];

        props.onChange(triggerValues as any, triggerOptions as any);
      }
    });

    // =========================== Select ===========================
    const handleSelection = useSelect(
      multiple,
      triggerChange,
      checkedValues,
      halfCheckedValues,
      missingCheckedValues,
      getPathKeyEntities,
      getValueByKeyPath,
      mergedShowCheckedStrategy,
    );

    const onInternalSelect = useEvent((valuePath: SingleValueType) => {
      if (!multiple.value || mergedAutoClearSearchValue.value) {
        setSearchValue('');
      }

      handleSelection(valuePath);
    });

    // Display Value change logic
    const onDisplayValuesChange: BaseSelectProps['onDisplayValuesChange'] = (
      _,
      info,
    ) => {
      if (info.type === 'clear') {
        triggerChange([]);
        return;
      }

      // Cascader do not support `add` type. Only support `remove`
      const { valueCells } = info.values[0] as DisplayValueType & {
        valueCells: SingleValueType;
      };
      onInternalSelect(valueCells);
    };

    const onInternalPopupVisibleChange = (nextVisible: boolean) => {
      props.onPopupVisibleChange?.(nextVisible);
    };

    // ========================== Context ===========================
    const cascaderContext = computed(() => ({
      classNames: props.classNames,
      styles: props.styles,
      options: mergedOptions.value,
      fieldNames: mergedFieldNames.value,
      values: checkedValues.value,
      halfValues: halfCheckedValues.value,
      changeOnSelect: props.changeOnSelect,
      onSelect: onInternalSelect,
      checkable: props.checkable,
      searchOptions: searchOptions.value,
      popupPrefixCls: props.popupPrefixCls,
      loadData: props.loadData,
      expandTrigger: props.expandTrigger,
      expandIcon:
        props.expandIcon === undefined
          ? cascaderDefaults.expandIcon
          : props.expandIcon,
      loadingIcon: props.loadingIcon,
      popupMenuColumnStyle: props.popupMenuColumnStyle,
      optionRender: props.optionRender,
    }));

    useCascaderProvider(cascaderContext);

    // ==============================================================\
    // ==                          Render                          ==\
    // ==============================================================\
    const emptyOptions = computed(() => {
      const currentOptions = mergedSearchValue.value
        ? searchOptions.value
        : mergedOptions.value;
      return currentOptions.length === 0;
    });

    const popupStyle = computed<CSSProperties>(() =>
      (mergedSearchValue.value && searchConfig.value.matchInputWidth) ||
      emptyOptions.value
        ? {}
        : {
            minWidth: 'auto',
          },
    );

    return () => {
      const restProps = omit(props, omitKeyList as any);
      const rawInputElement = slots.default
        ? () => slots.default?.()[0]
        : undefined;

      return (
        <BaseSelect
          {...attrs}
          {...restProps}
          autoClearSearchValue={mergedAutoClearSearchValue.value}
          builtinPlacements={props.builtinPlacements}
          classNames={props.classNames}
          // Value
          displayValues={displayValues.value}
          emptyOptions={emptyOptions.value}
          // Children
          getRawInputElement={rawInputElement}
          id={mergedId}
          mode={multiple.value ? 'multiple' : undefined}
          onDisplayValuesChange={onDisplayValuesChange}
          onPopupVisibleChange={onInternalPopupVisibleChange}
          onSearch={onInternalSearch}
          // Open
          open={props.open}
          // Options
          OptionList={OptionList}
          placement={props.placement}
          popupClassName={props.popupClassName}
          popupMatchSelectWidth={
            props.popupMatchSelectWidth ??
            cascaderDefaults.popupMatchSelectWidth
          }
          popupStyle={{
            ...popupStyle.value,
            ...props.popupStyle,
          }}
          prefixCls={(props.prefixCls ?? cascaderDefaults.prefixCls) as string}
          // MISC
          ref={(el: any) => {
            baseSelectRef.value = el;
          }}
          // Search
          searchValue={mergedSearchValue.value}
          showSearch={mergedShowSearch.value}
          styles={props.styles}
        />
      );
    };
  },
);

export default Cascader;
