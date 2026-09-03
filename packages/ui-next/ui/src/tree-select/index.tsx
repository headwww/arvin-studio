import type { App, CSSProperties, PublicProps, SlotsType } from 'vue';

import type {
  DataNode,
  TreeSelectProps as VcTreeSelectProps,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { SelectCommonPlacement } from '../_util/motion';
import type { InputStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';
import type { AsTreeNodeProps, TreeProps } from '../tree';
import type { SwitcherIcon } from '../tree/Tree';

import { computed, defineComponent, shallowRef } from 'vue';

import {
  getAttrStyleAndClass,
  getTransitionName,
  SHOW_ALL,
  SHOW_CHILD,
  SHOW_PARENT,
  TreeSelectNode as TreeNode,
  ExportTreeSelect as VcTreeSelect,
} from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import {
  useMergeSemantic,
  useToArr,
  useToProps,
  useZIndex,
} from '../_util/hooks';
import genPurePanel from '../_util/PurePanel';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig, useConfig } from '../config-provider/context';
import { DefaultRenderEmpty } from '../config-provider/default-render-empty';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useSize } from '../config-provider/hooks/useSize';
import { useFormItemInputContext } from '../form/context';
import useVariant from '../form/hooks/useVariant';
import mergedBuiltinPlacements from '../select/mergedBuiltinPlacements';
import useSelectStyle from '../select/style';
import useIcons from '../select/useIcons';
import usePopupRender from '../select/usePopupRender';
import useShowArrow from '../select/useShowArrow';
import { useCompactItemContext } from '../space/Compact';
import { useToken } from '../theme/internal';
import SwitcherIconCom from '../tree/utils/iconUtil';
import useStyle from './style';

type RawValue = number | string;

export interface LabeledValue {
  key?: string;
  label: VueNode;
  value: RawValue;
}

export type SelectValue = LabeledValue | LabeledValue[] | RawValue | RawValue[];

export type TreeSelectSemanticName = keyof TreeSelectSemanticClassNames &
  keyof TreeSelectSemanticStyles;

export interface TreeSelectSemanticClassNames {
  content?: string;
  input?: string;
  item?: string;
  itemContent?: string;
  itemRemove?: string;
  placeholder?: string;
  prefix?: string;
  root?: string;
  suffix?: string;
}

export interface TreeSelectSemanticStyles {
  content?: CSSProperties;
  input?: CSSProperties;
  item?: CSSProperties;
  itemContent?: CSSProperties;
  itemRemove?: CSSProperties;
  placeholder?: CSSProperties;
  prefix?: CSSProperties;
  root?: CSSProperties;
  suffix?: CSSProperties;
}

export type TreeSelectPopupSemanticName =
  keyof TreeSelectPopupSemanticClassNames & keyof TreeSelectPopupSemanticStyles;

export interface TreeSelectPopupSemanticClassNames {
  item?: string;
  itemSwitcher?: string;
  itemTitle?: string;
  root?: string;
}

export interface TreeSelectPopupSemanticStyles {
  item?: CSSProperties;
  itemSwitcher?: CSSProperties;
  itemTitle?: CSSProperties;
  root?: CSSProperties;
}

export type TreeSelectClassNamesType = SemanticClassNamesType<
  TreeSelectProps,
  TreeSelectSemanticClassNames
> & {
  popup?: TreeSelectPopupSemanticClassNames;
};

export type TreeSelectStylesType = SemanticStylesType<
  TreeSelectProps,
  TreeSelectSemanticStyles
> & {
  popup?: TreeSelectPopupSemanticStyles;
};
interface BaseTreeSelectProps<
  ValueType = any,
  OptionType extends DataNode = DataNode,
> extends Omit<
  VcTreeSelectProps<ValueType, OptionType>,
  | 'backfill'
  | 'classNames'
  | 'getInputElement'
  | 'mode'
  | 'onChange'
  | 'onDeselect'
  | 'onPopupScroll'
  | 'onPopupVisibleChange'
  | 'onSearch'
  | 'onSelect'
  | 'onTreeExpand'
  | 'onTreeLoad'
  | 'showTreeIcon'
  | 'style'
  | 'styles'
  | 'switcherIcon'
  | 'treeLine'
  | 'treeMotion'
> {
  disabled?: boolean;
  size?: SizeType;
  status?: InputStatus;
  variant?: Variant;
}

