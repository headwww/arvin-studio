import type { CSSProperties } from 'vue';

import type { CommonInputProps } from '../input';
import type { TextAreaProps, TextAreaRef } from '../textarea';
import type { VueNode } from '../util';
import type { OptionProps } from './Option';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { clsx, omit, toArray } from '@arvin-studio/kit';

import { BaseInput } from '../input';
import TextArea from '../textarea/TextArea';
import { filterEmpty, getAttrStyleAndClass } from '../util';
import useId_ from '../util/hooks/useId';
import KeyCode from '../util/KeyCode';
import { useUnstableContext } from './context';
import useEffectState from './hooks/useEffectState';
import KeywordTrigger from './KeywordTrigger';
import { MentionsProvider } from './MentionsContext';
import {
  filterOption as defaultFilterOption,
  validateSearch as defaultValidateSearch,
  getBeforeSelectionText,
  getLastMeasureIndex,
  replaceWithMeasure,
  setInputSelection,
} from './util';

type BaseTextareaAttrs = Omit<
  TextAreaProps,
  'classNames' | 'onChange' | 'onSelect' | 'prefix' | 'showCount'
>;

export type Placement = 'bottom' | 'top';
export type Direction = 'ltr' | 'rtl';

export interface DataDrivenOptionProps extends OptionProps {
  label?: VueNode;
}

export interface MentionsProps extends BaseTextareaAttrs {
  autoFocus?: boolean;
  className?: string;
  classNames?: CommonInputProps['classNames'] & {
    mentions?: string;
    popup?: string;
    textarea?: string;
  };
  defaultValue?: string;
  direction?: Direction;
  filterOption?: false | typeof defaultFilterOption;
  getPopupContainer?: () => HTMLElement;
  id?: string;
  notFoundContent?: VueNode;
  onBlur?: (e: FocusEvent) => void;
  onChange?: (text: string) => void;
  onFocus?: (e: FocusEvent) => void;
  onPopupScroll?: (event: UIEvent) => void;
  onSearch?: (text: string, prefix: string) => void;
  onSelect?: (option: OptionProps, prefix: string) => void;
  options?: DataDrivenOptionProps[];
  placement?: Placement;
  popupClassName?: string;
  /**
   * Customize the dropdown menu rendering
   * @param menu The default dropdown menu
   * @returns The customized dropdown menu
   */
  popupRender?: (menu: VueNode) => VueNode;
  prefix?: string | string[];
  prefixCls?: string;
  rows?: HTMLTextAreaElement['rows'];
  silent?: boolean;
  split?: string;
  styles?: {
    popup?: CSSProperties;
    suffix?: CSSProperties;
    textarea?: CSSProperties;
  };
  transitionName?: string;
  validateSearch?: typeof defaultValidateSearch;
  value?: string;
}

const omitKeys = [
  'prefixCls',
  'className',
  'style',
  'classNames',
  'styles',

  'prefix',
  'split',
  'notFoundContent',
  'value',
  'defaultValue',
  'children',
  'options',
  'allowClear',
  'suffix',
  'hasWrapper',
  'silent',

  'validateSearch',
  'filterOption',
  'onChange',
  'onKeydown',
  'onKeyup',
  'onPressEnter',
  'onSearch',
  'onSelect',
  'onFocus',
  'onBlur',

  'transitionName',
  'placement',
  'direction',
  'getPopupContainer',
  'popupClassName',

  'rows',
  'visible',
  'onPopupScroll',
  'popupRender',
];

export interface MentionsRef {
  blur: VoidFunction;
  focus: VoidFunction;

  nativeElement: HTMLElement;

  /** @deprecated It may not work as expected */
  textarea: HTMLTextAreaElement | null;
}

interface InternalMentionsProps extends MentionsProps {
  hasWrapper: boolean;
}

const defaults = {
  prefix: '@',
  prefixCls: 'headless-mentions',
  split: ' ',
  notFoundContent: 'Not Found',
  validateSearch: defaultValidateSearch,
  filterOption: defaultFilterOption,
  rows: 1,
} as any;

