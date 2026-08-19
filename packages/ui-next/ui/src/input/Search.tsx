import type { CSSProperties, SlotsType } from 'vue';

import type { VueNode } from '../_util';
import type {
  SemanticClassNames,
  SemanticClassNamesType,
  SemanticSchema,
  SemanticStyles,
  SemanticStylesType,
} from '../_util/hooks';
import type { ButtonSemanticName } from '../button';
import type {
  ButtonSemanticClassNames,
  ButtonSemanticStyles,
} from '../button/button';
import type { ComponentBaseProps } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';
import type {
  InputClassNamesType as BaseInputClassNamesType,
  InputEmits as BaseInputEmits,
  InputProps as BaseInputProps,
  InputStylesType as BaseInputStylesType,
  InputRef,
} from './Input';

import {
  cloneVNode,
  computed,
  defineComponent,
  isVNode,
  shallowRef,
} from 'vue';

import { pickAttrs } from '@arvin-studio/headless';
import { SearchOutlined } from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import Button from '../button';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import { useSize } from '../config-provider/hooks/useSize';
import { SpaceCompact } from '../space';
import { useCompactItemContext } from '../space/Compact';
import Input from './Input';
import useStyle from './style/search';

const schema: SemanticSchema = {
  button: {
    _default: 'root',
  },
};

export type InputSearchSemanticName = keyof InputSearchSemanticClassNames &
  keyof InputSearchSemanticStyles;

export interface InputSearchSemanticClassNames {
  count?: string;
  input?: string;
  prefix?: string;
  root?: string;
  suffix?: string;
}

export interface InputSearchSemanticStyles {
  count?: CSSProperties;
  input?: CSSProperties;
  prefix?: CSSProperties;
  root?: CSSProperties;
  suffix?: CSSProperties;
}

export type InputSearchClassNamesType = SemanticClassNamesType<
  SearchProps,
  InputSearchSemanticClassNames
> & {
  button?: ButtonSemanticClassNames;
};

export type InputSearchStylesType = SemanticStylesType<
  SearchProps,
  InputSearchSemanticStyles
> & {
  button?: ButtonSemanticStyles;
};

export interface SearchProps
  extends
    ComponentBaseProps,
    Omit<BaseInputProps, 'class' | 'rootClass' | 'style'>,
    /* @vue-ignore */
    SearchEmitsProps {
  classes?: InputSearchClassNamesType;
  enterButton?: boolean | VueNode;
  hidden?: boolean;
  inputPrefixCls?: string;
  loading?: boolean;
  on?: never;
  /**
   * Custom search icon shown inside the trigger button when enterButton is a
   * boolean. Mirrors ant-design 6.4.0 PR #57256.
   */
  searchIcon?: VueNode;
  size?: SizeType;
  styles?: InputSearchStylesType;
}

export interface SearchEmits extends BaseInputEmits {
  search: (
    value: string,
    event?: Event | KeyboardEvent | MouseEvent,
    info?: { source?: 'clear' | 'input' },
  ) => void;
}
export interface SearchEmitsProps {
  onSearch?: SearchEmits['search'];
}

export interface InputSearchRef {
  blur: () => void;
  focus: (...args: Parameters<NonNullable<InputRef['focus']>>) => void;
  input: HTMLInputElement | null;
}

const omitInputKeys: (keyof SearchProps)[] = [
  'enterButton',
  'loading',
  'classes',
  'styles',
  'rootClass',
  'prefixCls',
  'inputPrefixCls',
];

export interface SearchSlots {
  addonAfter: () => any;
  addonBefore: () => any;
  clearIcon: () => any;
  default?: () => any;
  prefix?: () => any;
  /**
   * Custom search icon shown inside the trigger button when enterButton is
   * boolean. Slot takes priority over the `searchIcon` prop.
   */
  searchIcon?: () => any;
  suffix?: () => any;
}

