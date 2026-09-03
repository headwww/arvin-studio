import type { App, SlotsType } from 'vue';

import type { PopoverProps } from '../popover';
import type {
  ColorFormatType,
  ColorPickerEmits,
  ColorPickerProps,
  ColorPickerSlots,
  ModeType,
  TriggerPlacement,
} from './interface';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { ContextIsolator } from '../_util/ContextIsolator';
import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../_util/hooks';
import genPurePanel from '../_util/PurePanel';
import { getStatusClassNames } from '../_util/statusUtils';
import { toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useSize } from '../config-provider/hooks/useSize';
import { useFormItemInputContext } from '../form/context';
import Popover from '../popover';
import { useCompactItemContext } from '../space/Compact';
import useMergedArrow from '../tooltip/hooks/useMergedArrow';
import { AggregationColor } from './color';
import ColorPickerPanel from './ColorPickerPanel';
import ColorTrigger from './components/ColorTrigger';
import useModeColor from './hooks/useModeColor';
import useStyle from './style';
import {
  formatColorValue,
  genAlphaColor,
  generateColor,
  getColorAlpha,
} from './util';

const defaults = {
  trigger: 'click',
  placement: 'bottomLeft',
  autoAdjustOverflow: true,
  disabledAlpha: false,
  allowClear: false,
  destroyOnHidden: false,
} as any;

export interface InternalColorPickerProps /* @vue-ignore */
  extends ColorPickerEmitsProps, ColorPickerProps {}

export interface ColorPickerEmitsProps {
  onChange?: ColorPickerEmits['change'];
  onChangeComplete?: ColorPickerEmits['changeComplete'];
  onClear?: ColorPickerEmits['clear'];
  onFormatChange?: ColorPickerEmits['formatChange'];
  onOpenChange?: ColorPickerEmits['openChange'];
  'onUpdate:format'?: ColorPickerEmits['update:format'];
  'onUpdate:open'?: ColorPickerEmits['update:open'];
  'onUpdate:value'?: ColorPickerEmits['update:value'];
}

const ColorPicker = defineComponent<
  InternalColorPickerProps,
  ColorPickerEmits,
  string,
  SlotsType<ColorPickerSlots>