const InternalMentions = defineComponent<InternalMentionsProps>(
  (props = defaults, { slots, expose, attrs }) => {
    const mergedPrefix = computed(() => {
      const prefix = props.prefix;
      return Array.isArray(prefix) ? prefix : [prefix];
    });

    // =============================== Refs ===============================
    const containerRef = shallowRef<HTMLDivElement>();
    const textareaRef = shallowRef<TextAreaRef>();
    const measureRef = shallowRef<HTMLDivElement>();

    const getTextArea = () => textareaRef.value?.resizableTextArea?.textArea;

    expose({
      focus: () => textareaRef.value?.focus?.(),
      blur: () => textareaRef.value?.blur?.(),
      textarea: computed(() => textareaRef.value?.resizableTextArea?.textArea),
      nativeElement: containerRef,
    });

    // ============================== State ===============================
    const measuring = shallowRef(false);
    const measureText = shallowRef('');
    const measurePrefix = shallowRef('');
    const measureLocation = shallowRef(0);
    const activeIndex = shallowRef(0);
    const isFocus = shallowRef(false);
    const setActiveIndex = (index: number) => {
      activeIndex.value = index;
    };
    // ================================ Id ================================
    const uniqueKey = useId_(props.id);

    // ============================== Value ===============================
    const mergedValue = shallowRef(props.value ?? props?.defaultValue ?? '');
    watch(
      () => props?.value,
      () => {
        mergedValue.value = props.value ?? '';
      },
    );

    // =============================== Open ===============================
    const { open } = useUnstableContext();

    watch(
      measuring,
      () => {
        // Sync measure div top with textarea for rc-trigger usage
        if (measuring.value && measureRef.value) {
          (measureRef.value as any).scrollTop = getTextArea()?.scrollTop;
        }
      },
      {
        immediate: true,
      },
    );
    const mergedMeasuringInfo = computed(() => {
      if (open?.value) {
        for (let i = 0; i < mergedPrefix.value.length; i += 1) {
          const curPrefix = mergedPrefix.value[i];
          const index = mergedValue.value.lastIndexOf(curPrefix!);
          if (index !== -1) {
            return [true, '', curPrefix, index];
          }
        }
      }
      return [
        measuring.value,
        measureText.value,
        measurePrefix.value,
        measureLocation.value,
      ] as const;
    });
    const mergedMeasuring = computed(
      () => mergedMeasuringInfo.value[0] as boolean,
    );
    const mergedMeasureText = computed(
      () => mergedMeasuringInfo.value[1] as string,
    );
    const mergedMeasurePrefix = computed(
      () => mergedMeasuringInfo.value[2] as string,
    );
    const mergedMeasureLocation = computed(
      () => mergedMeasuringInfo.value[3] as number,
    );

    const children = computed(() => {
      const _child = slots?.default ? slots?.default?.() : [];
      if (_child) {
        return filterEmpty(_child).filter(Boolean);
      }
      return _child;
    });

    // ============================== Option ==============================
    const getOptions = (targetMeasureText: string) => {
      let list;
      const options = props?.options ?? [];
      const filterOption = props?.filterOption ?? defaultFilterOption;

      list =
        options && options.length > 0
          ? options.map((item) => ({
              ...item,
              key: `${item?.key ?? item.value}-${uniqueKey}`,
            }))
          : toArray(children.value).map(({ props: optionProps, key }: any) => ({
              ...optionProps,
              label: optionProps.children?.default?.(),
              key: `${key || optionProps.value}-${uniqueKey}`,
            }));

      return list.filter((option: OptionProps) => {
        /** Return all result if `filterOption` is false. */
        if (filterOption === false) {
          return true;
        }
        if (typeof filterOption !== 'function') {
          return true;
        }
        return filterOption(targetMeasureText, option);
      });
    };

    const mergedOptions = computed(() => getOptions(mergedMeasureText.value));

    // Walk options skipping disabled ones; return -1 if none enabled.
    const getEnabledActiveIndex = (
      index: number,
      offset: -1 | 1 = 1,
    ): number => {
      const optionLen = mergedOptions.value.length;
      if (optionLen === 0) {
        return -1;
      }
      for (let i = 0; i < optionLen; i += 1) {
        const current = (index + i * offset + optionLen) % optionLen;
        if (!mergedOptions.value[current]?.disabled) {
          return current;
        }
      }
      return -1;
    };

    // When options change during measuring, ensure activeIndex still points
    // to a valid enabled option.
    watch([mergedMeasuring, mergedOptions], () => {
      if (!mergedMeasuring.value) {
        return;
      }
      const current = mergedOptions.value[activeIndex.value];
      if (!current || current.disabled) {
        const next = getEnabledActiveIndex(0);
        if (next !== activeIndex.value) {
          activeIndex.value = next;
        }
      }
    });

    // ============================= Measure ==============================
    // Mark that we will reset input selection to target position when user select option
    const onSelectionEffect = useEffectState();

    const startMeasure = (
      nextMeasureText: string,
      nextMeasurePrefix: string,
      nextMeasureLocation: number,
    ) => {
      measuring.value = true;
      measureText.value = nextMeasureText;
      measurePrefix.value = nextMeasurePrefix;
      measureLocation.value = nextMeasureLocation;
      activeIndex.value = getEnabledActiveIndex(0);
    };

    const stopMeasure = (callback?: VoidFunction) => {
      measuring.value = false;
      measureLocation.value = 0;
      measureText.value = '';
      onSelectionEffect(callback);
    };

    // ============================== Change ==============================
    const triggerChange = (nextValue: string) => {
      mergedValue.value = nextValue;
      props?.onChange?.(nextValue);
    };

    const onInternalChange = (e: any) => {
      const nextValue = e?.target?.value;
      triggerChange(nextValue);
    };

    const selectOption = (option?: OptionProps) => {
      if (!option || option.disabled) {
        return;
      }
      const { value: mentionValue = '' } = option;
      const textArea = getTextArea()!;
      const { text, selectionLocation } = replaceWithMeasure(
        mergedValue.value,
        {
          measureLocation: mergedMeasureLocation.value,
          targetText: mentionValue,
          prefix: mergedMeasurePrefix.value,
          selectionStart: textArea?.selectionStart as number,
          split: props.split!,
        },
      );
      triggerChange(text);
      stopMeasure(() => {
        // We need restore the selection position
        setInputSelection(textArea, selectionLocation);
      });

      props?.onSelect?.(option, mergedMeasurePrefix.value);
    };

    // ============================= KeyEvent =============================
    // Check if hit the measure keyword
    const onInternalKeyDown = (event: any) => {
      const { which } = event;
      props?.onKeydown?.(event);
      // Skip if not measuring
      if (!mergedMeasuring.value) {
        return;
      }
      switch (which) {
        case KeyCode.DOWN:
        case KeyCode.UP: {
          const optionLen = mergedOptions.value.length;
          if (optionLen === 0) {
            event.preventDefault();
            return;
          }
          const offset = which === KeyCode.UP ? -1 : 1;
          const nextIndex = getEnabledActiveIndex(
            activeIndex.value + offset,
            offset,
          );
          if (nextIndex !== -1) {
            activeIndex.value = nextIndex;
          }
          event.preventDefault();

          break;
        }
        case KeyCode.ENTER: {
          // Measure hit
          event.preventDefault();
          // loading skip
          if (props?.silent) {
            return;
          }

          if (mergedOptions.value.length === 0) {
            stopMeasure();
            return;
          }

          let currentIndex = activeIndex.value;
          let option = mergedOptions.value[currentIndex];
          if (!option || option.disabled) {
            currentIndex = getEnabledActiveIndex(0);
            if (currentIndex === -1) {
              stopMeasure();
              return;
            }
            activeIndex.value = currentIndex;
            option = mergedOptions.value[currentIndex];
          }
          selectOption(option);

          break;
        }
        case KeyCode.ESC: {
          stopMeasure();

          break;
        }
        // No default
      }
    };

    /**
     * When to start measure:
     * 1. When user press `prefix`
     * 2. When measureText !== prevMeasureText
     *  - If measure hit
     *  - If measuring
     *
     * When to stop measure:
     * 1. Selection is out of range
     * 2. Contains `space`
     * 3. ESC or select one
     */
    const onInternalKeyUp = (event: any) => {
      const { key, which } = event;
      const target = event.target as HTMLTextAreaElement;
      const selectionStartText = getBeforeSelectionText(target);
      const { location: measureIndex, prefix: nextMeasurePrefix } =
        getLastMeasureIndex(selectionStartText, mergedPrefix.value as string[]);

      // If the client implements an onKeyUp handler, call it
      props?.onKeyup?.(event);
      // Skip if match the white key list
      if (
        [KeyCode.DOWN, KeyCode.ENTER, KeyCode.ESC, KeyCode.UP].includes(which)
      ) {
        return;
      }
      if (measureIndex !== -1) {
        const nextMeasureText = selectionStartText.slice(
          measureIndex + nextMeasurePrefix.length,
        );
        const validateSearchFn =
          typeof props.validateSearch === 'function'
            ? props.validateSearch
            : defaultValidateSearch;
        const validateMeasure: boolean = validateSearchFn(
          nextMeasureText,
          props.split!,
        );
        const matchOption = getOptions(nextMeasureText).length > 0;

        if (validateMeasure) {
          // adding AltGraph also fort azert keyboard
          if (
            key === nextMeasurePrefix ||
            key === 'Shift' ||
            which === KeyCode.ALT ||
            key === 'AltGraph' ||
            mergedMeasuring.value ||
            (nextMeasureText !== mergedMeasureText.value && matchOption)
          ) {
            startMeasure(nextMeasureText, nextMeasurePrefix, measureIndex);
          }
        } else if (mergedMeasuring.value) {
          // Stop if measureText is invalidate
          stopMeasure();
        }
        /**
         * We will trigger `onSearch` to developer since they may use for async update.
         * If met `space` means user finished searching.
         */
        const onSearch = props?.onSearch;
        if (onSearch && validateMeasure) {
          onSearch(nextMeasureText, nextMeasurePrefix);
        }
      } else if (mergedMeasuring.value) {
        stopMeasure();
      }
    };

    const onInternalPressEnter = (event: any) => {
      const onPressEnter = props?.onPressEnter;
      if (!mergedMeasuring.value && onPressEnter) {
        onPressEnter(event);
      }
    };
    // ============================ Focus Blur ============================
    const focusRef = shallowRef<number>();
    const onInternalFocus = (event?: FocusEvent) => {
      window.clearTimeout(focusRef.value);
      const onFocus = props?.onFocus;
      if (!isFocus.value && event && onFocus) {
        onFocus(event);
      }
      isFocus.value = true;
    };

    const onInternalBlur = (event?: any) => {
      focusRef.value = window.setTimeout(() => {
        isFocus.value = false;
        stopMeasure();
        props?.onBlur?.(event);
      }, 0);
    };

    const onDropdownFocus = () => {
      onInternalFocus();
    };

    const onDropdownBlur = () => {
      onInternalBlur();
    };

    // ============================== Scroll ===============================
    const onInternalPopupScroll = (event: UIEvent) => {
      props?.onPopupScroll?.(event);
    };
    return () => {
      const {
        classNames: mentionClassNames,
        styles,
        rows = 1,
        prefixCls,
        notFoundContent,
      } = props;
      const restProps = omit(props, omitKeys as any);

      const { className, restAttrs, style } = getAttrStyleAndClass(attrs);
      // ============================== Styles ==============================
      const resizeStyle = styles?.textarea?.resize ?? style?.resize;
      const mergedTextareaStyle = {
        ...styles?.textarea,
      };
      // Only add resize if it has a valid value, avoid setting undefined
      if (resizeStyle !== undefined) {
        mergedTextareaStyle.resize = resizeStyle;
      }
      const mergedStyles = {
        ...styles,
        textarea: mergedTextareaStyle,
      };

      // ============================== Render ==============================
      const mentionNode = (
        <>
          <TextArea
            classNames={
              {
                textarea: mentionClassNames?.textarea,
              } as any
            }
            ref={textareaRef as any}
            /**
             * Example:<Mentions style={{ resize: 'none' }} />.
             * If written this way, resizing here will become invalid.
             * The TextArea component code and found that the resize parameter in the style of the ResizeTextArea component is obtained from prop.style.
             * Just pass the resize attribute and leave everything else unchanged.
             */
            styles={mergedStyles}
            value={mergedValue.value}
            {...restAttrs}
            {...restProps}
            {...{
              rows,
            }}
            onBlur={onInternalBlur}
            onChange={onInternalChange}
            onFocus={onInternalFocus}
            onKeydown={onInternalKeyDown}
            onKeyup={onInternalKeyUp}
            onPressEnter={onInternalPressEnter}
          />
          {mergedMeasuring.value && (
            <div class={`${prefixCls}-measure`} ref={measureRef}>
              {mergedValue.value.slice(0, mergedMeasureLocation.value)}
              <MentionsProvider
                value={{
                  notFoundContent,
                  activeIndex: activeIndex.value,
                  setActiveIndex,
                  selectOption,
                  onFocus: onDropdownFocus,
                  onBlur: onDropdownBlur,
                  onScroll: onInternalPopupScroll,
                }}
              >
                <KeywordTrigger
                  direction={props.direction}
                  getPopupContainer={props.getPopupContainer}
                  options={mergedOptions.value}
                  placement={props.placement}
                  popupClassName={clsx(
                    props.popupClassName,
                    mentionClassNames?.popup,
                  )}
                  popupRender={props.popupRender}
                  popupStyle={styles?.popup}
                  prefixCls={prefixCls}
                  transitionName={props.transitionName}
                  visible
                >
                  <span>{mergedMeasurePrefix.value}</span>
                </KeywordTrigger>
              </MentionsProvider>
              {mergedValue.value.slice(
                mergedMeasureLocation.value + mergedMeasurePrefix.value.length,
              )}
            </div>
          )}
        </>
      );
      if (!props.hasWrapper) {
        return (
          <div
            class={clsx(prefixCls, props.className, className)}
            ref={containerRef}
            style={style}
          >
            {mentionNode}
          </div>
        );
      }
      return mentionNode;
    };
  },
  {
    name: 'VMentions',
    inheritAttrs: false,
  },
);

