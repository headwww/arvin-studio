import type { CSSProperties, VNode } from 'vue';

import type {
  BaseSelectPropsWithoutPrivate,
  BaseSelectRef,
  BaseSelectSemanticName,
} from '../select';
import type { ExpandAction, IconType } from '../tree';
import type { Key, VueNode } from '../util';
import type {
  DataNode,
  DefaultValueType,
  FieldNames,
  LabeledValueType,
  SafeKey,
  SelectSource,
  SimpleModeConfig,
} from './interface';
import type { CheckedStrategy } from './utils/strategyUtil';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { omit } from '@arvin-studio/kit';

import { BaseSelect } from '../select';
import { conductCheck } from '../tree';
import { filterEmpty } from '../util';
import useId from '../util/hooks/useId';
import useMergedState from '../util/hooks/useMergedState';
import useCache from './hooks/useCache';
import useCheckedKeys from './hooks/useCheckedKeys';
import useDataEntities from './hooks/useDataEntities';
import useFilterTreeData from './hooks/useFilterTreeData';
import useRefFunc from './hooks/useRefFunc';
import useSearchConfig from './hooks/useSearchConfig';
import useTreeData from './hooks/useTreeData';
import { useLegacyProvider } from './LegacyContext';
import OptionList from './OptionList';
import { useTreeSelectProvider } from './TreeSelectContext';
import {
  convertChildrenToData,
  fillAdditionalInfo,
  fillLegacyProps,
} from './utils/legacyUtil';
import {
  formatStrategyValues,
  SHOW_ALL,
  SHOW_CHILD,
} from './utils/strategyUtil';
import { fillFieldNames, isNil, toArray } from './utils/valueUtil';

export type SemanticName = BaseSelectSemanticName;
export type PopupSemantic = 'item' | 'itemTitle';

export interface SearchConfig {
  autoClearSearchValue?: boolean;
  filterTreeNode?:
    | ((inputValue: string, treeNode: DataNode) => boolean)
    | boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  treeNodeFilterProp?: string;
}

export interface TreeSelectProps<
  ValueType = any,
  OptionType extends DataNode = DataNode,
> extends Omit<
  BaseSelectPropsWithoutPrivate,
  'classNames' | 'mode' | 'showSearch' | 'styles'
> {
  /** @deprecated Use `showSearch.autoClearSearchValue` instead */
  autoClearSearchValue?: boolean;
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>;
  };
  defaultValue?: ValueType;
  // >>> Field Names
  fieldNames?: FieldNames;

  /** @deprecated Use `showSearch.filterTreeNode` instead */
  filterTreeNode?:
    | ((inputValue: string, treeNode: DataNode) => boolean)
    | boolean;
  id?: string;
  /** @deprecated Use `showSearch.searchValue` instead */
  inputValue?: string;

  labelInValue?: boolean;
  listHeight?: number;
  listItemHeight?: number;
  listItemScrollOffset?: number;
  loadData?: (dataNode: any) => Promise<unknown>;
  maxCount?: number;
  // >>> Mode
  multiple?: boolean;

  onChange?: (
    value: ValueType,
    labelList: null | VueNode[],
    extra: any,
  ) => void;
  onDeselect?: (value: ValueType, option: OptionType) => void;

  onPopupScroll?: (event: Event) => void;
  onPopupVisibleChange?: (open: boolean) => void;

  /** @deprecated Use `showSearch.onSearch` instead */
  onSearch?: (value: string) => void;

  // >>> Select
  onSelect?: (value: ValueType, option: OptionType) => void;
  onTreeExpand?: (expandedKeys: SafeKey[]) => void;
  onTreeLoad?: (loadedKeys: SafeKey[]) => void;
  popupMatchSelectWidth?: boolean | number;
  prefixCls?: string;

  /** @deprecated Use `showSearch.searchValue` instead */
  searchValue?: string;
  // >>> Selector
  showCheckedStrategy?: CheckedStrategy;
  // >>> Search
  showSearch?: boolean | SearchConfig;
  showTreeIcon?: boolean;
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>;
  };

  switcherIcon?: IconType;
  treeCheckable?: boolean | VueNode;
  treeCheckStrictly?: boolean;
  // >>> Data
  treeData?: OptionType[];
  treeDataSimpleMode?: boolean | SimpleModeConfig;

  // >>> Expanded
  treeDefaultExpandAll?: boolean;
  treeDefaultExpandedKeys?: SafeKey[];
  treeExpandAction?: ExpandAction;
  treeExpandedKeys?: SafeKey[];
  treeIcon?: IconType;
  // >>> Tree
  treeLine?: boolean;

  treeLoadedKeys?: SafeKey[];
  treeMotion?: any;
  /** @deprecated Use `showSearch.treeNodeFilterProp` instead */
  treeNodeFilterProp?: string;
  treeNodeLabelProp?: string;
  treeTitleRender?: (node: OptionType) => VueNode;

  // >>> Value
  value?: ValueType;
  // >>> Options
  virtual?: boolean;
}