>(
  (props = defaults, { slots, expose, emit, attrs }) => {
    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      arrow: contextArrow,
    } = useComponentBaseConfig('colorPicker', props, ['arrow'], 'color-picker');

    const {
      size: customizeSize,
      classes,
      styles,
      value,
      mode,
      format,
      valueFormat,
      open,
      presets,
      disabledAlpha,
      disabledFormat,
      arrow,
    } = toPropsRefs(
      props,
      'size',
      'classes',
      'styles',
      'value',
      'mode',
      'format',
      'valueFormat',
      'open',
      'presets',
      'disabledAlpha',
      'disabledFormat',
      'arrow',
    );
    const contextDisabled = useDisabledContext();
    const mergedDisabled = computed(
      () => props.disabled ?? contextDisabled.value,
    );

    // ================== Size ==================
    const { compactSize, compactItemClassnames } = useCompactItemContext(
      prefixCls,
      direction,
    );
    const mergedSize = useSize(
      (ctx) => customizeSize.value ?? compactSize.value ?? ctx,
    );
    const mergedArrow = useMergedArrow(arrow, contextArrow);

    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => {
      return {
        ...props,
        trigger: props.trigger ?? 'click',
        allowClear: props.allowClear ?? false,
        autoAdjustOverflow: props.autoAdjustOverflow ?? true,
        disabledAlpha: props.disabledAlpha ?? false,
        arrow: mergedArrow.value,
        placement: props.placement ?? 'bottomLeft',
        disabled: mergedDisabled.value,
        size: mergedSize.value,
      } as ColorPickerProps;
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      NonNullable<ColorPickerProps['classes']>,
      NonNullable<ColorPickerProps['styles']>,
      ColorPickerProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
      computed(() => ({
        popup: {
          _default: 'root',
        },
      })),
    );

    const internalPopupOpen = shallowRef(open.value ?? false);
    watch(open, (val) => {
      internalPopupOpen.value = val ?? false;
    });

    const popupOpen = computed(
      () => !mergedDisabled.value && internalPopupOpen.value,
    );
    const formatValue = shallowRef<ColorFormatType | undefined>(
      format.value ?? props.defaultFormat,
    );
    watch(format, (val) => {
      if (val !== undefined) formatValue.value = val;
    });

    const triggerFormatChange = (newFormat?: ColorFormatType) => {
      const prev = formatValue.value;
      formatValue.value = newFormat;
      if (prev !== newFormat) {
        emit('formatChange', newFormat);
        emit('update:format', newFormat!);
      }
    };

    const triggerOpenChange = (visible: boolean) => {
      if (open.value !== undefined) {
        emit('openChange', visible);
        emit('update:open', visible);
        return;
      }
      if (!visible || !mergedDisabled.value) {
        internalPopupOpen.value = visible;
        emit('openChange', visible);
        emit('update:open', visible);
      }
    };

    // ================== Value & Mode =================
    const [mergedColor, setColor, modeState, setModeState, modeOptions] =
      useModeColor(value as any, mode, props?.defaultValue);

    const isAlphaColor = computed(() => getColorAlpha(mergedColor.value) < 100);

    // ==================== Change =====================
    const cachedGradientColor = shallowRef<AggregationColor>();

    const onInternalChangeComplete = (color: AggregationColor) => {
      let changeColor = generateColor(color);
      if (props?.disabledAlpha && isAlphaColor.value) {
        changeColor = genAlphaColor(color);
      }
      emit('changeComplete', changeColor);
    };

    const onInternalChange = (
      data?: AggregationColor,
      changeFromPickerDrag?: boolean,
    ) => {
      let color: AggregationColor = generateColor(data!);
      if (props?.disabledAlpha && isAlphaColor.value) {
        color = genAlphaColor(color);
      }

      setColor(color);
      cachedGradientColor.value = undefined;

      emit('change', color, color.toCssString());
      emit('update:value', formatColorValue(color, valueFormat.value));

      if (!changeFromPickerDrag) {
        onInternalChangeComplete(color);
      }
    };

    const activeIndex = shallowRef(0);
    const gradientDragging = shallowRef(false);

    const onInternalModeChange = (newMode: ModeType) => {
      const _mergedColor = mergedColor.value;
      setModeState(newMode);
      if (newMode === 'single' && mergedColor.value?.isGradient()) {
        activeIndex.value = 0;
        onInternalChange(
          new AggregationColor(mergedColor.value.getColors()[0]!.color!),
        );
        cachedGradientColor.value = _mergedColor;
      } else if (newMode === 'gradient' && !mergedColor.value?.isGradient()) {
        const baseColor = isAlphaColor.value
          ? genAlphaColor(mergedColor.value)
          : mergedColor.value;
        onInternalChange(
          new AggregationColor(
            cachedGradientColor.value || [
              { percent: 0, color: baseColor },
              { percent: 100, color: baseColor },
            ],
          ),
        );
      }
    };

    // ================== Form Status ==================
    const formItemInputContext = useFormItemInputContext();
    const contextStatus = computed(() => formItemInputContext.value?.status);

    // ===================== Style =====================
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const handleClear = () => {
      const cleared = new AggregationColor('');
      setColor(cleared);
      emit('clear');
      emit('change', cleared, cleared.toCssString());
      emit(
        'update:value',
        valueFormat.value
          ? formatColorValue(cleared, valueFormat.value)
          : cleared.toCssString(),
      );
    };

    expose({
      focus: () => {
        // noop
      },
      blur: () => {
        // noop
      },
    });

    return () => {
      const {
        rootClass,
        trigger,
        placement,
        getPopupContainer,
        autoAdjustOverflow,
        destroyOnHidden,
      } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const children = filterEmpty(slots?.default?.() ?? []);
      const showText = slots?.showText ?? props?.showText;
      const panelRender = slots?.panelRender ?? props?.panelRender;
      const rtlCls = {
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
      };
      const mergedRootCls = clsx(
        rootClass,
        cssVarCls.value,
        rootCls.value,
        rtlCls,
      );

      const mergedCls = clsx(
        getStatusClassNames(prefixCls.value, contextStatus.value),
        {
          [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
          [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
        },
        compactItemClassnames.value,
        contextClassName.value,
        mergedRootCls,
        className,
        hashId.value,
      );
      const mergedPopupCls = clsx(
        prefixCls.value,
        mergedRootCls,
        mergedClassNames.value?.popup?.root,
      );
      const popoverProps: PopoverProps = {
        open: popupOpen.value,
        trigger,
        placement,
        arrow: mergedArrow.value,
        rootClass,
        getPopupContainer,
        autoAdjustOverflow,
        destroyOnHidden,
      };
      const mergedStyle = {
        ...contextStyle.value,
        ...style,
      };
      const mergedShowText = showText
        ? typeof showText === 'function'
          ? (color: AggregationColor) => showText({ color })
          : showText
        : undefined;
      const panelNode = (
        <ContextIsolator form>
          <ColorPickerPanel
            {...restAttrs}
            activeIndex={activeIndex.value}
            allowClear={props.allowClear}
            disabled={mergedDisabled.value}
            disabledAlpha={disabledAlpha.value}
            disabledFormat={disabledFormat.value}
            format={formatValue.value}
            gradientDragging={gradientDragging.value}
            mode={modeState.value!}
            modeOptions={modeOptions.value as any}
            onActive={(val) => (activeIndex.value = val)}
            onChange={onInternalChange}
            onChangeComplete={onInternalChangeComplete}
            onClear={handleClear}
            onGradientDragging={(val) => (gradientDragging.value = val)}
            onModeChange={onInternalModeChange}
            panelRender={panelRender}
            prefixCls={prefixCls.value}
            presets={presets.value}
            value={mergedColor.value}
            {...{
              onFormatChange: triggerFormatChange,
            }}
            classes={mergedClassNames.value as any}
            styles={mergedStyles.value as any}
          />
        </ContextIsolator>
      );

      const triggerNode =
        children.length > 0 ? (
          children
        ) : (
          <ColorTrigger
            activeIndex={popupOpen.value ? activeIndex.value : -1}
            classes={mergedClassNames.value}
            className={mergedCls}
            color={mergedColor.value as any}
            disabled={mergedDisabled.value}
            format={formatValue.value}
            open={popupOpen.value}
            prefixCls={prefixCls.value}
            showText={mergedShowText as any}
            style={mergedStyle}
            styles={mergedStyles.value}
          />
        );
      return (
        <Popover
          classes={{ root: mergedPopupCls }}
          content={panelNode}
          onOpenChange={triggerOpenChange}
          styles={{
            root: mergedStyles.value?.popup?.root,
            container: styles.value?.popupOverlayInner,
          }}
          {...popoverProps}
        >
          {triggerNode}
        </Popover>
      );
    };
  },
  {
    name: 'AsColorPicker',
    inheritAttrs: false,
  },
);

const PurePanel = genPurePanel(
  ColorPicker,
  undefined,
  (props: ColorPickerProps) => ({
    ...props,
    placement: 'bottom' as TriggerPlacement,
    autoAdjustOverflow: false,
  }),
  'color-picker',
  /* istanbul ignore next */
  (prefixCls) => prefixCls,
);

(ColorPicker as any)._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

(ColorPicker as any).install = (app: App) => {
  app.component(ColorPicker.name, ColorPicker);
};

export default ColorPicker;