const Mentions = defineComponent<MentionsProps>(
  (props, { expose, attrs }) => {
    const hasSuffix = computed(() => !!(props.suffix || props.allowClear));

    const holderRef = shallowRef<any>();
    const mentionRef = shallowRef<MentionsRef>();

    const mergedValue = shallowRef(props?.value ?? props?.defaultValue ?? '');
    watch(
      () => props.value,
      () => {
        mergedValue.value = props.value ?? '';
      },
    );
    const setMergedValue = (value: string) => {
      mergedValue.value = value;
    };

    const triggerChange = (nextValue: string) => {
      setMergedValue(nextValue);
      props?.onChange?.(nextValue);
    };

    const handleReset = () => {
      triggerChange('');
    };

    expose({
      focus: () => mentionRef.value?.focus?.(),
      blur: () => mentionRef.value?.blur?.(),
      textarea: computed(() => mentionRef.value?.textarea || null),
      nativeElement: computed(
        () => holderRef.value?.nativeElement || mentionRef.value?.nativeElement,
      ),
    });

    return () => {
      const {
        suffix,
        prefixCls = 'headless-mentions',
        allowClear,
        classNames: mentionsClassNames,
        styles,
        className: propsClassName,
        disabled,
        onClear,
        id,
        value: _value,
        defaultValue: _defaultValue,
        onChange: _onChange,
        ...rest
      } = props;

      const { className, style } = getAttrStyleAndClass(attrs);
      const internalClassName = clsx(
        mentionsClassNames?.mentions,
        propsClassName,
      );

      const internalProps = {
        ...attrs,
        ...rest,
        id,
        value: mergedValue.value,
        prefixCls,
        className: internalClassName,
        classNames: mentionsClassNames,
        styles,
        disabled,
        hasWrapper: hasSuffix.value,
        onChange: triggerChange,
      };
      return (
        <BaseInput
          allowClear={allowClear}
          class={clsx(prefixCls, propsClassName, className, {
            [`${prefixCls}-has-suffix`]: hasSuffix.value,
          })}
          classNames={mentionsClassNames}
          disabled={disabled}
          handleReset={handleReset}
          onClear={onClear}
          prefixCls={prefixCls}
          ref={holderRef as any}
          style={style}
          styles={styles as any}
          suffix={suffix}
          value={mergedValue.value}
        >
          <InternalMentions ref={mentionRef as any} {...internalProps} />
        </BaseInput>
      );
    };
  },
  {
    name: 'Mentions',
    inheritAttrs: false,
  },
);

export default Mentions;
