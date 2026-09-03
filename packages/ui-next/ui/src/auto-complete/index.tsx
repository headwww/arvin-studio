import type { App, CSSProperties, SlotsType } from 'vue';

import type { SelectProps as VcSelectProps } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type {
  InternalSelectProps,
  SearchConfig,
  SelectPopupSemanticClassNames,
  SelectPopupSemanticStyles,
  SelectProps,
  SelectSlots,
} from '../select';

import { computed, defineComponent, isVNode, Text } from 'vue';

import { filterEmpty, SelectOption as Option } from '@arvin-studio/headless';
import { clsx, omit, toArray } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../_util/hooks';
import genPurePanel from '../_util/PurePanel';
import { toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import Select from '../select';

export interface AutoCompleteSemanticClassNames {
  clear?: string;
  content?: string;
  input?: string;
  placeholder?: string;
  prefix?: string;
  root?: string;
}

export interface AutoCompleteSemanticStyles {
  clear?: CSSProperties;
  content?: CSSProperties;
  input?: CSSProperties;
  placeholder?: CSSProperties;
  prefix?: CSSProperties;
  root?: CSSProperties;
}

export interface DataSourceItemObject {
  text: string;
  value: string;
}

export type DataSourceItemType = DataSourceItemObject | VueNode;

export type AutoCompleteClassNamesType = SemanticClassNamesType<
  AutoCompleteProps,
  AutoCompleteSemanticClassNames,
  { popup?: SelectPopupSemanticClassNames }
>;

export type AutoCompleteStylesType = SemanticStylesType<
  AutoCompleteProps,
  AutoCompleteSemanticStyles,
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
  | 'onSearch'
  | 'onSelect';

export interface AutoCompleteProps
  /* @vue-ignore */
  extends
    AutoCompleteEmitsProps,
    Omit<
      InternalSelectProps,
      | 'classes'
      | 'filterSort'
      | 'getInputElement'
      | 'getRawInputElement'
      | 'labelInValue'
      | 'loading'
      | 'mode'
      | 'optionFilterProp'
      | 'optionLabelProp'
      | 'showSearch'
      | 'styles'
      | RcEventKeys
    > {
  classes?: AutoCompleteClassNamesType;
  /** @deprecated Please use `options` instead */
  dataSource?: DataSourceItemType[];
  /** @deprecated Please use `classes.popup.root` instead */
  dropdownClassName?: string;
  /** @deprecated Please use `popupMatchSelectWidth` instead */
  dropdownMatchSelectWidth?: boolean | number;
  /** @deprecated Please use `popupRender` instead */
  dropdownRender?: (menu: VueNode) => any;
  /** @deprecated Please use `styles.popup.root` instead */
  dropdownStyle?: CSSProperties;
  /** @deprecated Please use `classes.popup.root` instead */
  popupClassName?: string;
  popupMatchSelectWidth?: boolean | number;
  popupRender?: (menu: VueNode) => any;
  showSearch?: boolean | Pick<SearchConfig, 'filterOption' | 'onSearch'>;
  status?: InputStatus;
  styles?: AutoCompleteStylesType;
}

export interface AutoCompleteEmits {
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
  search: NonNullable<VcSelectProps['onSearch']>;
  select: NonNullable<VcSelectProps['onSelect']>;
  'update:value': (value: any) => void;
}
export interface AutoCompleteEmitsProps {
  onActive?: AutoCompleteEmits['active'];
  onBlur?: AutoCompleteEmits['blur'];
  onChange?: AutoCompleteEmits['change'];
  onClear?: AutoCompleteEmits['clear'];
  onClick?: AutoCompleteEmits['click'];
  onDeselect?: AutoCompleteEmits['deselect'];
  onDropdownVisibleChange?: AutoCompleteEmits['dropdownVisibleChange'];
  onFocus?: AutoCompleteEmits['focus'];
  onInputKeydown?: AutoCompleteEmits['inputKeydown'];
  onKeydown?: AutoCompleteEmits['keydown'];
  onKeyup?: AutoCompleteEmits['keyup'];
  onMousedown?: AutoCompleteEmits['mousedown'];
  onMouseenter?: AutoCompleteEmits['mouseenter'];
  onMouseleave?: AutoCompleteEmits['mouseleave'];
  onOpenChange?: AutoCompleteEmits['openChange'];
  onPopupScroll?: AutoCompleteEmits['popupScroll'];
  onSearch?: AutoCompleteEmits['search'];
  onSelect?: AutoCompleteEmits['select'];
  'onUpdate:value'?: AutoCompleteEmits['update:value'];
}

export interface AutoCompleteSlots {
  default?: () => any;
  labelRender?: SelectSlots['labelRender'];
  maxTagPlaceholder?: SelectSlots['maxTagPlaceholder'];
  notFoundContent?: SelectSlots['notFoundContent'];
  optionRender?: SelectSlots['optionRender'];
  popupRender?: SelectSlots['popupRender'];
  prefix?: SelectSlots['prefix'];
  suffixIcon?: SelectSlots['suffixIcon'];
  tagRender?: SelectSlots['tagRender'];
}

function isSelectOptionOrSelectOptGroup(child: any): boolean {
  return (
    child?.type && (child.type.isSelectOption || child.type.isSelectOptGroup)
  );
}

const omitKeys: (keyof AutoCompleteProps)[] = [
  'dataSource',
  'dropdownClassName',
  'popupClassName',
  'dropdownMatchSelectWidth',
  'dropdownRender',
  'dropdownStyle',
  'classes',
  'styles',
  'popupRender',
];

const InternalAutoComplete = defineComponent<
  AutoCompleteProps,
  AutoCompleteEmits,
  string,
  SlotsType<AutoCompleteSlots>
>(
  (props, { slots, emit, attrs }) => {
    const { prefixCls } = useComponentBaseConfig('select', props);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');

    const mergedProps = computed(() => {
      return {
        ...props,
        popupMatchSelectWidth:
          props.popupMatchSelectWidth ?? props.dropdownMatchSelectWidth,
        popupRender: props.popupRender ?? props.dropdownRender,
      } as AutoCompleteProps;
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      AutoCompleteClassNamesType,
      AutoCompleteStylesType,
      AutoCompleteProps
    >(
      useToArr(classes),
      useToArr(styles),
      useToProps(mergedProps),
      computed(() => ({
        popup: {
          _default: 'root',
        },
      })),
    );

    return () => {
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const childNodes = toArray(filterEmpty(slots.default?.() ?? []));
      const hasSelectOptions =
        childNodes.length > 0 && isSelectOptionOrSelectOptGroup(childNodes[0]);

      let customizeInput: any;
      if (
        childNodes.length === 1 &&
        isVNode(childNodes[0]) &&
        childNodes[0].type !== Text &&
        !isSelectOptionOrSelectOptGroup(childNodes[0])
      ) {
        [customizeInput] = childNodes;
      }

      const getInputElement = customizeInput ? () => customizeInput : undefined;
      const customizeInputPlaceholder = customizeInput?.props?.placeholder;
      const forwardedSlots = Object.fromEntries(
        Object.entries(slots).filter(([key]) => key !== 'default'),
      ) as Omit<AutoCompleteSlots, 'default'>;

      let optionChildren: any = [];
      if (hasSelectOptions) {
        optionChildren = childNodes;
      } else if (props.dataSource) {
        optionChildren = props.dataSource.map((item) => {
          if (isVNode(item)) {
            return item;
          }
          switch (typeof item) {
            case 'object': {
              const { value: optionValue, text } = item as DataSourceItemObject;
              return (
                <Option key={optionValue} value={optionValue}>
                  {text}
                </Option>
              );
            }
            case 'string': {
              return (
                <Option key={item} value={item}>
                  {item}
                </Option>
              );
            }
            default: {
              return null;
            }
          }
        });
      }
      optionChildren = filterEmpty(optionChildren);

      if (isDev) {
        const warning = devUseWarning('AutoComplete');
        warning(
          !customizeInput || props.size === undefined,
          'usage',
          'You need to control style self instead of setting `size` when using customize input.',
        );

        const deprecatedProps = {
          dropdownMatchSelectWidth: 'popupMatchSelectWidth',
          dropdownStyle: 'styles.popup.root',
          dropdownClassName: 'classes.popup.root',
          popupClassName: 'classes.popup.root',
          dropdownRender: 'popupRender',
          dataSource: 'options',
        };

        Object.entries(deprecatedProps).forEach(([oldProp, newProp]) => {
          warning.deprecated(!(props as any)[oldProp], oldProp, newProp);
        });
      }

      const mergedPopupRender = props.popupRender ?? props.dropdownRender;
      const mergedPopupMatchSelectWidth =
        props.popupMatchSelectWidth ?? props.dropdownMatchSelectWidth;

      const finalClassNames = {
        root: clsx(
          `${prefixCls.value}-auto-complete`,
          mergedClassNames.value.root,
          {
            [`${prefixCls.value}-customize`]: customizeInput,
          },
          className,
        ),
        prefix: mergedClassNames.value.prefix,
        input: mergedClassNames.value.input,
        placeholder: mergedClassNames.value.placeholder,
        content: mergedClassNames.value.content,
        clear: mergedClassNames.value.clear,
        popup: {
          root: clsx(
            props.popupClassName,
            props.dropdownClassName,
            mergedClassNames.value.popup?.root,
          ),
          list: mergedClassNames.value.popup?.list,
          listItem: mergedClassNames.value.popup?.listItem,
        },
      };

      const finalStyles = {
        root: mergedStyles.value.root,
        prefix: mergedStyles.value.prefix,
        input: mergedStyles.value.input,
        placeholder: mergedStyles.value.placeholder,
        content: mergedStyles.value.content,
        clear: mergedStyles.value.clear,
        popup: {
          root: {
            ...props.dropdownStyle,
            ...mergedStyles?.value?.popup?.root,
          },
          list: mergedStyles.value.popup?.list,
          listItem: mergedStyles.value.popup?.listItem,
        },
      };

      const selectProps: Record<string, any> = omit(props, omitKeys);
      if (
        selectProps.placeholder === undefined &&
        customizeInputPlaceholder !== undefined
      ) {
        selectProps.placeholder = customizeInputPlaceholder;
      }
      const onAttrs = {
        onSelect: (value: any, option: any) => {
          emit('select', value, option);
        },
        onClear: () => {
          emit('clear');
        },
        onKeydown: (e: any) => {
          emit('keydown', e);
        },
        onKeyup: (e: any) => {
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
          emit('change', value, option);
        },
        onDeselect: (value: any, option: any) => {
          emit('deselect', value, option);
        },
        onInputKeydown: (e: any) => {
          emit('inputKeydown', e);
        },
        onMousedown: (e: any) => {
          emit('mousedown', e);
        },
        onMouseleave: (e: any) => {
          emit('mouseleave', e);
        },
        onMouseenter: (e: any) => {
          emit('mouseenter', e);
        },
        onPopupScroll: (e: any) => {
          emit('popupScroll', e);
        },
        onSearch: (value: any) => {
          emit('search', value);
        },
        onOpenChange: (open: boolean) => {
          emit('openChange', open);
        },
        onDropdownVisibleChange: (open: boolean) => {
          emit('dropdownVisibleChange', open);
        },
      };

      const inputProps = getInputElement ? ({ getInputElement } as any) : {};
      return (
        <Select
          {...restAttrs}
          {...selectProps}
          {...onAttrs}
          {...inputProps}
          classes={finalClassNames as any}
          mode={
            (Select as any)
              .SECRET_COMBOBOX_MODE_DO_NOT_USE as SelectProps['mode']
          }
          popupMatchSelectWidth={mergedPopupMatchSelectWidth}
          popupRender={mergedPopupRender}
          prefixCls={prefixCls.value}
          style={style}
          styles={finalStyles as any}
          suffixIcon={null}
          v-slots={forwardedSlots}
          {...{
            'onUpdate:value': (value: any) => emit('update:value', value),
          }}
        >
          {optionChildren}
        </Select>
      );
    };
  },
  {
    name: 'AsAutoComplete',
    inheritAttrs: false,
  },
);

const AutoComplete = InternalAutoComplete as typeof InternalAutoComplete & {
  _InternalPanelDoNotUseOrYouWillBeFired: any;
  install: (app: App) => void;
  Option: typeof Option;
};

// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(
  InternalAutoComplete,
  'popupAlign',
  (props: any) => {
    return omit(props, ['visible']);
  },
);

AutoComplete.Option = Option;

AutoComplete._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

AutoComplete.install = (app: App): void => {
  app.component(AutoComplete.name, AutoComplete);
  app.component('AAutoCompleteOption', Option as any);
};

export { Option };
export default AutoComplete;
