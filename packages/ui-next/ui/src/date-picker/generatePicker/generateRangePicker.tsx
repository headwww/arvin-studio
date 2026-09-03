import type { SlotsType } from 'vue';

import type {
  PickerGenerateConfig as GenerateConfig,
  PickerMode,
  PickerRef,
} from '@arvin-studio/headless';

import type { AnyObject, VueNode } from '../../_util';
import type { RangePickerProps } from './interface';

import { computed, defineComponent, shallowRef } from 'vue';

import { getTransitionName, RangePicker } from '@arvin-studio/headless';
import { SwapRightOutlined } from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import { ContextIsolator } from '../../_util/ContextIsolator';
import { getAttrStyleAndClass, useZIndex } from '../../_util/hooks';
import { getMergedStatus, getStatusClassNames } from '../../_util/statusUtils';
import { getSlotPropsFnRun, toPropsRefs } from '../../_util/tools';
import { devUseWarning, isDev } from '../../_util/warning';
import { useComponentBaseConfig } from '../../config-provider/context';
import { useDisabledContext } from '../../config-provider/disabled-context';
import useCSSVarCls from '../../config-provider/hooks/useCSSVarCls';
import { useSize } from '../../config-provider/hooks/useSize';
import { useFormItemInputContext } from '../../form/context';
import { useVariants } from '../../form/hooks/useVariant';
import useLocale from '../../locale/useLocale';
import { useCompactItemContext } from '../../space/Compact';
import useMergedPickerSemantic from '../hooks/useMergedPickerSemantic';
import enUS from '../locale/en_US';
import useStyle from '../style';
import { getRangePlaceholder, useIcons } from '../util';
import { TIME } from './constant';
import SuffixIcon from './SuffixIcon';
import useComponents from './useComponents';

export interface RangePickerEmits<DateType = AnyObject> {
  blur: (e: FocusEvent, info: any) => void;
  calendarChange: (
    dates: DateType[],
    dateStrings: [string, string],
    info: any,
  ) => void;
  change: (dates: DateType[] | null, dateStrings: [string, string]) => void;
  clear: () => void;
  focus: (e: FocusEvent, info: any) => void;
  keydown: (e: KeyboardEvent, preventDefault: VoidFunction) => void;
  ok: (dates: DateType[]) => void;
  openChange: (open: boolean) => void;
  panelChange: (dates: DateType[], modes: [PickerMode, PickerMode]) => void;
  'update:value': (dates: DateType[] | null) => void;
}

export interface RangePickerSlots {
  [key: string]: any;
  cellRender?: (ctx: { current: AnyObject; info: any }) => any;
  dateRender?: (ctx: { date: AnyObject; today: AnyObject }) => any;
  inputRender?: (props: Record<string, any>) => any;
  monthCellRender?: (ctx: { date: AnyObject; locale: any }) => any;
  panelRender?: (originPanel: VueNode) => any;
  renderExtraFooter?: (mode: PickerMode) => any;
  suffixIcon?: () => any;
}

export interface RangePickerEmitsProps<DateType = AnyObject> {
  onBlur?: RangePickerEmits<DateType>['blur'];
  onCalendarChange?: RangePickerEmits<DateType>['calendarChange'];
  onChange?: RangePickerEmits<DateType>['change'];
  onClear?: RangePickerEmits<DateType>['clear'];
  onFocus?: RangePickerEmits<DateType>['focus'];
  onKeydown?: RangePickerEmits<DateType>['keydown'];
  onOk?: RangePickerEmits<DateType>['ok'];
  onOpenChange?: RangePickerEmits<DateType>['openChange'];
  onPanelChange?: RangePickerEmits<DateType>['panelChange'];
  'onUpdate:value'?: RangePickerEmits<DateType>['update:value'];
}

export interface InternalRangePickerProps<
  DateType extends AnyObject = AnyObject,
> /* @vue-ignore */
  extends
    Omit<RangePickerEmitsProps<DateType>, keyof RangePickerProps<DateType>>,
    RangePickerProps<DateType> {}