export interface TreeSelectProps<
  ValueType = any,
  OptionType extends DataNode = DataNode,
>
  extends
    BaseTreeSelectProps<ValueType, OptionType>,
    /* @vue-ignore */
    TreeSelectEmitsProps<ValueType, OptionType> {
  /** @deprecated Use `variant` instead. */
  bordered?: boolean;
  classes?: TreeSelectClassNamesType;
  disabled?: boolean;
  /** @deprecated Please use `classNames.popup.root` instead */
  dropdownClassName?: string;
  /** @deprecated Please use `popupMatchSelectWidth` instead */
  dropdownMatchSelectWidth?: boolean | number;
  /** @deprecated Please use `popupRender` instead */
  dropdownRender?: (menu: any) => any;

  /** @deprecated Please use `styles.popup.root` instead */
  dropdownStyle?: CSSProperties;
  placement?: SelectCommonPlacement;
  /** @deprecated Please use `classNames.popup.root` instead */
  popupClassName?: string;
  popupMatchSelectWidth?: boolean | number;
  popupRender?: (menu: any) => any;
  // /** @deprecated Please use `onOpenChange` instead */
  // onDropdownVisibleChange?: (visible: boolean) => void;
  // onOpenChange?: (open: boolean) => void;

  rootClass?: string;
  /**
   * @deprecated `showArrow` is deprecated which will be removed in next major version. It will be a
   *   default behavior, you can hide it by setting `suffixIcon` to null.
   */
  showArrow?: boolean;
  size?: SizeType;
  status?: InputStatus;
  styles?: TreeSelectStylesType;
  suffixIcon?: VueNode;
  switcherIcon?:
    | SwitcherIcon
    | VcTreeSelectProps<ValueType, OptionType>['switcherIcon'];
  treeLine?: TreeProps['showLine'];
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
}

export interface TreeSelectEmits<
  ValueType = any,
  OptionType extends DataNode = DataNode,
> {
  blur: (e: FocusEvent) => void;
  change: NonNullable<VcTreeSelectProps<ValueType, OptionType>['onChange']>;
  deselect: NonNullable<VcTreeSelectProps<ValueType, OptionType>['onDeselect']>;
  dropdownVisibleChange: (open: boolean) => void;
  focus: (e: FocusEvent) => void;
  openChange: (open: boolean) => void;
  popupScroll: NonNullable<
    VcTreeSelectProps<ValueType, OptionType>['onPopupScroll']
  >;
  search: NonNullable<VcTreeSelectProps<ValueType, OptionType>['onSearch']>;
  select: NonNullable<VcTreeSelectProps<ValueType, OptionType>['onSelect']>;
  treeExpand: NonNullable<
    VcTreeSelectProps<ValueType, OptionType>['onTreeExpand']
  >;
  treeLoad: NonNullable<VcTreeSelectProps<ValueType, OptionType>['onTreeLoad']>;
  'update:value': (value: any) => void;
}
export interface TreeSelectEmitsProps<
  ValueType = any,
  OptionType extends DataNode = DataNode,
> {
  onBlur?: TreeSelectEmits['blur'];
  onChange?: TreeSelectEmits<ValueType, OptionType>['change'];
  onDeselect?: TreeSelectEmits<ValueType, OptionType>['deselect'];
  onDropdownVisibleChange?: TreeSelectEmits['dropdownVisibleChange'];
  onFocus?: TreeSelectEmits['focus'];
  onOpenChange?: TreeSelectEmits['openChange'];
  onPopupScroll?: TreeSelectEmits<ValueType, OptionType>['popupScroll'];
  onSearch?: TreeSelectEmits<ValueType, OptionType>['search'];
  onSelect?: TreeSelectEmits<ValueType, OptionType>['select'];
  onTreeExpand?: TreeSelectEmits<ValueType, OptionType>['treeExpand'];
  onTreeLoad?: TreeSelectEmits<ValueType, OptionType>['treeLoad'];
  'onUpdate:value'?: TreeSelectEmits['update:value'];
}

export interface TreeSelectSlots<OptionType extends DataNode = DataNode> {
  notFoundContent?: () => any;
  suffixIcon?: () => any;
  switcherIcon?: () => any;
  tagRender?: (props: any) => any;
  treeTitleRender?: (nodeData: OptionType) => any;
}
const defaults = {
  listHeight: 256,
  choiceTransitionName: '',
  treeIcon: false,
} as any;

