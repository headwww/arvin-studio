import type { CSSProperties } from 'vue';

import type { ChangeEvent, VueNode } from '../util';

import { computed, defineComponent, ref, shallowRef, watch } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import MotionThumb from './MotionThumb';

export type SemanticName = 'item' | 'label';
export type SegmentedValue = number | string;

export type SegmentedRawOption = SegmentedValue;

export interface SegmentedLabeledOption<ValueType = SegmentedRawOption> {
  class?: string;
  disabled?: boolean;
  label: VueNode;
  /**
   * html `title` property for label
   */
  title?: string;
  value: ValueType;
}

type ItemRender = (
  node: VueNode,
  info: { item: SegmentedLabeledOption },
) => VueNode;

type SegmentedOptions<T = SegmentedRawOption> = (
  | SegmentedLabeledOption<T>
  | T
)[];

export interface SegmentedProps {
  classNames?: Partial<Record<SemanticName, string>>;
  defaultValue?: SegmentedValue;
  direction?: 'ltr' | 'rtl';
  disabled?: boolean;
  itemRender?: ItemRender;
  motionName?: string;
  name?: string;
  onChange?: (value: SegmentedValue) => void;
  options: SegmentedOptions;
  prefixCls?: string;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  value?: SegmentedValue;
  vertical?: boolean;
}

function getValidTitle(option: SegmentedLabeledOption) {
  if (option.title !== undefined) {
    return option.title;
  }

  // read `label` when title is `undefined`
  if (typeof option.label !== 'object') {
    return option.label?.toString();
  }
}

function normalizeOptions(options: SegmentedOptions): SegmentedLabeledOption[] {
  return options.map((option) => {
    if (typeof option === 'object' && option !== null) {
      const validTitle = getValidTitle(option);
      return {
        ...option,
        title: validTitle,
      };
    }
    return {
      label: option?.toString(),
      title: option?.toString(),
      value: option,
    };
  });
}

const InternalSegmentedOption = defineComponent<{
  checked: boolean;
  classNames?: Partial<Record<SemanticName, string>>;
  data: SegmentedLabeledOption;
  disabled?: boolean;
  itemRender?: ItemRender;
  label: VueNode;
  name?: string;
  onBlur: (e: FocusEvent) => void;
  onChange: (e: ChangeEvent, value: SegmentedRawOption) => void;
  onFocus: (e: FocusEvent) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onKeyUp: (e: KeyboardEvent) => void;
  onMouseDown: () => void;
  prefixCls: string;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  title?: string;
  value: SegmentedRawOption;
}>(
  // @ts-expect-error this
  (props, { attrs }) => {
    const handleChange = (event: Event) => {
      if (props.disabled) {
        return;
      }
      props?.onChange?.(event as any, props.value);
    };
    return () => {
      const {
        prefixCls,
        disabled,
        onMouseDown,
        onKeyDown,
        onKeyUp,
        onBlur,
        onFocus,
        name,
        checked,
        classNames: segmentedClassNames,
        styles,
        label,
        title,
        data,
        itemRender,
      } = props;
      const itemContent = (
        <label
          class={clsx((attrs as any).class, {
            [`${prefixCls}-item-disabled`]: disabled,
          })}
          onMousedown={onMouseDown}
          style={(attrs as any).style}
        >
          <input
            checked={checked}
            class={`${prefixCls}-item-input`}
            disabled={disabled}
            name={name}
            onBlur={onBlur}
            onChange={handleChange}
            onFocus={onFocus}
            onKeydown={onKeyDown}
            onKeyup={onKeyUp}
            type="radio"
          />
          <div
            class={clsx(`${prefixCls}-item-label`, segmentedClassNames?.label)}
            style={styles?.label}
            title={title}
          >
            {typeof label === 'function' ? (label as any)?.() : label}
          </div>
        </label>
      );
      return itemRender?.(itemContent, { item: data });
    };
  },
);

