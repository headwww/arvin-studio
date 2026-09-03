import type { App, CSSProperties, SlotsType } from 'vue';

import type {
  BaseSelectRef,
  SelectProps as VcSelectProps,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { SelectCommonPlacement } from '../_util/motion';
import type { InputStatus } from '../_util/statusUtils';
import type { ComponentBaseProps, Variant } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import {
  getTransitionName,
  SelectOptGroup,
  SelectOption,
  Select as VcSelect,
} from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
  useZIndex,
} from '../_util/hooks';
import genPurePanel from '../_util/PurePanel';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import { DefaultRenderEmpty } from '../config-provider/default-render-empty';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useSize } from '../config-provider/hooks/useSize';
import { useFormItemInputContext } from '../form/context';
import { useVariants } from '../form/hooks/useVariant';
import { useCompactItemContext } from '../space/Compact';
import { useToken } from '../theme/internal';
import mergedBuiltinPlacements from './mergedBuiltinPlacements';
import useStyle from './style';
import useIcons from './useIcons';
import usePopupRender from './usePopupRender';
import useShowArrow from './useShowArrow';

type RawValue = number | string;

export type { SearchConfig } from '@arvin-studio/headless';

export interface LabeledValue {
  key?: string;
  label: VueNode;
  value: RawValue;
}

export type SelectValue =
  | LabeledValue
  | LabeledValue[]
  | RawValue
  | RawValue[]
  | undefined;

export interface InternalSelectProps
  extends
    ComponentBaseProps,
    Omit<
      VcSelectProps,
      'className' | 'classNames' | 'mode' | 'prefix' | 'style' | 'styles'
    > {
  /** @deprecated Use `variant` instead. */
  bordered?: boolean;
  classes?: SelectClassNamesType;
  disabled?: boolean;
  mode?: 'combobox' | 'multiple' | 'SECRET_COMBOBOX_MODE_DO_NOT_USE' | 'tags';
  prefix?: VueNode;
  /**
   * @deprecated `showArrow` is deprecated which will be removed in next major version. It will be a
   *   default behavior, you can hide it by setting `suffixIcon` to null.
   */
  showArrow?: boolean;
  size?: SizeType;
  styles?: SelectStylesType;
  suffixIcon?: VueNode;
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
}