const omitKeys = [
  'prefixCls',
  'size',
  'disabled',
  'bordered',
  'style',
  'className',
  'rootClassName',
  'treeCheckable',
  'multiple',
  'listHeight',
  'listItemHeight',
  'placement',
  'notFoundContent',
  'switcherIcon',
  'treeLine',
  'getPopupContainer',
  'popupClassName',
  'dropdownClassName',
  'treeIcon',
  'transitionName',
  'choiceTransitionName',
  'status',
  'treeExpandAction',
  'builtinPlacements',
  'dropdownMatchSelectWidth',
  'popupMatchSelectWidth',
  'allowClear',
  'variant',
  'dropdownStyle',
  'dropdownRender',
  'popupRender',
  // 'onDropdownVisibleChange',
  // 'onOpenChange',
  'tagRender',
  'maxCount',
  'showCheckedStrategy',
  'treeCheckStrictly',
  'styles',
  'classes',
];

const InternalTreeSelect = defineComponent<
  TreeSelectProps,
  TreeSelectEmits,
  string,
  SlotsType<TreeSelectSlots>
>(
  (props = defaults, { slots, expose, emit, attrs }) => {
    const {
      prefixCls: treeSelectPrefixCls,
      getPopupContainer: getContextPopupContainer,
      direction,
      styles: contextStyles,
      classes: contextClassNames,
      switcherIcon,
      virtual,
      getPrefixCls,
      rootPrefixCls,
    } = useComponentBaseConfig(
      'treeSelect',
      props,
      ['switcherIcon'],
      'tree-select',
    );
    const configCtx = useConfig();
    const {
      prefixCls: customizePrefixCls,
      variant: customVariant,
      size: customizeSize,
      disabled: customDisabled,
      status: customStatus,
      classes,
      styles,
    } = toPropsRefs(
      props,
      'prefixCls',
      'variant',
      'size',
      'disabled',
      'status',
      'classes',
      'styles',
    );
    const bordered = computed(() => props?.bordered ?? true);

    const [, token] = useToken();

    const listItemHeight = computed(
      () =>
        props?.listItemHeight ??
        token?.value?.controlHeightSM + token?.value?.paddingXXS,
    );

    if (isDev) {
      const { treeCheckable, multiple } = props;
      const warning = devUseWarning('TreeSelect');

      const deprecatedProps = {
        dropdownMatchSelectWidth: 'popupMatchSelectWidth',
        dropdownStyle: 'styles.popup.root',
        dropdownClassName: 'classNames.popup.root',
        popupClassName: 'classNames.popup.root',
        dropdownRender: 'popupRender',
        onDropdownVisibleChange: 'onOpenChange',
        bordered: 'variant',
      };

      Object.entries(deprecatedProps).forEach(([oldProp, newProp]) => {
        warning.deprecated(
          (props as any)[oldProp] === undefined,
          oldProp,
          newProp,
        );
      });

      warning(
        multiple !== false || !treeCheckable,
        'usage',
        '`multiple` will always be `true` when `treeCheckable` is true',
      );

      warning(
        props.showArrow === undefined,
        'deprecated',
        '`showArrow` is deprecated which will be removed in next major version. It will be a default behavior, you can hide it by setting `suffixIcon` to null.',
      );
    }

    const prefixCls = computed<string>(() =>
      getPrefixCls('select', customizePrefixCls.value),
    );
    const treePrefixCls = computed(() =>
      getPrefixCls('select-tree', customizePrefixCls.value),
    );
    const { compactSize, compactItemClassnames } = useCompactItemContext(
      prefixCls,
      direction,
    );
    const rootCls = useCSSVarCls(prefixCls);
    const treeSelectRootCls = useCSSVarCls(treeSelectPrefixCls);

    const [hashId, cssVarCls] = useSelectStyle(prefixCls, rootCls);
    useStyle(treeSelectPrefixCls, treePrefixCls, treeSelectRootCls);

    const [variant, enableVariasCls] = useVariant(
      'treeSelect',
      customVariant,
      bordered,
    );
    // ===================== Size =====================
    const mergedSize = useSize(
      (ctx) => customizeSize.value ?? compactSize.value ?? ctx,
    );

    // ===================== Disabled =====================
    const disabled = useDisabledContext();
    const mergedDisabled = computed(
      () => customDisabled.value ?? disabled.value,
    );

    // ===================== Form =====================
    const formItemInputContext = useFormItemInputContext();

    const mergedStatus = computed(() =>
      getMergedStatus(formItemInputContext.value.status, customStatus.value),
    );

    // =========== Merged Props for Semantic ===========

    const mergedProps = computed(
      () =>
        ({
          ...props,
          size: mergedSize.value,
          disabled: mergedDisabled.value,
          status: mergedStatus.value,
          variant: variant.value,
        }) as TreeSelectProps,
    );

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TreeSelectClassNamesType,
      TreeSelectStylesType,
      TreeSelectProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
      computed(() => {
        return {
          popup: {
            _default: 'root',
          },
        };
      }),
    );
    const mergedOnOpenChange = (open: boolean) => {
      emit('openChange', open);
      emit('dropdownVisibleChange', open);
    };

    const mergedMaxCount = computed(() => {
      const { maxCount, showCheckedStrategy, treeCheckStrictly } = props;
      if (
        maxCount &&
        ((showCheckedStrategy === 'SHOW_ALL' && !treeCheckStrictly) ||
          showCheckedStrategy === 'SHOW_PARENT')
      ) {
        return undefined;
      }
      return maxCount;
    });

    // ===================== Placement =====================
    const memoizedPlacement = computed(() => {
      const { placement } = props;
      if (placement !== undefined) {
        return placement;
      }
      return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
    });

    // ============================ zIndex ============================
    const [zIndex] = useZIndex(
      'SelectLike',
      computed(() => mergedStyles.value?.root?.zIndex as number),
    );
    const treeSelectRef = shallowRef();
    expose({
      focus: () => treeSelectRef.value?.focus(),
      blur: () => treeSelectRef.value?.blur(),
      scrollTo: (arg: any) => treeSelectRef.value?.scrollTo?.(arg),
    });
    return () => {
      const {
        popupClassName,
        dropdownClassName,
        rootClass,
        popupRender,
        dropdownRender,
        popupMatchSelectWidth,
        dropdownMatchSelectWidth,
        treeCheckable,
        multiple,
        allowClear,
        treeLine,
        listHeight,
        builtinPlacements,
        switcherIcon: customSwitcherIcon,
        treeIcon,
        getPopupContainer,
        choiceTransitionName,
        transitionName,
        treeExpandAction,
        showCheckedStrategy,
        treeCheckStrictly,
      } = props;
      const restProps = omit(props, omitKeys);
      const treeTitleRender = slots?.treeTitleRender ?? props.treeTitleRender;
      const mergedPopupClassName = clsx(
        popupClassName || dropdownClassName,
        `${treeSelectPrefixCls.value}-dropdown`,
        {
          [`${treeSelectPrefixCls.value}-dropdown-rtl`]:
            direction.value === 'rtl',
        },
        rootClass,
        mergedClassNames.value.root,
        mergedClassNames.value.popup?.root,
        cssVarCls.value,
        rootCls.value,
        treeSelectRootCls.value,
        hashId.value,
      );
      const { style, className, restAttrs } = getAttrStyleAndClass(attrs);
      const mergedPopupRender = usePopupRender(popupRender || dropdownRender);
      const customSuffixIcon = getSlotPropsFnRun(
        slots,
        props,
        'suffixIcon',
        false,
      );
      const showSuffixIcon = useShowArrow(customSuffixIcon, props.showArrow);
      const mergedPopupMatchSelectWidth =
        popupMatchSelectWidth ??
        dropdownMatchSelectWidth ??
        configCtx.value?.popupMatchSelectWidth;
      const isMultiple = !!(treeCheckable || multiple);
      const { hasFeedback, feedbackIcon, isFormItemInput } =
        formItemInputContext.value;
      // ===================== Icons =====================
      const { suffixIcon, removeIcon, clearIcon } = useIcons({
        ...restProps,
        suffixIcon: customSuffixIcon,
        multiple: isMultiple,
        showSuffixIcon,
        hasFeedback,
        feedbackIcon,
        prefixCls: prefixCls.value,
        componentName: 'TreeSelect',
      } as any);

      const mergedAllowClear = allowClear === true ? { clearIcon } : allowClear;
      const notFoundContent = getSlotPropsFnRun(
        slots,
        props,
        'notFoundContent',
        false,
      );

      // ===================== Empty =====================
      let mergedNotFound: any;
      mergedNotFound =
        notFoundContent === undefined
          ? configCtx?.value?.renderEmpty?.('Select') || (
              <DefaultRenderEmpty componentName="Select" />
            )
          : notFoundContent;

      // ==================== Render =====================
      const onAttrs: Partial<VcTreeSelectProps> = {
        onFocus(e) {
          emit('focus', e);
        },
        onBlur(e) {
          emit('blur', e);
        },
        onSelect(value, option) {
          // oxlint-disable-next-line typescript/ban-ts-comment
          // @ts-expect-error
          emit('select', value, option);
        },
        onChange(value, labelList, extra) {
          emit('change', value, labelList, extra);
          emit('update:value', value);
        },
        onDeselect(value, option) {
          // oxlint-disable-next-line typescript/ban-ts-comment
          // @ts-expect-error
          emit('deselect', value, option);
        },
        onTreeExpand(expandedKeys) {
          emit('treeExpand', expandedKeys);
        },
        onTreeLoad(loadedKeys) {
          emit('treeLoad', loadedKeys);
        },
        onPopupScroll(e) {
          emit('popupScroll', e);
        },
        onSearch(value) {
          emit('search', value);
        },
      };

      const selectProps = omit(restProps, [
        'suffixIcon',
        'removeIcon',
        'clearIcon',
        'itemIcon',
        'switcherIcon',
        'classes',
        'styles',
        // #209，事件重复传递
        ...Object.keys(onAttrs),
      ]);

      const mergedClassName = clsx(
        !customizePrefixCls.value && treeSelectPrefixCls.value,
        {
          [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
          [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-${variant.value}`]: enableVariasCls.value,
          [`${prefixCls.value}-in-form-item`]: isFormItemInput,
        },
        getStatusClassNames(prefixCls.value, mergedStatus.value, hasFeedback),
        compactItemClassnames.value,
        className,
        rootClass,
        mergedClassNames?.value?.root,
        cssVarCls.value,
        rootCls.value,
        treeSelectRootCls.value,
        hashId.value,
      );

      const mergedSwitcherIcon =
        slots?.switcherIcon ?? customSwitcherIcon ?? switcherIcon.value;

      const renderSwitcherIcon = (nodeProps: AsTreeNodeProps) => (
        <SwitcherIconCom
          prefixCls={treePrefixCls.value}
          showLine={treeLine}
          switcherIcon={mergedSwitcherIcon as SwitcherIcon}
          treeNodeProps={nodeProps}
        />
      );
      const popupOverflow = configCtx.value?.popupOverflow;

      const tagRender = slots?.tagRender ?? props?.tagRender;

      return (
        <VcTreeSelect
          {...restAttrs}
          {...onAttrs}
          classNames={mergedClassNames.value}
          disabled={mergedDisabled.value}
          ref={treeSelectRef}
          styles={mergedStyles.value}
          virtual={virtual.value}
          {...(selectProps as any)}
          allowClear={mergedAllowClear}
          builtinPlacements={mergedBuiltinPlacements(
            builtinPlacements,
            popupOverflow,
          )}
          choiceTransitionName={getTransitionName(
            rootPrefixCls.value,
            '',
            choiceTransitionName,
          )}
          className={mergedClassName}
          getPopupContainer={getPopupContainer || getContextPopupContainer}
          listHeight={listHeight}
          listItemHeight={listItemHeight.value}
          maxCount={mergedMaxCount.value}
          multiple={isMultiple}
          notFoundContent={mergedNotFound}
          onPopupVisibleChange={mergedOnOpenChange}
          placement={memoizedPlacement.value}
          popupClassName={mergedPopupClassName}
          popupMatchSelectWidth={mergedPopupMatchSelectWidth}
          popupRender={mergedPopupRender}
          popupStyle={{
            ...mergedStyles.value.root,
            ...mergedStyles.value.popup?.root,
            zIndex: zIndex.value,
          }}
          prefixCls={prefixCls.value}
          removeIcon={removeIcon}
          showCheckedStrategy={showCheckedStrategy}
          showTreeIcon={treeIcon}
          style={{
            ...mergedStyles.value?.root,
            ...style,
          }}
          suffixIcon={suffixIcon}
          switcherIcon={renderSwitcherIcon}
          tagRender={isMultiple ? tagRender : undefined}
          transitionName={getTransitionName(
            rootPrefixCls.value,
            'slide-up',
            transitionName,
          )}
          treeCheckable={
            treeCheckable ? (
              <span class={`${prefixCls.value}-tree-checkbox-inner`} />
            ) : (
              treeCheckable
            )
          }
          treeCheckStrictly={treeCheckStrictly}
          treeExpandAction={treeExpandAction}
          treeLine={!!treeLine}
          treeMotion={null}
          treeTitleRender={treeTitleRender}
        />
      );
    };
  },
  {
    name: 'AsTreeSelect',
    inheritAttrs: false,
  },
);

interface TreeSelectInstance<
  ValueType = any,
  OptionType extends DataNode = DataNode,
> {
  $emit: {
    (event: 'focus', ...args: Parameters<TreeSelectEmits['focus']>): void;
    (event: 'blur', ...args: Parameters<TreeSelectEmits['blur']>): void;
    (
      event: 'openChange',
      ...args: Parameters<TreeSelectEmits['openChange']>
    ): void;
    (
      event: 'dropdownVisibleChange',
      ...args: Parameters<TreeSelectEmits['dropdownVisibleChange']>
    ): void;
    (
      event: 'select',
      ...args: Parameters<TreeSelectEmits<ValueType, OptionType>['select']>
    ): void;
    (
      event: 'treeExpand',
      ...args: Parameters<TreeSelectEmits<ValueType, OptionType>['treeExpand']>
    ): void;
    (
      event: 'treeLoad',
      ...args: Parameters<TreeSelectEmits<ValueType, OptionType>['treeLoad']>
    ): void;
    (
      event: 'change',
      ...args: Parameters<TreeSelectEmits<ValueType, OptionType>['change']>
    ): void;
    (
      event: 'update:value',
      ...args: Parameters<TreeSelectEmits['update:value']>
    ): void;
    (
      event: 'deselect',
      ...args: Parameters<TreeSelectEmits<ValueType, OptionType>['deselect']>
    ): void;
    (
      event: 'popupScroll',
      ...args: Parameters<TreeSelectEmits<ValueType, OptionType>['popupScroll']>
    ): void;
    (
      event: 'search',
      ...args: Parameters<TreeSelectEmits<ValueType, OptionType>['search']>
    ): void;
  };
  $props: PublicProps & TreeSelectProps<ValueType, OptionType>;
  $slots: TreeSelectSlots<OptionType>;
  blur: () => void;
  focus: () => void;
  scrollTo: (arg: any) => void;
}

export interface TreeSelectConstructor {
  new <ValueType = any, OptionType extends DataNode = DataNode>(
    props: TreeSelectProps<ValueType, OptionType>,
  ): TreeSelectInstance<ValueType, OptionType>;
  /**
   * Non-generic fallback signature. TypeScript infers from the last overload,
   * so this keeps render-function usage like `h(TreeSelect, props)` resolvable
   * against Vue's `Constructor<P>` overload of `h` (see #634), while the
   * generic signature above still drives template/Volar inference.
   */
  new (props: TreeSelectProps<any, any>): TreeSelectInstance<any, any>;
  _InternalPanelDoNotUseOrYouWillBeFired: any;
  install: (app: App) => void;
  SHOW_ALL: typeof SHOW_ALL;
  SHOW_CHILD: typeof SHOW_CHILD;
  SHOW_PARENT: typeof SHOW_PARENT;
  TreeNode: typeof TreeNode;
}

const TreeSelect = InternalTreeSelect as unknown as TreeSelectConstructor;

export const TreeSelectNode = TreeNode;
TreeSelect.TreeNode = TreeNode;
TreeSelect.SHOW_ALL = SHOW_ALL;
TreeSelect.SHOW_PARENT = SHOW_PARENT;
TreeSelect.SHOW_CHILD = SHOW_CHILD;

TreeSelect.install = (app: App) => {
  app.component(InternalTreeSelect.name, TreeSelect);
  app.component('AsTreeSelectOption', TreeSelectNode);
  return app;
};

// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(TreeSelect, 'popupAlign', (props: any) =>
  omit(props, ['visible']),
);

TreeSelect._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

export default TreeSelect;