function generateRangePicker<DateType extends AnyObject = AnyObject>(
  generateConfig: GenerateConfig<DateType>,
) {
  type DateRangePickerProps = RangePickerProps<DateType>;

  const RangePickerComponent = defineComponent<
    InternalRangePickerProps<DateType>,
    RangePickerEmits<DateType>,
    string,
    SlotsType<RangePickerSlots>
  >(
    (props, { slots, attrs, emit, expose }) => {
      const {
        size: customizeSize,
        disabled: customDisabled,
        status: customStatus,
        variant: customVariant,
        classes,
        styles,
        rootClass,
        bordered,
      } = toPropsRefs(
        props,
        'size',
        'disabled',
        'status',
        'variant',
        'classes',
        'styles',
        'rootClass',
        'bordered',
        'separator',
      );

      const pickerType = computed(() =>
        props.picker === TIME ? 'timePicker' : 'datePicker',
      );

      const {
        prefixCls,
        direction,
        getPopupContainer,
        rootPrefixCls,
        class: contextClassName,
        style: contextStyle,
        separator: contextSeparator,
      } = useComponentBaseConfig(
        'rangePicker' as any,
        props as any,
        ['separator'],
        'picker',
      );

      const { compactSize, compactItemClassnames } = useCompactItemContext(
        prefixCls,
        direction,
      );
      const mergedSize = useSize(
        (ctx) => customizeSize.value ?? compactSize.value ?? ctx,
      );

      const disabled = useDisabledContext();
      const mergedDisabled = computed(
        () => customDisabled.value ?? disabled.value,
      );

      const mergedProps = computed(
        () =>
          ({
            ...props,
            size: mergedSize.value,
            disabled: mergedDisabled.value,
            status: customStatus.value,
            variant: customVariant.value,
          }) as DateRangePickerProps,
      );

      const popupClassName = computed(
        () => props.popupClassName || props.dropdownClassName,
      );
      const popupStyle = computed(() => props.popupStyle);

      const [mergedClassNames, mergedStyles] =
        useMergedPickerSemantic<DateRangePickerProps>(
          pickerType.value as any,
          classes as any,
          styles as any,
          popupClassName,
          popupStyle,
          mergedProps,
        );

      const innerRef = shallowRef<PickerRef>();

      const [variant, enableVariasCls] = useVariants(
        'rangePicker',
        customVariant,
        bordered,
      );

      const rootCls = useCSSVarCls(prefixCls);
      const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

      const mergedRootClassName = computed(() =>
        clsx(hashId.value, cssVarCls.value, rootCls.value, rootClass.value),
      );

      const [contextLocale] = useLocale('Calendar', enUS);
      const locale = computed(() => ({
        ...contextLocale?.value,
        ...props.locale,
      }));

      const [zIndex] = useZIndex(
        'DatePicker',
        computed(() => mergedStyles.value?.popup?.root?.zIndex as number),
      );

      const triggerChange = (
        dates: DateType[] | null,
        dateStrings: [string, string],
      ) => {
        emit('update:value', dates);
        emit('change', dates, dateStrings);
      };

      const handleCalendarChange = (
        dates: DateType[],
        dateStrings: [string, string],
        info: any,
      ) => {
        emit('calendarChange', dates, dateStrings, info);
      };

      const handlePanelChange = (
        values: DateType[],
        modes: [PickerMode, PickerMode],
      ) => {
        emit('panelChange', values, modes);
      };

      const handleOpenChange = (open: boolean) => {
        emit('openChange', open);
      };

      const handleOk = (values: DateType[]) => {
        emit('ok', values);
      };

      const handleClear = () => {
        emit('clear');
      };

      const handleFocus = (e: FocusEvent, info: any) => {
        emit('focus', e, info);
      };

      const handleBlur = (e: FocusEvent, info: any) => {
        emit('blur', e, info);
      };

      const handleKeyDown = (
        e: KeyboardEvent,
        preventDefault: VoidFunction,
      ) => {
        emit('keydown', e, preventDefault);
      };

      const resolveRender = (
        key: keyof RangePickerSlots,
        args: any[],
        slotParams: any,
      ) => {
        const slot = (slots as any)?.[key];
        if (slot) {
          return slot(slotParams);
        }
        const propValue = (props as any)[key];
        if (typeof propValue === 'function') {
          return propValue(...args);
        }
        return propValue;
      };

      if (isDev) {
        const warning = devUseWarning('DatePicker.RangePicker');
        const deprecatedProps = {
          dropdownClassName: 'classes.popup.root',
          popupClassName: 'classes.popup.root',
          popupStyle: 'styles.popup.root',
          bordered: 'variant',
        };
        Object.entries(deprecatedProps).forEach(([oldProp, newProp]) => {
          warning.deprecated(!(props as any)[oldProp], oldProp, newProp);
        });
      }

      expose({
        focus: (options?: FocusOptions) =>
          innerRef.value?.focus?.(options as any),
        blur: () => innerRef.value?.blur?.(),
        nativeElement: computed(() => innerRef.value?.nativeElement),
      });

      return () => {
        const {
          placeholder,
          components,
          placement,
          suffixIcon,
          allowClear,
          popupClassName: _popupClassName,
          dropdownClassName: _dropdownClassName,
          popupStyle: _popupStyle,
          rootClass: _rootClass,
          classes: _classes,
          styles: _styles,
          status: _status,
          variant: _variant,
          bordered: _bordered,
          size: _size,
          disabled: _disabled,
          locale: _locale,
          getPopupContainer: _getPopupContainer,
          ...restProps
        } = props as DateRangePickerProps;

        const { className, style, restAttrs } = getAttrStyleAndClass(
          attrs,
          undefined,
          props,
        );

        const mergedSuffixIcon = getSlotPropsFnRun(
          slots,
          { suffixIcon },
          'suffixIcon',
          false,
        );

        const [mergedAllowClear] = useIcons({ allowClear }, prefixCls.value);

        const mergedComponents = useComponents(components as any);

        const formItemContext = useFormItemInputContext();
        const {
          hasFeedback,
          status: contextStatus,
          feedbackIcon,
        } = formItemContext.value;

        const mergedStatus = getMergedStatus(contextStatus, customStatus.value);

        const suffixNode = (
          <SuffixIcon
            {...{
              picker: props.picker,
              hasFeedback,
              feedbackIcon,
              suffixIcon: mergedSuffixIcon,
            }}
          />
        );

        const mergedClassName = clsx(
          {
            [`${prefixCls.value}-${mergedSize.value}`]: mergedSize.value,
            [`${prefixCls.value}-${variant.value}`]: enableVariasCls.value,
          },
          getStatusClassNames(prefixCls.value, mergedStatus, hasFeedback),
          compactItemClassnames.value,
          contextClassName?.value,
          className,
        );

        const mergedStyle = {
          ...contextStyle?.value,
          ...style,
        };

        const cellRender =
          slots.cellRender || (props as any).cellRender
            ? (current: AnyObject, info: any) =>
                resolveRender('cellRender', [current, info], { current, info })
            : undefined;

        const dateRender =
          slots.dateRender || (props as any).dateRender
            ? (date: AnyObject, today: AnyObject) =>
                resolveRender('dateRender', [date, today], { date, today })
            : undefined;

        const monthCellRender =
          slots.monthCellRender || (props as any).monthCellRender
            ? (date: AnyObject, localeInfo: any) =>
                resolveRender('monthCellRender', [date, localeInfo], {
                  date,
                  locale: localeInfo,
                })
            : undefined;

        const renderExtraFooter =
          slots.renderExtraFooter || (props as any).renderExtraFooter
            ? (mode: PickerMode) =>
                resolveRender('renderExtraFooter', [mode], mode)
            : undefined;

        const panelRender =
          slots.panelRender || (props as any).panelRender
            ? (panel: VueNode) => resolveRender('panelRender', [panel], panel)
            : undefined;

        const inputRender =
          slots.inputRender || (props as any).inputRender
            ? (inputProps: Record<string, any>) =>
                resolveRender('inputRender', [inputProps], inputProps)
            : undefined;
        const _contextSeparator = getSlotPropsFnRun(
          {},
          {
            separator: contextSeparator?.value,
          },
          'separator',
          false,
        );
        const separator =
          getSlotPropsFnRun(slots, props, 'separator', false) ||
          _contextSeparator;
        const mergedSeparator = separator ?? _contextSeparator;

        return (
          <ContextIsolator space>
            <RangePicker
              {...restAttrs}
              {...restProps}
              allowClear={mergedAllowClear as any}
              cellRender={cellRender}
              className={mergedClassName}
              // Semantic Style
              classNames={mergedClassNames.value}
              components={mergedComponents as any}
              dateRender={dateRender}
              direction={direction.value}
              disabled={mergedDisabled.value}
              generateConfig={generateConfig}
              getPopupContainer={props.getPopupContainer || getPopupContainer}
              inputRender={inputRender}
              locale={locale.value?.lang}
              monthCellRender={monthCellRender}
              nextIcon={<span class={`${prefixCls.value}-next-icon`} />}
              onBlur={handleBlur}
              onCalendarChange={handleCalendarChange}
              onChange={triggerChange}
              onClear={handleClear}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              onOk={handleOk}
              onOpenChange={handleOpenChange}
              onPanelChange={handlePanelChange as any}
              panelRender={panelRender as any}
              picker={props.picker}
              placeholder={getRangePlaceholder(
                locale.value,
                props.picker,
                placeholder,
              )}
              placement={placement}
              // Style
              prefixCls={prefixCls.value}
              prevIcon={<span class={`${prefixCls.value}-prev-icon`} />}
              ref={innerRef as any}
              renderExtraFooter={renderExtraFooter as any}
              rootClassName={mergedRootClassName.value}
              separator={
                <span aria-label="to" class={`${prefixCls.value}-separator`}>
                  {mergedSeparator ?? <SwapRightOutlined />}
                </span>
              }
              style={mergedStyle}
              styles={{
                ...mergedStyles.value,
                popup: {
                  ...mergedStyles.value.popup,
                  root: {
                    ...mergedStyles.value.popup?.root,
                    zIndex: zIndex.value,
                  },
                },
              }}
              suffixIcon={suffixNode}
              superNextIcon={
                <span class={`${prefixCls.value}-super-next-icon`} />
              }
              superPrevIcon={
                <span class={`${prefixCls.value}-super-prev-icon`} />
              }
              transitionName={getTransitionName(
                rootPrefixCls.value,
                'slide-up',
              )}
            />
          </ContextIsolator>
        );
      };
    },
    {
      name: 'AsRangePicker',
      inheritAttrs: false,
    },
  );

  return RangePickerComponent;
}

export default generateRangePicker;