const defaults = {
  prefixCls: 'headless-segmented',
  options: [],
  motionName: 'thumb-motion',
  itemRender: (node: VueNode) => node,
} as any;
export const Segmented = defineComponent<SegmentedProps>(
  (props = defaults, { attrs }) => {
    const containerRef = ref<HTMLDivElement>();
    const segmentedOptions = computed(() => {
      return normalizeOptions(props?.options ?? []);
    });

    // Note: We should not auto switch value when value not exist in options
    // which may break single source of truth.
    const rawValue = shallowRef(
      props?.value ?? props?.defaultValue ?? segmentedOptions.value[0]?.value,
    );
    watch(
      () => props.value,
      () => {
        rawValue.value = props.value as any;
      },
    );
    // ======================= Change ========================
    const thumbShow = shallowRef(false);
    const handleChange = (_event: ChangeEvent, val: SegmentedRawOption) => {
      rawValue.value = val;
      props?.onChange?.(val);
    };

    // ======================= Focus ========================

    const isKeyboard = shallowRef(false);
    const isFocused = shallowRef(true);
    const handleFocus = () => {
      isFocused.value = true;
    };
    const handleBlur = () => {
      isFocused.value = false;
    };
    const handleMouseDown = () => {
      isKeyboard.value = false;
    };
    // capture keyboard tab interaction for correct focus style
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        isKeyboard.value = true;
      }
    };
    // ======================= Keyboard ========================
    const onOffset = (offset: number) => {
      const validOptions = segmentedOptions.value.filter(
        (option) => option.value === rawValue.value || !option.disabled,
      );

      const currentIndex = validOptions.findIndex(
        (option) => option?.value === rawValue.value,
      );

      const total = validOptions.length;
      const nextIndex = (currentIndex + offset + total) % total;
      const nextOption = validOptions[nextIndex];
      if (nextOption && nextOption.value !== rawValue.value) {
        rawValue.value = nextOption.value;
        props?.onChange?.(nextOption.value);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight': {
          onOffset(1);
          break;
        }
        case 'ArrowLeft':
        case 'ArrowUp': {
          onOffset(-1);
          break;
        }
      }
    };
    return () => {
      const {
        itemRender,
        prefixCls,
        classNames: segmentedClassNames,
        styles,
        disabled,
        name,
        direction,
        vertical,
        motionName,
      } = props;
      const renderOption = (segmentedOption: SegmentedLabeledOption) => {
        const { value: optionValue, disabled: optionDisabled } =
          segmentedOption;
        return (
          <InternalSegmentedOption
            {...segmentedOption}
            checked={optionValue === rawValue.value}
            class={clsx(
              segmentedOption.class,
              `${prefixCls}-item`,
              segmentedClassNames?.item,
              {
                [`${prefixCls}-item-selected`]:
                  optionValue === rawValue.value && !thumbShow.value,
                [`${prefixCls}-item-focused`]:
                  isFocused.value &&
                  isKeyboard.value &&
                  optionValue === rawValue.value,
              },
            )}
            classNames={segmentedClassNames}
            data={segmentedOption}
            disabled={!!disabled || !!optionDisabled}
            itemRender={itemRender}
            key={optionValue}
            name={name}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onMouseDown={handleMouseDown}
            prefixCls={prefixCls!}
            style={styles?.item}
            styles={styles}
          />
        );
      };
      const divProps = omit(attrs, ['class', 'style']);
      const attrClass = (attrs as any).class;
      const attrStyle = (attrs as any).style;

      return (
        <div
          aria-label="segmented control"
          aria-orientation={vertical ? 'vertical' : 'horizontal'}
          role="radiogroup"
          style={attrStyle}
          tabindex={disabled ? undefined : 0}
          {...divProps}
          class={clsx(
            prefixCls,
            {
              [`${prefixCls}-rtl`]: direction === 'rtl',
              [`${prefixCls}-disabled`]: disabled,
              [`${prefixCls}-vertical`]: vertical,
            },
            attrClass,
          )}
          ref={containerRef}
        >
          <div class={`${prefixCls}-group`}>
            <MotionThumb
              containerRef={containerRef.value!}
              direction={direction}
              getValueIndex={(val) =>
                segmentedOptions.value.findIndex((n) => n.value === val)
              }
              motionName={`${prefixCls}-${motionName}`}
              onMotionEnd={() => {
                thumbShow.value = false;
              }}
              onMotionStart={() => {
                thumbShow.value = true;
              }}
              prefixCls={prefixCls!}
              value={rawValue.value as any}
              vertical={vertical}
            />
            {segmentedOptions.value.map(renderOption)}
          </div>
        </div>
      );
    };
  },
  {
    name: 'Segmented',
  },
);
