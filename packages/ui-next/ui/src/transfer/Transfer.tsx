import type { SlotsType } from 'vue';

import type {
  TransferClassNamesType,
  TransferDirection,
  TransferEmits,
  TransferKey,
  TransferProps,
  TransferSlots,
  TransferStylesType,
} from './interface';

import { computed, defineComponent } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useMultipleSelect,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { groupDisabledKeysMap, groupKeysMap } from '../_util/transKeys';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import { DefaultRenderEmpty } from '../config-provider/default-render-empty';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useFormItemInputContext } from '../form/context';
import defaultLocale from '../locale/en_US';
import useLocale from '../locale/useLocale';
import Actions from './Actions';
import useData from './hooks/useData';
import useSelection from './hooks/useSelection';
import Section from './Section';
import useStyle from './style';

const defaults = {
  dataSource: [],
  targetKeys: [],
  selectedKeys: undefined,
  selectAllLabels: [],
  showSearch: false,
  showSelectAll: true,
  oneWay: false,
} as any;

export interface InternalTransferProps<RecordType = any> /* @vue-ignore */
  extends TransferEmitsProps, TransferProps<RecordType> {}

export interface TransferEmitsProps {
  onChange?: TransferEmits['change'];
  onScroll?: TransferEmits['scroll'];
  onSearch?: TransferEmits['search'];
  onSelectChange?: TransferEmits['selectChange'];
  'onUpdate:selectedKeys'?: TransferEmits['update:selectedKeys'];
  'onUpdate:targetKeys'?: TransferEmits['update:targetKeys'];
}

const Transfer = defineComponent<
  InternalTransferProps,
  TransferEmits,
  string,
  SlotsType<TransferSlots>
