import type { CSSProperties, SlotsType } from 'vue';

import type {
  BasePickerPanelProps,
  GenerateConfig,
  Locale,
} from '@arvin-studio/headless';

import type { AnyObject, VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';

import { computed, defineComponent, ref, watch } from 'vue';

import { PickerPanel } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useLocale from '../locale/useLocale';
import CalendarHeader from './Header';
import enUS from './locale/en_US';
import useStyle from './style';

export type CalendarMode = 'month' | 'year';

export type HeaderRender<DateType> = (config: {
  onChange: (date: DateType) => void;
  onTypeChange: (type: CalendarMode) => void;
  type: CalendarMode;
  value: DateType;
}) => VueNode;

export interface SelectInfo {
  source: 'customize' | 'date' | 'month' | 'year';
}

export type CalendarSemanticName = keyof CalendarSemanticClassNames &
  keyof CalendarSemanticStyles;

export interface CalendarSemanticClassNames {
  body?: string;
  content?: string;
  header?: string;
  item?: string;
  itemContent?: string;
  root?: string;
}

export interface CalendarSemanticStyles {
  body?: CSSProperties;
  content?: CSSProperties;
  header?: CSSProperties;
  item?: CSSProperties;
  itemContent?: CSSProperties;
  root?: CSSProperties;
}

export type CalendarClassNamesType<DateType> = SemanticClassNamesType<
  CalendarProps<DateType>,
  CalendarSemanticClassNames
>;

export type CalendarStylesType<DateType> = SemanticStylesType<
  CalendarProps<DateType>,
  CalendarSemanticStyles
>;

export interface CalendarProps<DateType>
  /* @vue-ignore */
  extends CalendarEmitsProps<DateType> {
  cellRender?: (date: DateType, info: any) => VueNode;
  classes?: CalendarClassNamesType<DateType>;
  /** @deprecated Please use cellRender instead. */
  dateCellRender?: (date: DateType) => VueNode;
  /** @deprecated Please use fullCellRender instead. */
  dateFullCellRender?: (date: DateType) => VueNode;
  defaultValue?: DateType;
  disabledDate?: (date: DateType) => boolean;
  fullCellRender?: (date: DateType, info: any) => VueNode;
  fullscreen?: boolean;
  headerRender?: HeaderRender<DateType>;
  locale?: typeof enUS;
  mode?: CalendarMode;
  /** @deprecated Please use cellRender instead. */
  monthCellRender?: (date: DateType) => VueNode;
  /** @deprecated Please use fullCellRender instead. */
  monthFullCellRender?: (date: DateType) => VueNode;
  prefixCls?: string;
  rootClass?: string;
  showWeek?: boolean;
  styles?: CalendarStylesType<DateType>;
  validRange?: [DateType, DateType];
  value?: DateType;
  // onChange?: (date: DateType) => void
  // onPanelChange?: (date: DateType, mode: CalendarMode) => void
  // onSelect?: (date: DateType, selectInfo: SelectInfo) => void
}

export const calendarProps = [
  'prefixCls',
  'rootClass',
  'classes',
  'styles',
  'locale',
  'validRange',
  'disabledDate',
  'dateFullCellRender',
  'dateCellRender',
  'monthFullCellRender',
  'monthCellRender',
  'cellRender',
  'fullCellRender',
  'headerRender',
  'value',
  'defaultValue',
  'mode',
  'fullscreen',
  'showWeek',
];

export interface CalendarSlots {
  [key: string]: any;
  cellRender?: (ctx: { date: AnyObject; info: any }) => any;
  dateCellRender?: (ctx: { date: AnyObject }) => any;
  dateFullCellRender?: (ctx: { date: AnyObject }) => any;
  fullCellRender?: (ctx: { date: AnyObject; info: any }) => any;
  headerRender?: (config: {
    onChange: (date: AnyObject) => void;
    onTypeChange: (type: CalendarMode) => void;
    type: CalendarMode;
    value: AnyObject;
  }) => any;
  monthCellRender?: (ctx: { date: AnyObject }) => any;
  monthFullCellRender?: (ctx: { date: AnyObject }) => any;
}

export interface CalendarEmits<DateType = AnyObject> {
  change: (date: DateType) => void;
  panelChange: (date: DateType, mode: CalendarMode) => void;
  select: (date: DateType, selectInfo: SelectInfo) => void;
  'update:value': (date: DateType) => void;
}
export interface CalendarEmitsProps<DateType = AnyObject> {
  onChange?: CalendarEmits<DateType>['change'];
  onPanelChange?: CalendarEmits<DateType>['panelChange'];
  onSelect?: CalendarEmits<DateType>['select'];
  'onUpdate:value'?: CalendarEmits<DateType>['update:value'];
}

function isSameYear<T extends AnyObject>(
  date1: T,
  date2: T,
  config: GenerateConfig<T>,
) {
  const { getYear } = config;
  return date1 && date2 && getYear(date1) === getYear(date2);
}

function isSameMonth<T extends AnyObject>(
  date1: T,
  date2: T,
  config: GenerateConfig<T>,
) {
  const { getMonth } = config;
  return (
    isSameYear(date1, date2, config) && getMonth(date1) === getMonth(date2)
  );
}

function isSameDate<T extends AnyObject>(
  date1: T,
  date2: T,
  config: GenerateConfig<T>,
) {
  const { getDate } = config;
  return isSameMonth(date1, date2, config) && getDate(date1) === getDate(date2);
}

function generateCalendar<DateType extends AnyObject>(
  generateConfig: GenerateConfig<DateType>,
) {
  const Calendar = defineComponent<
    CalendarProps<DateType>,
    CalendarEmits<DateType>,
    string,
    SlotsType<CalendarSlots>
  >(
    // eslint-disable-next-line unicorn/no-object-as-default-parameter
    (props = { fullscreen: true }, { slots, attrs, emit }) => {
      const {
        prefixCls,
        direction,
        class: contextClassName,
        style: contextStyle,
        classes: contextClassNames,
        styles: contextStyles,
      } = useComponentBaseConfig('calendar', props as any, [], 'picker');

      const mergedProps = computed(() => ({
        ...props,
        mode: props.mode,
        fullscreen: props.fullscreen,
        showWeek: props.showWeek,
      }));

      const [mergedClassNames, mergedStyles] = useMergeSemantic<
        CalendarClassNamesType<DateType>,
        CalendarStylesType<DateType>,
        CalendarProps<DateType>
      >(
        useToArr(
          contextClassNames,
          computed(() => props.classes),
        ),
        useToArr(
          contextStyles,
          computed(() => props.styles),
        ),
        useToProps(mergedProps as any),
      );

      const rootCls = useCSSVarCls(prefixCls);
      const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

      const today = generateConfig.getNow();
      const calendarPrefixCls = computed(() => `${prefixCls.value}-calendar`);

      if (isDev) {
        const warning = devUseWarning('Calendar');
        [
          ['dateFullCellRender', 'fullCellRender'],
          ['dateCellRender', 'cellRender'],
          ['monthFullCellRender', 'fullCellRender'],
          ['monthCellRender', 'cellRender'],
        ].forEach(([deprecatedName, newName]) => {
          warning.deprecated(
            (props as any)[deprecatedName!] === undefined,
            deprecatedName!,
            newName!,
          );
        });
      }

      const innerValue = ref<DateType>(
        props.defaultValue || generateConfig.getNow(),
      );
      const innerMode = ref<CalendarMode>(props.mode || 'month');

      watch(
        () => props.value,
        (val) => {
          if (val !== undefined) {
            innerValue.value = val;
          }
        },
      );

      watch(
        () => props.mode,
        (val) => {
          if (val !== undefined) {
            innerMode.value = val;
          }
        },
      );

      const mergedValue = computed(() => props.value ?? innerValue.value);
      const mergedMode = computed(() => props.mode ?? innerMode.value);
      const panelMode = computed(() =>
        mergedMode.value === 'year' ? 'month' : 'date',
      );

      const mergedDisabledDate = computed(() => {
        return (date: DateType) => {
          const notInRange = props.validRange
            ? generateConfig.isAfter(props.validRange[0], date) ||
              generateConfig.isAfter(date, props.validRange[1])
            : false;
          return notInRange || !!props.disabledDate?.(date);
        };
      });

      const triggerPanelChange = (date: DateType, newMode: CalendarMode) => {
        emit('panelChange', date, newMode);
      };

      const triggerChange = (date: DateType) => {
        const prevValue = mergedValue.value;
        if (props.value === undefined) {
          innerValue.value = date;
        }

        if (!isSameDate(date, prevValue, generateConfig)) {
          if (
            (panelMode.value === 'date' &&
              !isSameMonth(date, prevValue, generateConfig)) ||
            (panelMode.value === 'month' &&
              !isSameYear(date, prevValue, generateConfig))
          ) {
            triggerPanelChange(date, mergedMode.value);
          }

          emit('update:value', date);
          emit('change', date);
        }
      };

      const triggerModeChange = (newMode: CalendarMode) => {
        if (props.mode === undefined) {
          innerMode.value = newMode;
        }
        triggerPanelChange(mergedValue.value, newMode);
      };

      const onInternalSelect = (
        date: DateType,
        source: SelectInfo['source'],
      ) => {
        triggerChange(date);
        emit('select', date, { source });
      };

      const resolveRender = (
        key: keyof CalendarSlots,
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

      const dateRender = (date: DateType, info: any) => {
        if (slots.fullCellRender || props.fullCellRender) {
          return resolveRender('fullCellRender', [date, info], { date, info });
        }
        if (slots.dateFullCellRender || props.dateFullCellRender) {
          return resolveRender('dateFullCellRender', [date], { date });
        }

        const cellContent =
          slots.cellRender || props.cellRender
            ? resolveRender('cellRender', [date, info], { date, info })
            : resolveRender('dateCellRender', [date], { date });

        return (
          <div
            class={clsx(
              `${prefixCls.value}-cell-inner`,
              `${calendarPrefixCls.value}-date`,
              {
                [`${calendarPrefixCls.value}-date-today`]: isSameDate(
                  today,
                  date,
                  generateConfig,
                ),
              },
            )}
          >
            <div class={`${calendarPrefixCls.value}-date-value`}>
              {String(generateConfig.getDate(date)).padStart(2, '0')}
            </div>
            <div
              class={clsx(
                `${calendarPrefixCls.value}-date-content`,
                mergedClassNames.value.itemContent,
              )}
              style={mergedStyles.value.itemContent}
            >
              {cellContent}
            </div>
          </div>
        );
      };

      const monthRender = (date: DateType, info: any) => {
        if (slots.fullCellRender || props.fullCellRender) {
          return resolveRender('fullCellRender', [date, info], { date, info });
        }
        if (slots.monthFullCellRender || props.monthFullCellRender) {
          return resolveRender('monthFullCellRender', [date], { date });
        }

        const months =
          info.locale?.shortMonths ||
          generateConfig.locale.getShortMonths!(info.locale?.locale);

        const cellContent =
          slots.cellRender || props.cellRender
            ? resolveRender('cellRender', [date, info], { date, info })
            : resolveRender('monthCellRender', [date], { date });

        return (
          <div
            class={clsx(
              `${prefixCls.value}-cell-inner`,
              `${calendarPrefixCls.value}-date`,
              {
                [`${calendarPrefixCls.value}-date-today`]: isSameMonth(
                  today,
                  date,
                  generateConfig,
                ),
              },
            )}
          >
            <div class={`${calendarPrefixCls.value}-date-value`}>
              {months[generateConfig.getMonth(date)]}
            </div>
            <div
              class={clsx(
                `${calendarPrefixCls.value}-date-content`,
                mergedClassNames.value.itemContent,
              )}
              style={mergedStyles.value.itemContent}
            >
              {cellContent}
            </div>
          </div>
        );
      };

      const [contextLocale] = useLocale('Calendar', enUS);
      const locale = computed(() => ({
        ...contextLocale?.value,
        ...props.locale,
      }));

      const mergedCellRender: BasePickerPanelProps['cellRender'] = (
        current: any,
        info: any,
      ) => {
        if (info.type === 'date') {
          return dateRender(current, info);
        }

        if (info.type === 'month') {
          return monthRender(current, {
            ...info,
            locale: locale.value?.lang,
          });
        }
      };

      const splitClassNames = computed(() => {
        const { root, header, ...panelClassNames } = mergedClassNames.value;
        return {
          root,
          header,
          panelClassNames,
        };
      });

      const splitStyles = computed(() => {
        const { root, header, ...panelStyles } = mergedStyles.value;
        return {
          root,
          header,
          panelStyles,
        };
      });

      return () => {
        const { className, style, restAttrs } = getAttrStyleAndClass(attrs);

        const { root, header, panelClassNames } = splitClassNames.value;
        const {
          root: rootStyle,
          header: headerStyle,
          panelStyles,
        } = splitStyles.value;

        const headerConfig = {
          value: mergedValue.value,
          type: mergedMode.value,
          onChange: (nextDate: DateType) => {
            onInternalSelect(nextDate, 'customize');
          },
          onTypeChange: triggerModeChange,
        };

        const hasHeaderRender = slots.headerRender || props.headerRender;
        const headerNode = hasHeaderRender
          ? resolveRender('headerRender', [headerConfig], headerConfig)
          : undefined;

        return (
          <div
            class={clsx(
              calendarPrefixCls.value,
              {
                [`${calendarPrefixCls.value}-full`]: props.fullscreen !== false,
                [`${calendarPrefixCls.value}-mini`]: props.fullscreen === false,
                [`${calendarPrefixCls.value}-rtl`]: direction.value === 'rtl',
              },
              contextClassName.value,
              props.rootClass,
              root,
              rootCls.value,
              hashId.value,
              cssVarCls.value,
              className,
            )}
            style={{
              ...rootStyle,
              ...contextStyle.value,
              ...style,
            }}
            {...restAttrs}
          >
            {hasHeaderRender ? (
              headerNode
            ) : (
              <CalendarHeader
                className={header}
                fullscreen={props.fullscreen !== false}
                generateConfig={generateConfig}
                locale={locale.value?.lang as Locale}
                mode={mergedMode.value}
                onChange={onInternalSelect}
                onModeChange={triggerModeChange}
                prefixCls={calendarPrefixCls.value}
                style={headerStyle}
                validRange={props.validRange}
                value={mergedValue.value}
              />
            )}
            <PickerPanel
              cellRender={mergedCellRender}
              classNames={panelClassNames}
              disabledDate={mergedDisabledDate.value}
              generateConfig={generateConfig}
              hideHeader
              locale={locale.value?.lang}
              mode={panelMode.value}
              onSelect={(nextDate: DateType) => {
                onInternalSelect(nextDate, panelMode.value);
              }}
              picker={panelMode.value}
              prefixCls={prefixCls.value}
              showWeek={props.showWeek}
              styles={panelStyles}
              value={mergedValue.value}
            />
          </div>
        );
      };
    },
    {
      name: 'AsCalendar',
      inheritAttrs: false,
    },
  );

  return Calendar;
}

export default generateCalendar;