export interface SelectSemanticClassNames {
  clear?: string;
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

export interface SelectSemanticStyles {
  clear?: CSSProperties;
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

export interface SelectPopupSemanticClassNames {
  list?: string;
  listItem?: string;
  root?: string;
}

export interface SelectPopupSemanticStyles {
  list?: CSSProperties;
  listItem?: CSSProperties;
  root?: CSSProperties;
}

export type SelectClassNamesType = SemanticClassNamesType<
  SelectProps,
  SelectSemanticClassNames,
  { popup?: SelectPopupSemanticClassNames }
>;

export type SelectStylesType = SemanticStylesType<
  SelectProps,
  SelectSemanticStyles,
  { popup?: SelectPopupSemanticStyles }
>;

type RcEventKeys =
  | 'onActive'
  | 'onBlur'
  | 'onChange'
  | 'onClear'
  | 'onClick'
  | 'onDeselect'
  | 'onFocus'
  | 'onInputKeyDown'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onMouseDown'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'onPopupScroll'
  | 'onPopupVisibleChange'
  | 'onSelect'
  | 'optionRender';

export interface SelectProps
  extends
    Omit<
      InternalSelectProps,
      | 'backfill'
      | 'classes'
      | 'dropdownClassName'
      | 'dropdownStyle'
      | 'getInputElement'
      | 'getRawInputElement'
      | 'mode'
      | 'placement'
      | 'styles'
      | RcEventKeys
    >,
    /* @vue-ignore */
    SelectEmitsProps {
  classes?: SelectClassNamesType;
  /** @deprecated Please use `classNames.popup.root` instead */
  dropdownClassName?: string;
  // /** @deprecated Please use `onOpenChange` instead */
  // onDropdownVisibleChange?: SelectProps['onPopupVisibleChange']
  /** @deprecated Please use `popupMatchSelectWidth` instead */
  dropdownMatchSelectWidth?: boolean | number;
  /** @deprecated Please use `popupRender` instead */
  dropdownRender?: SelectProps['popupRender'];
  /** @deprecated Please use `styles.popup` instead */
  dropdownStyle?: CSSProperties;
  mode?: 'multiple' | 'tags';
  optionRender?: (params: {
    info: OptionParams[1];
    option: OptionParams[0];
  }) => any;
  placement?: SelectCommonPlacement;
  /** @deprecated Please use `classNames.popup.root` instead */
  popupClassName?: string;
  popupMatchSelectWidth?: boolean | number;
  status?: InputStatus;
  styles?: SelectStylesType;
}

const omitKeys = [
  'onClear',
  'onKeyUp',
  'onKeyDown',
  'onBlur',
  'onClick',
  'onActive',
  'onChange',
  'onDeselect',
  'onInputKeyDown',
  'onMouseDown',
  'onMouseLeave',
  'onMouseEnter',
  'onFocus',
  'onPopupScroll',
  'onPopupVisibleChange',
  'onSelect',
  'popupRender',
  'labelRender',
  'optionRender',
  'maxTagPlaceholder',
  'notFoundContent',
];

export interface SelectEmits {
  active: NonNullable<VcSelectProps['onActive']>;
  blur: NonNullable<VcSelectProps['onBlur']>;
  change: NonNullable<VcSelectProps['onChange']>;
  clear: NonNullable<VcSelectProps['onClear']>;
  click: NonNullable<VcSelectProps['onClick']>;
  deselect: NonNullable<VcSelectProps['onDeselect']>;
  dropdownVisibleChange: (open: boolean) => void;
  focus: NonNullable<VcSelectProps['onFocus']>;
  inputKeydown: NonNullable<VcSelectProps['onInputKeyDown']>;
  keydown: NonNullable<VcSelectProps['onKeyDown']>;
  keyup: NonNullable<VcSelectProps['onKeyUp']>;
  mousedown: NonNullable<VcSelectProps['onMouseDown']>;
  mouseenter: NonNullable<VcSelectProps['onMouseEnter']>;
  mouseleave: NonNullable<VcSelectProps['onMouseLeave']>;
  openChange: (open: boolean) => void;
  popupScroll: NonNullable<VcSelectProps['onPopupScroll']>;
  select: NonNullable<VcSelectProps['onSelect']>;
  'update:value': (value: SelectValue) => void;
}
export interface SelectEmitsProps {
  onActive?: SelectEmits['active'];
  onBlur?: SelectEmits['blur'];
  onChange?: SelectEmits['change'];
  onClear?: SelectEmits['clear'];
  onClick?: SelectEmits['click'];
  onDeselect?: SelectEmits['deselect'];
  onDropdownVisibleChange?: SelectEmits['dropdownVisibleChange'];
  onFocus?: SelectEmits['focus'];
  onInputKeydown?: SelectEmits['inputKeydown'];
  onKeydown?: SelectEmits['keydown'];
  onKeyup?: SelectEmits['keyup'];
  onMousedown?: SelectEmits['mousedown'];
  onMouseenter?: SelectEmits['mouseenter'];
  onMouseleave?: SelectEmits['mouseleave'];
  onOpenChange?: SelectEmits['openChange'];
  onPopupScroll?: SelectEmits['popupScroll'];
  onSelect?: SelectEmits['select'];
  'onUpdate:value'?: SelectEmits['update:value'];
}

type OptionParams = Parameters<NonNullable<VcSelectProps['optionRender']>>;

export interface SelectSlots {
  labelRender?: SelectProps['labelRender'];
  maxTagPlaceholder?: (data: any[]) => any;
  notFoundContent?: () => any;
  optionRender?: (params: {
    info: OptionParams[1];
    option: OptionParams[0];
  }) => any;
  popupRender?: SelectProps['popupRender'];
  prefix?: () => any;
  suffixIcon?: () => any;
  tagRender?: SelectProps['tagRender'];
}

const SECRET_COMBOBOX_MODE_DO_NOT_USE = 'SECRET_COMBOBOX_MODE_DO_NOT_USE';

const defaults = {
  listHeight: 256,
} as any;
const Select = defineComponent<
  SelectProps,
  SelectEmits,
  string,
  SlotsType<SelectSlots>
>(
  (props = defaults, { slots, emit, expose, attrs }) => {
    const selectRef = shallowRef<BaseSelectRef>();
    const {
      getPopupContainer: getContextPopupContainer,
      getPrefixCls,
      renderEmpty,
      direction: contextDirection,
      virtual,
      popupMatchSelectWidth: contextPopupMatchSelectWidth,
      popupOverflow,
      showSearch,
      style: contextStyle,
      styles: contextStyles,
      class: contextClassName,
      classes: contextClassNames,
      prefixCls,
    } = useComponentBaseConfig('select', props, ['showSearch']);
    const {
      listItemHeight: customListItemHeight,
      direction: propDirection,
      variant: customizeVariant,
      bordered,
      size: customizeSize,
      classes,
      styles,
    } = toPropsRefs(
      props,
      'listItemHeight',
      'direction',
      'variant',
      'bordered',
      'size',
      'classes',
      'styles',
    );
    const [, token] = useToken();

    const value = shallowRef(props.value ?? props?.defaultValue);
    watch(
      () => props.value,
      () => {
        value.value = props.value;
      },
    );

    const listItemHeight = computed(
      () => customListItemHeight.value ?? token?.value?.controlHeight,
    );
    const rootPrefixCls = computed(() => getPrefixCls());
    const direction = computed(
      () => propDirection.value ?? contextDirection.value,
    );

    const { compactSize, compactItemClassnames } = useCompactItemContext(
      prefixCls,
      direction,
    );

    const [variant, enableVariasCls] = useVariants(
      'select',
      customizeVariant,
      bordered,
    );
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const mode = computed(() => {
      const { mode: m } = props as InternalSelectProps;
      if (m === 'combobox') {
        return undefined;
      }
      if (m === SECRET_COMBOBOX_MODE_DO_NOT_USE) {
        return 'combobox';
      }
      return m;
    });

    const isMultiple = computed(
      () => mode.value === 'multiple' || mode.value === 'tags',
    );

    const mergedOnOpenChange = (open: boolean) => {
      emit('openChange', open);
      emit('dropdownVisibleChange', open);
    };

    // ===================== Form Status =====================
    const formItemInputContext = useFormItemInputContext();

    const mergedSize = useSize(
      (ctx) => customizeSize.value ?? compactSize.value ?? ctx,
    );

    // ===================== Disabled =====================
    const disabled = useDisabledContext();

    const mergedDisabled = computed(() => props.disabled ?? disabled.value);

    // ========== Merged Props for Semantic ==================
    const mergedProps = computed(() => {
      return {
        ...props,
        variant: variant.value,
        disabled: mergedDisabled.value,
        size: mergedSize.value,
      } as SelectProps;
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      SelectClassNamesType,
      SelectStylesType,
      SelectProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
      computed(() => {
        return {
          popup: {
            _default: 'root',
          },
        };
      }),
    );

    // ===================== Placement =====================
    const memoPlacement = computed(() => {
      const { placement } = props;
      if (placement !== undefined) {
        return placement;
      }
      return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
    });

    // ====================== Warning ======================
    if (isDev) {
      const maxCount = props.maxCount;
      const warning = devUseWarning('Select');
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
        warning.deprecated(!(props as any)[oldProp], oldProp, newProp);
      });

      warning(
        !props.showArrow,
        'deprecated',
        '`showArrow` is deprecated which will be removed in next major version. It will be a default behavior, you can hide it by setting `suffixIcon` to null.',
      );

      warning(
        maxCount === undefined || !!isMultiple.value,
        'usage',
        '`maxCount` only works with mode `multiple` or `tags`',
      );
    }

    const mergedPopupStyle = computed(() => {
      const { popupStyle, dropdownStyle } = props;
      return {
        ...mergedStyles.value.popup?.root,
        ...(popupStyle ?? dropdownStyle),
      };
    });

    // ====================== zIndex =========================
    const [zIndex] = useZIndex(
      'SelectLike',
      computed(
        () =>
          (mergedStyles.value?.popup?.root?.zIndex as number) ??
          (mergedPopupStyle.value?.zIndex as number),
      ),
    );

    expose({
      focus: () => selectRef.value?.focus(),
      blur: () => selectRef.value?.blur(),
      scrollTo: (arg: any) => selectRef.value?.scrollTo(arg),
    });
    return () => {
      const {
        popupMatchSelectWidth,
        dropdownMatchSelectWidth,
        showArrow,
        dropdownRender,
        status: customStatus,
        allowClear,
        popupClassName,
        dropdownClassName,
        rootClass,
        // oxlint-disable-next-line no-unused-vars
        popupStyle,
        // oxlint-disable-next-line no-unused-vars
        dropdownStyle,
        transitionName,
        builtinPlacements,
        listHeight,
        getPopupContainer,
        maxCount,
        ...rest
      } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const mergedSuffixIcon = getSlotPropsFnRun(
        slots,
        props,
        'suffixIcon',
        false,
      );
      const showSuffixIcon = useShowArrow(mergedSuffixIcon, showArrow);
      const tagRender = slots?.tagRender ?? props?.tagRender;
      const mergedPopupMatchSelectWidth =
        popupMatchSelectWidth ??
        dropdownMatchSelectWidth ??
        contextPopupMatchSelectWidth.value;
      const popupRender = slots?.popupRender ?? props?.popupRender;
      const mergedPopupRender = usePopupRender(popupRender || dropdownRender);
      const notFoundContent = getSlotPropsFnRun(
        slots,
        props,
        'notFoundContent',
        false,
      );
      const {
        status: contextStatus,
        hasFeedback,
        isFormItemInput,
        feedbackIcon,
      } = formItemInputContext.value || {};
      const mergedStatus = getMergedStatus(contextStatus, customStatus);
      // ===================== Empty =====================
      let mergedNotFound: any;
      if (notFoundContent !== undefined) {
        mergedNotFound = notFoundContent;
      } else if (mode.value === 'combobox') {
        mergedNotFound = null;
      } else {
        mergedNotFound = renderEmpty?.value?.('Select') || (
          <DefaultRenderEmpty componentName="Select" />
        );
      }

      // ===================== Icons =====================
      const { suffixIcon, itemIcon, removeIcon, clearIcon } = useIcons({
        ...rest,
        multiple: isMultiple.value,
        hasFeedback,
        feedbackIcon,
        showSuffixIcon,
        suffixIcon: mergedSuffixIcon,
        prefixCls: prefixCls.value,
        componentName: 'Select',
      } as any);

      const mergedAllowClear = allowClear === true ? { clearIcon } : allowClear;

      const selectProps: Record<string, any> = omit(rest as any, [
        'suffixIcon',
        'classes',
        'styles',
        'itemIcon',
        'value',
        'showSearch',
        ...omitKeys,
      ]);
      const mergedPopupClassName = clsx(
        mergedClassNames.value?.popup?.root,
        popupClassName,
        dropdownClassName,
        {
          [`${prefixCls.value}-dropdown-${direction.value}`]:
            direction.value === 'rtl',
        },
        rootClass,
        cssVarCls.value,
        rootCls.value,
        hashId.value,
      );

      const mergedClassName = clsx(
        {
          [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
          [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-${variant.value}`]: enableVariasCls.value,
          [`${prefixCls.value}-in-form-item`]: isFormItemInput,
        },
        getStatusClassNames(prefixCls.value, mergedStatus, hasFeedback),
        compactItemClassnames.value,
        contextClassName.value,
        className,
        mergedClassNames.value?.root,
        rootClass,
        cssVarCls.value,
        rootCls.value,
        hashId.value,
      );
      // ====================== Render =======================
      const prefix = getSlotPropsFnRun(slots, props, 'prefix');
      const onAttrs = {
        onSelect: (value: any, option: any) => {
          emit('select', value, option);
        },
        onClear: () => {
          emit('clear');
        },
        onKeyDown: (e: any) => {
          emit('keydown', e);
        },
        onKeyUp: (e: any) => {
          emit('keyup', e);
        },
        onBlur: (e: any) => {
          emit('blur', e);
        },
        onFocus: (e: any) => {
          emit('focus', e);
        },
        onClick: (e: any) => {
          emit('click', e);
        },
        onActive: (value: any) => {
          emit('active', value);
        },
        onChange: (value: any, option: any) => {
          emit('update:value', value);
          emit('change', value, option);
        },
        onDeselect: (value: any, option: any) => {
          emit('deselect', value, option);
        },
        onInputKeyDown: (e: any) => {
          emit('inputKeydown', e);
        },
        onMouseDown: (e: any) => {
          emit('mousedown', e);
        },
        onMouseLeave: (e: any) => {
          emit('mouseleave', e);
        },
        onMouseEnter: (e: any) => {
          emit('mouseenter', e);
        },
        onPopupScroll: (e: any) => {
          emit('popupScroll', e);
        },
      };
      const labelRender = slots?.labelRender ?? props?.labelRender;
      const optionRender = slots?.optionRender ?? props?.optionRender;
      if (optionRender) {
        selectProps.optionRender = (
          option: OptionParams[0],
          info: OptionParams[1],
        ) => {
          return optionRender({ option, info });
        };
      }
      if (mergedNotFound !== undefined) {
        selectProps.notFoundContent = mergedNotFound;
      }
      return (
        <VcSelect
          {...(restAttrs as any)}
          {...onAttrs}
          classNames={mergedClassNames.value}
          ref={selectRef}
          showSearch={props?.showSearch ?? showSearch.value}
          styles={mergedStyles.value as any}
          virtual={virtual.value}
          {...selectProps}
          allowClear={mergedAllowClear}
          builtinPlacements={mergedBuiltinPlacements(
            builtinPlacements,
            popupOverflow.value,
          )}
          className={mergedClassName}
          direction={direction.value}
          disabled={mergedDisabled.value}
          getPopupContainer={getPopupContainer || getContextPopupContainer}
          labelRender={labelRender}
          listHeight={listHeight!}
          listItemHeight={listItemHeight.value}
          maxCount={isMultiple.value ? maxCount : undefined}
          maxTagPlaceholder={slots.maxTagPlaceholder}
          menuItemSelectedIcon={itemIcon}
          mode={mode.value}
          notFoundContent={mergedNotFound}
          onPopupVisibleChange={mergedOnOpenChange}
          placement={memoPlacement.value}
          popupClassName={mergedPopupClassName}
          popupMatchSelectWidth={mergedPopupMatchSelectWidth}
          popupRender={mergedPopupRender}
          popupStyle={{
            ...mergedStyles.value?.popup?.root,
            ...mergedPopupStyle.value,
            zIndex: zIndex.value,
          }}
          prefix={prefix}
          prefixCls={prefixCls.value}
          removeIcon={removeIcon}
          style={{ ...mergedStyles.value.root, ...style }}
          suffixIcon={suffixIcon}
          tagRender={isMultiple.value ? tagRender : undefined}
          transitionName={getTransitionName(
            rootPrefixCls.value,
            'slide-up',
            transitionName,
          )}
          value={value.value}
        />
      );
    };
  },
  {
    name: 'ASelect',
    inheritAttrs: false,
  },
);

(Select as any).install = (app: App) => {
  app.component(Select.name, Select);
  app.component('AsSelectOption', Option as any);
  app.component('AsSelectOptGroup', SelectOptGroup as any);
};

(Select as any).SECRET_COMBOBOX_MODE_DO_NOT_USE =
  SECRET_COMBOBOX_MODE_DO_NOT_USE;
(Select as any).Option = Option;
(Select as any).OptGroup = SelectOptGroup;
export default Select;

// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(Select, 'popupAlign');
(Select as any)._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

export { SelectOptGroup, SelectOption };