>(
  (props = defaults, { slots, attrs, emit }) => {
    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      selectionsIcon: contextSelectionsIcon,
      renderEmpty,
    } = useComponentBaseConfig('transfer', props, ['selectionsIcon']);

    const { disabled, classes, styles, rootClass } = toPropsRefs(
      props,
      'disabled',
      'classes',
      'styles',
      'rootClass',
    );

    const contextDisabled = useDisabledContext();
    const mergedDisabled = computed(
      () => disabled.value ?? contextDisabled.value,
    );

    const mergedProps = computed(
      () =>
        ({
          ...props,
          disabled: mergedDisabled.value,
        }) as TransferProps,
    );

    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const normalizeNodes = (nodes: any) =>
      filterEmpty(Array.isArray(nodes) ? nodes : [nodes]);
    const getSlotNodes = (slot?: () => any) => {
      if (!slot) {
        return undefined;
      }
      const items = normalizeNodes(slot());
      return items.length > 0 ? items : undefined;
    };

    const mergedActions = computed(() => {
      const slotActions = getSlotNodes(slots.actions);
      if (slotActions?.length) {
        return slotActions;
      }
      return normalizeNodes(props.actions ?? props.operations ?? []);
    });

    const dataSource = computed(() => props.dataSource || []);
    const targetKeys = computed(() => props.targetKeys || []);

    const [mergedDataSource, leftDataSource, rightDataSource] = useData(
      dataSource,
      computed(() => props.rowKey),
      targetKeys,
    );

    const [
      sourceSelectedKeys,
      targetSelectedKeys,
      setSourceSelectedKeys,
      setTargetSelectedKeys,
    ] = useSelection(
      leftDataSource,
      rightDataSource,
      computed(() => props.selectedKeys),
    );

    const [leftMultipleSelect, updateLeftPrevSelectedIndex] = useMultipleSelect(
      (item: any) => item.key,
    );
    const [rightMultipleSelect, updateRightPrevSelectedIndex] =
      useMultipleSelect((item: any) => item.key);

    const setStateKeys = (
      directionValue: TransferDirection,
      keys: ((prevKeys: TransferKey[]) => TransferKey[]) | TransferKey[],
    ) => {
      if (directionValue === 'left') {
        const nextKeys =
          typeof keys === 'function'
            ? keys(sourceSelectedKeys.value || [])
            : keys;
        setSourceSelectedKeys(nextKeys);
        return nextKeys;
      }
      const nextKeys =
        typeof keys === 'function'
          ? keys(targetSelectedKeys.value || [])
          : keys;
      setTargetSelectedKeys(nextKeys);
      return nextKeys;
    };

    const setPrevSelectedIndex = (
      directionValue: TransferDirection,
      value: null | number,
    ) => {
      const updatePrevSelectedIndex =
        directionValue === 'left'
          ? updateLeftPrevSelectedIndex
          : updateRightPrevSelectedIndex;
      updatePrevSelectedIndex(value);
    };

    const handleSelectChange = (
      directionValue: TransferDirection,
      holder: TransferKey[],
    ) => {
      if (directionValue === 'left') {
        emit('selectChange', holder, targetSelectedKeys.value);
      } else {
        emit('selectChange', sourceSelectedKeys.value, holder);
      }
    };

    const emitSelectedKeysUpdate = (
      sourceKeys: TransferKey[],
      targetKeysValue: TransferKey[],
    ) => {
      emit('update:selectedKeys', [...sourceKeys, ...targetKeysValue]);
    };

    const getTitles = (transferLocale: any) =>
      props.titles ?? transferLocale.titles ?? [];

    const handleLeftScroll = (e: Event) => {
      emit('scroll', 'left', e);
    };

    const handleRightScroll = (e: Event) => {
      emit('scroll', 'right', e);
    };

    const moveTo = (directionValue: TransferDirection) => {
      const moveKeys =
        directionValue === 'right'
          ? sourceSelectedKeys.value
          : targetSelectedKeys.value;
      const dataSourceDisabledKeysMap = groupDisabledKeysMap(
        mergedDataSource.value,
      );
      const newMoveKeys = moveKeys.filter(
        (key) => !dataSourceDisabledKeysMap.has(key),
      );
      const newMoveKeysMap = groupKeysMap(newMoveKeys);

      const newTargetKeys =
        directionValue === 'right'
          ? newMoveKeys.concat(targetKeys.value)
          : targetKeys.value.filter(
              (targetKey) => !newMoveKeysMap.has(targetKey),
            );

      const oppositeDirection = directionValue === 'right' ? 'left' : 'right';
      const nextOppositeKeys = setStateKeys(oppositeDirection, []);
      handleSelectChange(oppositeDirection, nextOppositeKeys);
      if (directionValue === 'right') {
        emitSelectedKeysUpdate([], targetSelectedKeys.value);
      } else {
        emitSelectedKeysUpdate(sourceSelectedKeys.value, []);
      }

      emit('update:targetKeys', newTargetKeys);
      emit('change', newTargetKeys, directionValue, newMoveKeys);
    };

    const moveToLeft = () => {
      moveTo('left');
      setPrevSelectedIndex('left', null);
    };

    const moveToRight = () => {
      moveTo('right');
      setPrevSelectedIndex('right', null);
    };

    const onItemSelectAll = (
      directionValue: TransferDirection,
      keys: TransferKey[],
      checkAll: 'replace' | boolean,
    ) => {
      const prevKeys =
        directionValue === 'left'
          ? sourceSelectedKeys.value
          : targetSelectedKeys.value;
      // eslint-disable-next-line no-useless-assignment
      let mergedCheckedKeys: TransferKey[] = [];

      if (checkAll === 'replace') {
        mergedCheckedKeys = keys;
      } else if (checkAll) {
        mergedCheckedKeys = Array.from(
          new Set<TransferKey>([...prevKeys, ...keys]),
        );
      } else {
        const selectedKeysMap = groupKeysMap(keys);
        mergedCheckedKeys = prevKeys.filter((key) => !selectedKeysMap.has(key));
      }

      setStateKeys(directionValue, mergedCheckedKeys);
      handleSelectChange(directionValue, mergedCheckedKeys);

      const nextSourceKeys =
        directionValue === 'left'
          ? mergedCheckedKeys
          : sourceSelectedKeys.value;
      const nextTargetKeys =
        directionValue === 'left'
          ? targetSelectedKeys.value
          : mergedCheckedKeys;
      emitSelectedKeysUpdate(nextSourceKeys, nextTargetKeys);
      setPrevSelectedIndex(directionValue, null);
    };

    const onLeftItemSelectAll = (keys: TransferKey[], checkAll: boolean) => {
      onItemSelectAll('left', keys, checkAll);
    };

    const onRightItemSelectAll = (keys: TransferKey[], checkAll: boolean) => {
      onItemSelectAll('right', keys, checkAll);
    };

    const handleSingleSelect = (
      directionValue: TransferDirection,
      holder: Set<TransferKey>,
      selectedKey: TransferKey,
      checked: boolean,
      currentSelectedIndex: number,
    ) => {
      const isSelected = holder.has(selectedKey);
      if (isSelected) {
        holder.delete(selectedKey);
        setPrevSelectedIndex(directionValue, null);
      }
      if (checked) {
        holder.add(selectedKey);
        setPrevSelectedIndex(directionValue, currentSelectedIndex);
      }
    };

    const handleMultipleSelect = (
      directionValue: TransferDirection,
      data: any[],
      holder: Set<TransferKey>,
      currentSelectedIndex: number,
    ) => {
      const isLeftDirection = directionValue === 'left';
      const multipleSelect = isLeftDirection
        ? leftMultipleSelect
        : rightMultipleSelect;
      multipleSelect(currentSelectedIndex, data, holder);
    };

    const onItemSelect = (
      directionValue: TransferDirection,
      selectedKey: TransferKey,
      checked: boolean,
      multiple?: boolean,
    ) => {
      const isLeftDirection = directionValue === 'left';
      const holder = [
        ...(isLeftDirection
          ? sourceSelectedKeys.value
          : targetSelectedKeys.value),
      ];
      const holderSet = new Set(holder);
      const data = [
        ...(isLeftDirection ? leftDataSource.value : rightDataSource.value),
      ].filter((item) => !item?.disabled);
      const currentSelectedIndex = data.findIndex(
        (item) => item.key === selectedKey,
      );
      if (multiple && holder.length > 0) {
        handleMultipleSelect(
          directionValue,
          data as any,
          holderSet,
          currentSelectedIndex,
        );
      } else {
        handleSingleSelect(
          directionValue,
          holderSet,
          selectedKey,
          checked,
          currentSelectedIndex,
        );
      }
      const holderArr = Array.from(holderSet);
      handleSelectChange(directionValue, holderArr);
      setStateKeys(directionValue, holderArr);

      const nextSourceKeys =
        directionValue === 'left' ? holderArr : sourceSelectedKeys.value;
      const nextTargetKeys =
        directionValue === 'left' ? targetSelectedKeys.value : holderArr;
      emitSelectedKeysUpdate(nextSourceKeys, nextTargetKeys);
    };

    const onLeftItemSelect = (
      selectedKey: TransferKey,
      checked: boolean,
      e?: MouseEvent,
    ) => {
      onItemSelect('left', selectedKey, checked, e?.shiftKey);
    };

    const onRightItemSelect = (
      selectedKey: TransferKey,
      checked: boolean,
      e?: MouseEvent,
    ) => {
      onItemSelect('right', selectedKey, checked, e?.shiftKey);
    };

    const onRightItemRemove = (keys: TransferKey[]) => {
      setStateKeys('right', []);
      emitSelectedKeysUpdate(sourceSelectedKeys.value, []);
      const nextTargetKeys = targetKeys.value.filter(
        (key) => !keys.includes(key),
      );
      emit('update:targetKeys', nextTargetKeys);
      emit('change', nextTargetKeys, 'left', [...keys]);
    };

    const handleListStyle = (directionValue: TransferDirection) => {
      if (typeof props.listStyle === 'function') {
        return props.listStyle({ direction: directionValue });
      }
      return props.listStyle || {};
    };

    const formItemInputContext = useFormItemInputContext();
    const hasFeedback = computed(() => formItemInputContext.value.hasFeedback);
    const mergedStatus = computed(() =>
      getMergedStatus(formItemInputContext.value.status, props.status),
    );

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TransferClassNamesType,
      TransferStylesType,
      TransferProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    // ant-design 6.4 #57101: merge per-side (source/target) overrides on top
    // of the shared classes/styles. The merged result is what gets handed to
    // each <Section>, so callers can override either both sides at once via
    // top-level `section`/`header`/… or per side via `source`/`target`.
    const SECTION_SEMANTIC_KEYS = [
      'section',
      'header',
      'title',
      'body',
      'list',
      'item',
      'itemIcon',
      'itemContent',
      'footer',
    ] as const;
    function mergeSideClasses(side: 'source' | 'target') {
      const sideOverrides = (mergedClassNames.value as any)[side] ?? {};
      const next: Record<string, any> = { ...mergedClassNames.value };
      SECTION_SEMANTIC_KEYS.forEach((key) => {
        if (sideOverrides[key]) {
          next[key] = clsx(mergedClassNames.value[key], sideOverrides[key]);
        }
      });
      return next;
    }
    function mergeSideStyles(side: 'source' | 'target') {
      const sideOverrides = (mergedStyles.value as any)[side] ?? {};
      const next: Record<string, any> = { ...mergedStyles.value };
      SECTION_SEMANTIC_KEYS.forEach((key) => {
        if (sideOverrides[key]) {
          next[key] = {
            ...(mergedStyles.value as any)[key],
            ...sideOverrides[key],
          };
        }
      });
      return next;
    }

    const [contextLocale] = useLocale('Transfer', defaultLocale.Transfer);

    const listLocale = computed(() => ({
      ...contextLocale?.value,
      notFoundContent: renderEmpty?.value?.('Transfer') || (
        <DefaultRenderEmpty componentName="Transfer" />
      ),
      ...props.locale,
    }));

    const titles = computed(
      () => getSlotNodes(slots.titles) ?? getTitles(listLocale.value),
    );
    const mergedLabelRender = computed(() => {
      if (!slots.labelRender && !props.labelRender) {
        return undefined;
      }
      return (item: any) =>
        getSlotPropsFnRun(slots, props, 'labelRender', true, item);
    });
    const mergedSelectionsIcon = computed(
      () =>
        getSlotPropsFnRun(slots, props, 'selectionsIcon', false) ??
        contextSelectionsIcon.value,
    );

    const mergedPagination = computed(() =>
      slots.default ? false : props.pagination,
    );
    const mergedShowSelectAll = computed(() => props.showSelectAll ?? true);
    const mergedSelectAllLabels = computed(() => props.selectAllLabels ?? []);

    const leftActive = computed(() =>
      rightDataSource.value.some(
        (d) => targetSelectedKeys.value.includes(d.key) && !d.disabled,
      ),
    );

    const rightActive = computed(() =>
      leftDataSource.value.some(
        (d) => sourceSelectedKeys.value.includes(d.key) && !d.disabled,
      ),
    );

    const renderList = computed(() => {
      if (!slots.default) {
        return undefined;
      }
      return (listProps: any) => slots.default?.(listProps);
    });

    const mergedRender = computed(() => {
      return (item: any) =>
        getSlotPropsFnRun(slots, props, 'render', true, item);
    });

    const mergedFooter = computed(() => {
      if (!slots.footer && !props.footer) {
        return undefined;
      }
      return (listProps: any, info?: { direction: TransferDirection }) => {
        if (slots.footer) {
          return slots.footer({ props: listProps, info });
        }
        return props.footer?.(listProps, info);
      };
    });

    if (isDev) {
      const warning = devUseWarning('Transfer');
      warning(
        !props.pagination || !slots.default,
        'usage',
        '`pagination` not support customize render list.',
      );
      [
        ['listStyle', 'styles.section'],
        ['operationStyle', 'styles.actions'],
        ['operations', 'actions'],
      ].forEach(([deprecatedName, newName]) => {
        warning.deprecated(
          (props as any)[deprecatedName!] === undefined,
          deprecatedName!,
          newName!,
        );
      });
    }

    return () => {
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const mergedClassName = clsx(
        prefixCls.value,
        {
          [`${prefixCls.value}-disabled`]: mergedDisabled.value,
          [`${prefixCls.value}-customize-list`]: !!slots.default,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        getStatusClassNames(
          prefixCls.value,
          mergedStatus.value,
          hasFeedback.value,
        ),
        contextClassName.value,
        rootClass.value,
        cssVarCls.value,
        rootCls.value,
        hashId.value,
        mergedClassNames.value.root,
        className,
      );

      const rootStyle = {
        ...mergedStyles.value.root,
        ...style,
      };

      const leftTitle = titles.value[0];
      const rightTitle = titles.value[1];

      return (
        <div class={mergedClassName} style={rootStyle} {...restAttrs}>
          <Section
            checkedKeys={sourceSelectedKeys.value}
            classes={mergeSideClasses('source')}
            dataSource={leftDataSource.value as any}
            direction={direction.value === 'rtl' ? 'right' : 'left'}
            disabled={mergedDisabled.value}
            filterOption={props.filterOption}
            footer={mergedFooter.value as any}
            handleClear={() => emit('search', 'left', '')}
            handleFilter={(e: Event) =>
              emit(
                'search',
                'left',
                (e.target as HTMLInputElement)?.value || '',
              )
            }
            labelRender={mergedLabelRender.value}
            onItemSelect={onLeftItemSelect}
            onItemSelectAll={onLeftItemSelectAll as any}
            onScroll={handleLeftScroll}
            pagination={mergedPagination.value as any}
            prefixCls={prefixCls.value}
            render={mergedRender.value}
            renderList={renderList.value}
            selectAllLabel={mergedSelectAllLabels.value[0]}
            selectionsIcon={mergedSelectionsIcon.value}
            showSearch={props.showSearch}
            showSelectAll={mergedShowSelectAll.value}
            style={handleListStyle('left')}
            styles={mergeSideStyles('source')}
            titleText={leftTitle}
            {...listLocale.value}
          />
          <Actions
            actions={mergedActions.value}
            class={clsx(
              `${prefixCls.value}-actions`,
              mergedClassNames.value.actions,
            )}
            direction={direction.value}
            disabled={mergedDisabled.value}
            leftActive={leftActive.value}
            moveToLeft={moveToLeft}
            moveToRight={moveToRight}
            oneWay={props.oneWay}
            rightActive={rightActive.value}
            style={{
              ...props.operationStyle,
              ...mergedStyles.value.actions,
            }}
          />
          <Section
            checkedKeys={targetSelectedKeys.value}
            classes={mergeSideClasses('target')}
            dataSource={rightDataSource.value as any}
            direction={direction.value === 'rtl' ? 'left' : 'right'}
            disabled={mergedDisabled.value}
            filterOption={props.filterOption}
            footer={mergedFooter.value as any}
            handleClear={() => emit('search', 'right', '')}
            handleFilter={(e: Event) =>
              emit(
                'search',
                'right',
                (e.target as HTMLInputElement)?.value || '',
              )
            }
            labelRender={mergedLabelRender.value}
            onItemRemove={onRightItemRemove}
            onItemSelect={onRightItemSelect}
            onItemSelectAll={onRightItemSelectAll as any}
            onScroll={handleRightScroll}
            pagination={mergedPagination.value as any}
            prefixCls={prefixCls.value}
            render={mergedRender.value}
            renderList={renderList.value}
            selectAllLabel={mergedSelectAllLabels.value[1]}
            selectionsIcon={mergedSelectionsIcon.value}
            showRemove={props.oneWay}
            showSearch={props.showSearch}
            showSelectAll={mergedShowSelectAll.value}
            style={handleListStyle('right')}
            styles={mergeSideStyles('target')}
            titleText={rightTitle}
            {...listLocale.value}
          />
        </div>
      );
    };
  },
  {
    name: 'ATransfer',
    inheritAttrs: false,
  },
);

export default Transfer;