const InternalSearch = defineComponent<
  SearchProps,
  SearchEmits,
  string,
  SlotsType<SearchSlots>
>(
  (props, { slots, attrs, emit, expose }) => {
    const composedRef = shallowRef(false);
    const inputRef = shallowRef<InputRef>();

    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      getPrefixCls,
    } = useComponentBaseConfig('inputSearch', props, undefined, 'input-search');

    const inputPrefixCls = computed(() =>
      getPrefixCls('input', props.inputPrefixCls),
    );

    const {
      classes,
      styles,
      size: customizeSize,
      disabled: customDisabled,
      variant,
    } = toPropsRefs(props, 'classes', 'styles', 'size', 'disabled', 'variant');

    const contextDisabled = useDisabledContext();
    const mergedDisabled = computed(
      () => customDisabled.value ?? contextDisabled.value,
    );

    const [hashId, cssVarCls] = useStyle(prefixCls);
    const { compactSize } = useCompactItemContext(prefixCls, direction);
    const mergedSize = useSize<SizeType>(
      (ctx) => (customizeSize.value ?? compactSize.value ?? ctx) as SizeType,
    );

    const mergedProps = computed(() => ({
      ...props,
      enterButton: props.enterButton,
    }));

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      InputSearchClassNamesType,
      InputSearchStylesType,
      SearchProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
      computed(() => schema),
    );

    const handleSearch = (
      event?: Event | KeyboardEvent | MouseEvent,
      info?: { source?: 'clear' | 'input' },
      value?: string,
    ) => {
      emit(
        'search',
        value ?? inputRef.value?.input?.value ?? '',
        event,
        info ?? { source: 'input' },
      );
    };

    const handleChange: BaseInputEmits['change'] = (e) => {
      if (
        (e as MouseEvent)?.type === 'click' &&
        (e?.target as HTMLInputElement | undefined)?.value !== undefined
      ) {
        handleSearch(
          e as MouseEvent,
          { source: 'clear' },
          (e.target as HTMLInputElement).value,
        );
      }
      emit('change', e);
    };

    const handleCompositionStart: BaseInputEmits['compositionstart'] = (e) => {
      composedRef.value = true;
      emit('compositionstart', e);
    };

    const handleCompositionEnd: BaseInputEmits['compositionend'] = (e) => {
      composedRef.value = false;
      emit('compositionend', e);
    };

    const handlePressEnter: BaseInputEmits['pressEnter'] = (e) => {
      if (composedRef.value || props.loading) {
        return;
      }
      emit('pressEnter', e);
      handleSearch(e);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (document.activeElement === inputRef.value?.input) {
        e.preventDefault();
      }
    };

    const onSearchClick = (e: MouseEvent) => {
      handleSearch(e);
    };

    expose({
      focus: (...args: Parameters<NonNullable<InputRef['focus']>>) =>
        inputRef.value?.focus?.(...args),
      blur: () => inputRef.value?.blur?.(),
      input: computed(() => inputRef.value?.input ?? null),
    });

    return () => {
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const rootAttrs = pickAttrs(restAttrs, { data: true });
      const inputAttrs = { ...restAttrs };
      Object.keys(rootAttrs).forEach((key) => {
        delete inputAttrs[key];
      });

      const restInputProps = omit(props, omitInputKeys);

      const mergedClassName = clsx(
        prefixCls.value,
        cssVarCls.value,
        {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-${mergedSize.value}`]: mergedSize.value,
          [`${prefixCls.value}-with-button`]: !!props.enterButton,
        },
        className,
        props.rootClass,
        contextClassName.value,
        mergedClassNames.value.root,
        hashId.value,
      );

      const mergedRootStyle = {
        ...mergedStyles.value.root,
        ...contextStyle.value,
        ...style,
      };

      const btnPrefixCls = `${prefixCls.value}-btn`;
      const btnClassName = clsx(btnPrefixCls, {
        [`${btnPrefixCls}-${variant.value}`]: variant.value,
      });

      const enterButtonValue = props.enterButton ?? false;
      const isBooleanEnterButton = typeof enterButtonValue === 'boolean';
      // Slot > prop > default SearchOutlined.
      const searchIconFromSlot = getSlotPropsFnRun(
        slots,
        props,
        'searchIcon',
        false,
      );
      const searchIcon = isBooleanEnterButton
        ? (searchIconFromSlot ?? props.searchIcon ?? <SearchOutlined />)
        : null;
      const buttonChildren = isBooleanEnterButton
        ? undefined
        : enterButtonValue;

      let buttonNode: any;
      const enterButtonNode = buttonChildren;
      const isButtonVNode = isVNode(enterButtonNode);
      const isAntdButton =
        isButtonVNode && Boolean((enterButtonNode.type as any)?.__ANT_BUTTON);
      const isNativeButton =
        isButtonVNode && (enterButtonNode.type as any) === 'button';
      if (isAntdButton || isNativeButton) {
        const enterButtonProps = (enterButtonNode as any)?.props ?? {};
        buttonNode = cloneVNode(enterButtonNode as any, {
          disabled:
            mergedDisabled.value ||
            enterButtonProps.disabled ||
            (!isAntdButton && props.loading),
          onMousedown: onMouseDown,
          onClick: (e: MouseEvent) => {
            enterButtonProps.onClick?.(e);
            onSearchClick(e);
          },
          class: clsx(enterButtonProps.class, btnClassName),
          ...(isAntdButton && {
            loading: props.loading || enterButtonProps.loading,
            size: mergedSize.value,
          }),
        });
      } else {
        buttonNode = (
          <Button
            class={btnClassName}
            classes={
              mergedClassNames.value
                .button as SemanticClassNames<ButtonSemanticName>
            }
            color={props.enterButton ? 'primary' : 'default'}
            disabled={customDisabled.value}
            icon={searchIcon}
            loading={props.loading}
            onClick={onSearchClick}
            onMousedown={onMouseDown}
            size={mergedSize.value}
            styles={
              mergedStyles.value.button as SemanticStyles<ButtonSemanticName>
            }
            variant={
              // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons
              variant.value === 'borderless' ||
              variant.value === 'filled' ||
              variant.value === 'underlined'
                ? 'text'
                : props.enterButton
                  ? 'solid'
                  : undefined
            }
          >
            {buttonChildren}
          </Button>
        );
      }

      const inputClassNames = omit(mergedClassNames.value, [
        'root',
        'button',
      ]) as BaseInputClassNamesType;
      const inputStyles = omit(mergedStyles.value, [
        'root',
        'button',
      ]) as BaseInputStylesType;

      return (
        <SpaceCompact
          class={mergedClassName}
          style={mergedRootStyle}
          {...{
            hidden: props.hidden,
          }}
          {...rootAttrs}
          size={mergedSize.value}
        >
          <Input
            {...inputAttrs}
            {...restInputProps}
            classes={inputClassNames}
            disabled={customDisabled.value}
            onBlur={(e: any) => emit('blur', e)}
            onChange={handleChange}
            onClear={() => {
              emit('clear');
            }}
            onCompositionend={handleCompositionEnd}
            onCompositionstart={handleCompositionStart}
            onFocus={(e: any) => emit('focus', e)}
            onKeydown={(e: any) => emit('keydown', e)}
            onKeyup={(e: any) => emit('keyup', e)}
            onPressEnter={handlePressEnter}
            prefixCls={inputPrefixCls.value}
            ref={inputRef as any}
            size={mergedSize.value}
            styles={inputStyles}
            v-slots={slots}
            variant={variant.value}
            {...{
              'onUpdate:value': (value: any) => emit('update:value', value),
            }}
          />
          {buttonNode}
        </SpaceCompact>
      );
    };
  },
  {
    name: 'AsInputSearch',
    inheritAttrs: false,
  },
);

export default InternalSearch;
