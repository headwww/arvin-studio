import type { GenerateConfig } from '../../generate';
import type { DisabledDate, SharedPanelProps } from '../../interface';

import { computed, defineComponent } from 'vue';

import { formatValue } from '../../utils/dateUtil';
import {
  providePanelContext,
  useInfo,
  useSharedPanelContext,
} from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';

const MonthPanel = defineComponent<SharedPanelProps>(
  (props: SharedPanelProps) => {
    const sharedContext = useSharedPanelContext();
    const panelContext = computed(() => {
      const [info] = useInfo(props as any, 'month', sharedContext);
      return info;
    });

    providePanelContext(panelContext);

    return () => {
      const {
        prefixCls,
        locale = {} as any,
        generateConfig = {} as GenerateConfig<any>,
        pickerValue,
        disabledDate,
        onPickerValueChange,
        onModeChange,
      } = props;

      const panelPrefixCls = `${prefixCls}-month-panel`;
      const baseDate = generateConfig.setMonth(pickerValue, 0);
      const yearFormat = locale.yearFormat || 'YYYY';

      const monthsLocale =
        locale.shortMonths ||
        (generateConfig.locale.getShortMonths
          ? generateConfig.locale.getShortMonths(locale.locale)
          : []);

      const getCellDate = (date: any, offset: number) => {
        return generateConfig.addMonth(date, offset);
      };

      const getCellText = (date: any) => {
        const month = generateConfig.getMonth(date);

        return locale.monthFormat
          ? formatValue(date, {
              locale,
              format: locale.monthFormat,
              generateConfig,
            })
          : monthsLocale[month];
      };

      const getCellClassName = () => ({
        [`${prefixCls}-cell-in-view`]: true,
      });

      const mergedDisabledDate: DisabledDate<any> | undefined = disabledDate
        ? (currentDate, disabledInfo) => {
            const startDate = generateConfig.setDate(currentDate, 1);
            const nextMonthStartDate = generateConfig.setMonth(
              startDate,
              generateConfig.getMonth(startDate) + 1,
            );
            const endDate = generateConfig.addDate(nextMonthStartDate, -1);

            return (
              disabledDate(startDate, disabledInfo) &&
              disabledDate(endDate, disabledInfo)
            );
          }
        : undefined;

      const yearNode = (
        <button
          aria-label={locale.yearSelect}
          class={`${prefixCls}-year-btn`}
          key="year"
          onClick={() => {
            onModeChange?.('year');
          }}
          tabindex={-1}
          type="button"
        >
          {formatValue(pickerValue, {
            locale,
            format: yearFormat,
            generateConfig,
          })}
        </button>
      );

      return (
        <div class={panelPrefixCls}>
          <PanelHeader
            getEnd={(date: any) => generateConfig.setMonth(date, 11)}
            getStart={(date: any) => generateConfig.setMonth(date, 0)}
            onChange={onPickerValueChange}
            superOffset={(distance: number, date: any) =>
              generateConfig.addYear(date, distance)
            }
          >
            {yearNode}
          </PanelHeader>

          <PanelBody
            {...props}
            baseDate={baseDate}
            colNum={3}
            disabledDate={mergedDisabledDate}
            getCellClassName={getCellClassName}
            getCellDate={getCellDate}
            getCellText={getCellText}
            rowNum={4}
            titleFormat={locale.fieldMonthFormat}
          />
        </div>
      );
    };
  },
  {
    name: 'MonthPanel',
    inheritAttrs: false,
  },
);

export default MonthPanel;