function isRawValue(value: LabeledValueType | SafeKey): value is SafeKey {
  return !value || typeof value !== 'object';
}

const defaults = {
  prefixCls: 'vc-tree-select',
  listHeight: 200,
  listItemHeight: 20,
  listItemScrollOffset: 0,
  popupMatchSelectWidth: true,
} as any;

const omitKeyList: string[] = [
  'id',
  'prefixCls',

  // Value
  'value',
  'defaultValue',
  'onChange',

  // Search
  'showSearch',
  'searchValue',
  'inputValue',
  'onSearch',
  'autoClearSearchValue',
  'filterTreeNode',
  'treeNodeFilterProp',

  // Select
  'onSelect',
  'onDeselect',

  // Selector
  'showCheckedStrategy',
  'treeNodeLabelProp',

  // Field Names
  'fieldNames',

  // Mode
  'multiple',
  'treeCheckable',
  'treeCheckStrictly',
  'labelInValue',
  'maxCount',

  // Data
  'treeData',
  'treeDataSimpleMode',

  // Expanded
  'treeDefaultExpandAll',
  'treeExpandedKeys',
  'treeDefaultExpandedKeys',
  'onTreeExpand',
  'treeExpandAction',

  // Options
  'virtual',
  'listHeight',
  'listItemHeight',
  'listItemScrollOffset',
  'onPopupVisibleChange',
  'popupMatchSelectWidth',

  // Tree
  'treeTitleRender',
  'treeLine',
  'treeIcon',
  'showTreeIcon',
  'switcherIcon',
  'treeMotion',
  'treeLoadedKeys',
  'onTreeLoad',
  'loadData',
  'onPopupScroll',

  // Style
  'classNames',
  'styles',
];

const TreeSelect = defineComponent<TreeSelectProps>({
  name: 'TreeSelect',
  inheritAttrs: false,
  setup(props = defaults, { attrs, expose, slots }) {
    const baseSelectRef = shallowRef<BaseSelectRef | null>(null);

    expose({
      focus: () => baseSelectRef.value?.focus(),
      blur: () => baseSelectRef.value?.blur(),
      scrollTo: (arg: any) => baseSelectRef.value?.scrollTo?.(arg),
    });

    const mergedId = useId(props.id);

    const treeConduction = computed(
      () => !!props.treeCheckable && !props.treeCheckStrictly,
    );
    const mergedCheckable = computed(
      () => props.treeCheckable || props.treeCheckStrictly,
    );
    const mergedLabelInValue = computed(
      () => !!props.treeCheckStrictly || !!props.labelInValue,
    );
    const mergedMultiple = computed(
      () => !!mergedCheckable.value || !!props.multiple,
    );

    const searchProps = computed(() => ({
      searchValue: props.searchValue,
      inputValue: props.inputValue,
      onSearch: props.onSearch,
      autoClearSearchValue: props.autoClearSearchValue,
      filterTreeNode: props.filterTreeNode,
      treeNodeFilterProp: props.treeNodeFilterProp,
    }));

    const [mergedShowSearch, searchConfig] = useSearchConfig(
      computed(() => props.showSearch),
      searchProps,
    );

    const mergedTreeNodeFilterProp = computed(
      () => searchConfig.value.treeNodeFilterProp || 'value',
    );
    const mergedAutoClearSearchValue = computed(
      () => searchConfig.value.autoClearSearchValue !== false,
    );

    const internalValue = shallowRef(props?.value ?? props?.defaultValue);
    watch(
      () => props.value,
      () => {
        internalValue.value = props?.value;
      },
    );
    const setInternalValue = (val: any) => {
      internalValue.value = val;
    };
    const mergedShowCheckedStrategy = computed(() => {
      if (!props.treeCheckable) {
        return SHOW_ALL;
      }
      return props.showCheckedStrategy || SHOW_CHILD;
    });

    // ========================= FieldNames =========================
    const mergedFieldNames = computed(() => fillFieldNames(props.fieldNames));

    // =========================== Search ===========================
    const [internalSearchValue, setSearchValue] = useMergedState<string>(
      () => '',
      {
        value: computed(() => searchConfig.value.searchValue) as any,
      },
    );

    const mergedSearchValue = computed(() => internalSearchValue.value || '');

    const onInternalSearch = (searchText: string) => {
      setSearchValue(searchText);
      searchConfig.value.onSearch?.(searchText);
    };

    // ============================ Data ============================
    const slotTreeData = shallowRef<DataNode[]>([]);
    const slotTreeDataSignature = shallowRef('');

    const mergedSourceTreeData = computed<DataNode[]>(() => {
      if (props.treeData !== undefined) {
        return props.treeData as any;
      }
      return slotTreeData.value;
    });

    const getTreeDataSignature = (data: DataNode[]) => {
      const dig = (list: DataNode[]): string => {
        return (list || [])
          .map((node) => {
            const key = String((node as any)?.key);
            const children = (node as any)?.children as DataNode[] | undefined;
            return `${key}{${children?.length ? dig(children) : ''}}`;
          })
          .join('|');
      };
      return dig(data);
    };

    const mergedTreeData = useTreeData(
      mergedSourceTreeData,
      computed(() => props.treeDataSimpleMode),
    );

    const { keyEntities, valueEntities } = useDataEntities(
      mergedTreeData,
      mergedFieldNames,
    );

    const splitRawValues = (newRawValues: SafeKey[]) => {
      const missingRawValues: SafeKey[] = [];
      const existRawValues: SafeKey[] = [];

      // Keep missing value in the cache
      newRawValues.forEach((val) => {
        if (valueEntities.value.has(val)) {
          existRawValues.push(val);
        } else {
          missingRawValues.push(val);
        }
      });

      return { missingRawValues, existRawValues };
    };

    const filteredTreeData = useFilterTreeData(
      mergedTreeData,
      mergedSearchValue,
      {
        fieldNames: mergedFieldNames as any,
        treeNodeFilterProp: mergedTreeNodeFilterProp,
        filterTreeNode: computed(() => searchConfig.value.filterTreeNode),
      },
    );

    // =========================== Label ============================
    const getLabel = (item: DataNode) => {
      if (!item) {
        return;
      }

      if (props.treeNodeLabelProp) {
        return (item as any)[props.treeNodeLabelProp];
      }

      const titleList = (mergedFieldNames.value as any)._title as string[];

      for (const element of titleList) {
        const title = (item as any)[element];
        if (title !== undefined) {
          return title;
        }
      }
    };

    // ========================= Wrap Value =========================
    const toLabeledValues = (draftValues: DefaultValueType) => {
      const values = toArray(draftValues as any);

      return values.map((val) => {
        if (isRawValue(val as any)) {
          return { value: val };
        }
        return val;
      });
    };

    const renderTreeTitleRender = (node: DataNode) => {
      let label: any;
      const labelInfo = props?.treeTitleRender?.(node as any);
      if (typeof labelInfo === 'string' || typeof labelInfo === 'number') {
        label = labelInfo;
      } else {
        const labelArr = filterEmpty(
          Array.isArray(labelInfo) ? labelInfo : [labelInfo],
        );
        if (labelArr.length > 0) {
          label = labelArr.length === 1 ? labelArr[0] : labelArr;
        }
      }
      return label;
    };

    const convert2LabelValues = (draftValues: DefaultValueType) => {
      const values = toLabeledValues(draftValues);

      return values.map((item: any) => {
        let { label: rawLabel } = item;
        const { value: rawValue, halfChecked: rawHalfChecked } = item;

        let rawDisabled: boolean | undefined;

        const entity = valueEntities.value.get(rawValue);

        // Fill missing label & status
        if (entity) {
          rawLabel = props.treeTitleRender
            ? renderTreeTitleRender(entity.node as any)
            : (rawLabel ?? getLabel(entity.node as any));
          rawDisabled = (entity.node as any).disabled;
        } else if (rawLabel === undefined) {
          // We try to find in current `labelInValue` value
          const labelInValueItem = toLabeledValues(internalValue.value).find(
            (labeledItem: any) => labeledItem.value === rawValue,
          );
          rawLabel = labelInValueItem?.label;
        }

        return {
          label: rawLabel,
          value: rawValue,
          halfChecked: rawHalfChecked,
          disabled: rawDisabled,
        };
      });
    };

    // =========================== Values ===========================
    const rawMixedLabeledValues = computed<LabeledValueType[]>(() =>
      toLabeledValues(
        internalValue.value === null ? ([] as any) : internalValue.value,
      ),
    );

    const rawLabeledValues = computed<LabeledValueType[]>(() =>
      rawMixedLabeledValues.value.filter((item: any) => !item.halfChecked),
    );

    const rawHalfLabeledValues = computed<LabeledValueType[]>(() =>
      rawMixedLabeledValues.value.filter((item: any) => !!item.halfChecked),
    );

    const rawValues = computed(() =>
      rawLabeledValues.value.map((item) => item.value),
    );

    const [rawCheckedValues, rawHalfCheckedValues] = useCheckedKeys(
      rawLabeledValues,
      rawHalfLabeledValues,
      treeConduction,
      keyEntities as any,
    );

    const displayValues = computed<LabeledValueType[]>(() => {
      const displayKeys = formatStrategyValues(
        rawCheckedValues.value as SafeKey[],
        mergedShowCheckedStrategy.value,
        keyEntities.value as any,
        mergedFieldNames.value as any,
      );

      const values = displayKeys.map(
        (key) =>
          (keyEntities.value as any)[String(key)]?.node?.[
            (mergedFieldNames.value as any).value
          ] ?? key,
      );

      const labeledValues = values.map((val) => {
        const targetItem = rawLabeledValues.value.find(
          (item) => item.value === val,
        );
        let label;
        label = props.labelInValue
          ? targetItem?.label
          : renderTreeTitleRender(targetItem as any);
        return {
          value: val,
          label,
        };
      });

      const rawDisplayValues = convert2LabelValues(labeledValues as any);
      const firstVal = rawDisplayValues[0] as any;

      if (
        !mergedMultiple.value &&
        firstVal &&
        isNil(firstVal.value) &&
        isNil(firstVal.label)
      ) {
        return [];
      }

      return rawDisplayValues.map((item: any) => ({
        ...item,
        label: item.label ?? item.value,
      }));
    });

    const [cachedDisplayValues] = useCache(displayValues);

    // ========================== MaxCount ==========================
    const mergedMaxCount = computed(() => {
      if (
        mergedMultiple.value &&
        (mergedShowCheckedStrategy.value === SHOW_CHILD ||
          props.treeCheckStrictly ||
          !props.treeCheckable)
      ) {
        return props.maxCount;
      }
      return null;
    });

    // =========================== Change ===========================
    const triggerChange = useRefFunc(
      (
        newRawValues: SafeKey[],
        extra: { selected?: boolean; triggerValue?: SafeKey },
        source: SelectSource,
      ) => {
        const formattedKeyList = formatStrategyValues(
          newRawValues,
          mergedShowCheckedStrategy.value,
          keyEntities.value as any,
          mergedFieldNames.value as any,
        );

        // Not allow pass with `maxCount`
        if (
          mergedMaxCount.value &&
          formattedKeyList.length > mergedMaxCount.value
        ) {
          return;
        }

        const labeledValues = convert2LabelValues(newRawValues as any);
        setInternalValue(labeledValues);

        // Clean up if needed
        if (mergedAutoClearSearchValue.value) {
          setSearchValue('');
        }

        if (props.onChange) {
          const eventValues: SafeKey[] = treeConduction.value
            ? formattedKeyList.map((key) => {
                const entity = valueEntities.value.get(key);
                return entity
                  ? (entity.node as any)[(mergedFieldNames.value as any).value]
                  : key;
              })
            : newRawValues;

          const { triggerValue, selected } = extra || {
            triggerValue: undefined,
            selected: undefined,
          };

          let returnRawValues: any[] = eventValues;

          // We need fill half check back
          if (props.treeCheckStrictly) {
            const halfValues = rawHalfLabeledValues.value.filter(
              (item) => !eventValues.includes(item.value as any),
            );
            returnRawValues = [...returnRawValues, ...halfValues];
          }

          const returnLabeledValues = convert2LabelValues(
            returnRawValues as any,
          );
          const additionalInfo: any = {
            preValue: rawLabeledValues.value,
            triggerValue,
          };

          const showPosition =
            props.treeCheckStrictly || (source === 'selection' && !selected)
              ? false
              : true;

          fillAdditionalInfo(
            additionalInfo,
            triggerValue as any,
            newRawValues,
            mergedTreeData.value,
            showPosition,
            mergedFieldNames.value as any,
          );

          if (mergedCheckable.value) {
            additionalInfo.checked = selected;
          } else {
            additionalInfo.selected = selected;
          }

          const returnValues = mergedLabelInValue.value
            ? returnLabeledValues
            : returnLabeledValues.map((item: any) => item.value);

          props.onChange(
            mergedMultiple.value ? returnValues : returnValues[0],
            mergedLabelInValue.value
              ? null
              : returnLabeledValues.map((item: any) => item.label),
            additionalInfo,
          );
        }
      },
    );

    // ========================== Options ===========================
    const onOptionSelect = (
      selectedKey: SafeKey,
      { selected, source }: { selected: boolean; source?: SelectSource },
    ) => {
      const entity = (keyEntities.value as any)[String(selectedKey)];
      const node = entity?.node;
      const selectedValue =
        node?.[(mergedFieldNames.value as any).value] ?? selectedKey;

      if (mergedMultiple.value) {
        let newRawValues = selected
          ? [...(rawValues.value as any), selectedValue]
          : (rawCheckedValues.value as any).filter(
              (v: any) => v !== selectedValue,
            );

        // Add keys if tree conduction
        if (treeConduction.value) {
          const { missingRawValues, existRawValues } =
            splitRawValues(newRawValues);
          const keyList = existRawValues.map((val) => {
            const entity = valueEntities.value.get(val);
            return entity ? entity.key : val;
          });

          // Conduction by selected or not
          let checkedKeys: Key[];
          if (selected) {
            ({ checkedKeys } = conductCheck(
              keyList,
              true,
              keyEntities.value as any,
            ));
          } else {
            ({ checkedKeys } = conductCheck(
              keyList,
              {
                checked: false,
                halfCheckedKeys: rawHalfCheckedValues.value as any,
              },
              keyEntities.value as any,
            ));
          }

          newRawValues = [
            ...missingRawValues,
            ...checkedKeys.map(
              (key) =>
                (keyEntities.value as any)[String(key)].node[
                  (mergedFieldNames.value as any).value
                ],
            ),
          ];
        }

        triggerChange(
          newRawValues,
          { selected, triggerValue: selectedValue },
          source || 'option',
        );
      } else {
        triggerChange(
          [selectedValue],
          { selected: true, triggerValue: selectedValue },
          'option',
        );
      }

      // Trigger select event
      if (selected || !mergedMultiple.value) {
        props.onSelect?.(selectedValue as any, fillLegacyProps(node));
      } else {
        props.onDeselect?.(selectedValue as any, fillLegacyProps(node));
      }
    };

    // ========================== Dropdown ==========================
    const onInternalPopupVisibleChange = (open: boolean) => {
      props.onPopupVisibleChange?.(open);
    };

    // ====================== Display Change ========================
    const onDisplayValuesChange = useRefFunc((newValues: any[], info: any) => {
      const newRawValues = newValues.map((item) => item.value);

      if (info.type === 'clear') {
        triggerChange(newRawValues, {}, 'selection');
        return;
      }

      // TreeSelect only have multiple mode which means display change only has remove
      if (info.values.length > 0) {
        onOptionSelect(info.values[0].value, {
          selected: false,
          source: 'selection',
        });
      }
    });

    // ========================== Context ===========================
    const treeSelectContext = computed(() => {
      return {
        virtual: props.virtual,
        popupMatchSelectWidth:
          props.popupMatchSelectWidth ?? defaults.popupMatchSelectWidth,
        listHeight: props.listHeight ?? defaults.listHeight,
        listItemHeight: props.listItemHeight ?? defaults.listItemHeight,
        listItemScrollOffset:
          props.listItemScrollOffset ?? defaults.listItemScrollOffset,
        treeData: filteredTreeData.value,
        fieldNames: mergedFieldNames.value as any,
        onSelect: onOptionSelect,
        treeExpandAction: props.treeExpandAction,
        treeTitleRender: props.treeTitleRender,
        onPopupScroll: props.onPopupScroll,
        leftMaxCount:
          props.maxCount === undefined
            ? null
            : props.maxCount - cachedDisplayValues.value.length,
        leafCountOnly:
          mergedShowCheckedStrategy.value === SHOW_CHILD &&
          !props.treeCheckStrictly &&
          !!props.treeCheckable,
        valueEntities: valueEntities.value as any,
        classNames: props.classNames,
        styles: props.styles,
      };
    });

    useTreeSelectProvider(treeSelectContext as any);

    const legacyContext = computed(() => ({
      checkable: mergedCheckable.value,
      loadData: props.loadData,
      treeLoadedKeys: props.treeLoadedKeys,
      onTreeLoad: props.onTreeLoad,
      checkedKeys: rawCheckedValues.value as any,
      halfCheckedKeys: rawHalfCheckedValues.value as any,
      treeDefaultExpandAll: props.treeDefaultExpandAll,
      treeExpandedKeys: props.treeExpandedKeys as any,
      treeDefaultExpandedKeys: props.treeDefaultExpandedKeys || [],
      onTreeExpand: props.onTreeExpand,
      treeIcon: props.treeIcon,
      treeMotion: props.treeMotion,
      showTreeIcon: props.showTreeIcon,
      switcherIcon: props.switcherIcon,
      treeLine: props.treeLine,
      treeNodeFilterProp: mergedTreeNodeFilterProp.value,
      keyEntities: keyEntities.value as any,
    }));

    useLegacyProvider(legacyContext as any);

    return () => {
      // Update slot tree data in render context
      if (props.treeData === undefined) {
        const children = (slots.default?.() ?? []) as VNode[];
        const parsed = convertChildrenToData(children);
        const signature = getTreeDataSignature(parsed);
        if (signature !== slotTreeDataSignature.value) {
          slotTreeDataSignature.value = signature;
          slotTreeData.value = parsed;
        }
      }

      const restAttrs = { ...attrs };
      const restProps = omit(props, omitKeyList as any);
      return (
        <BaseSelect
          {...restAttrs}
          {...restProps}
          // >>> Search
          autoClearSearchValue={mergedAutoClearSearchValue.value}
          // >>> Style
          classNames={props.classNames as any}
          // >>> Display Value
          displayValues={cachedDisplayValues.value as any}
          emptyOptions={mergedTreeData.value.length === 0}
          // >>> MISC
          id={mergedId}
          mode={mergedMultiple.value ? 'multiple' : undefined}
          onDisplayValuesChange={onDisplayValuesChange as any}
          onPopupVisibleChange={onInternalPopupVisibleChange}
          onSearch={(v: string) => {
            onInternalSearch(v);
          }}
          // >>> Options
          OptionList={OptionList}
          popupMatchSelectWidth={
            props.popupMatchSelectWidth ?? defaults.popupMatchSelectWidth
          }
          prefixCls={props.prefixCls || defaults.prefixCls}
          ref={(el: any) => {
            baseSelectRef.value = el;
          }}
          searchValue={mergedSearchValue.value}
          showSearch={mergedShowSearch.value}
          styles={props.styles as any}
        />
      );
    };
  },
});

export default TreeSelect;
