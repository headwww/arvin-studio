import type { GenerateConfig } from '../../generate';
import type { SharedPanelProps } from '../../interface';

import { computed, defineComponent } from 'vue';

import { formatValue } from '../../utils/dateUtil';
import {
  providePanelContext,
  useInfo,
  useSharedPanelContext,
} from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';

const QuarterPanel = defineComponent<SharedPanelProps<any>>(
  <DateType extends object = any>(props: SharedPanelProps<DateType>) => {
    const sharedContext = useSharedPanelContext();
    const panelContext = computed(() => {
      const [info] = useInfo(props as any, 'quarter', sharedContext);
      return info;
    });

    providePanelContext(panelContext);

    return () => {
      const {
        prefixCls,
        locale = {} as any,
        generateConfig = {} as GenerateConfig<any>,
        pickerValue,
        onPickerValueChange,
        onModeChange,
      } = props;
      const panelPrefixCls = `${prefixCls}-quarter-panel`;

      const baseDate = generateConfig.setMonth(pickerValue, 0);
      const cellQuarterFormat = locale.cellQuarterFormat || '[Q]Q';
      const yearFormat = locale.yearFormat || 'YYYY';

      const getCellDate = (date: any, offset: number) => {
        return generateConfig.addMonth(date, offset * 3);
      };

      const getCellText = (date: any) => {
        return formatValue(date, {
          locale,
          format: cellQuarterFormat,
          generateConfig,
        });
      };

      const getCellClassName = () => ({
        [`${prefixCls}-cell-in-view`]: true,
      });

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
            colNum={4}
            getCellClassName={getCellClassName}
            getCellDate={getCellDate}
            getCellText={getCellText}
            rowNum={1}
            titleFormat={locale.fieldQuarterFormat}
          />
        </div>
      );
    };
  },
  {
    name: 'QuarterPanel',
    inheritAttrs: false,
  },
);

export default QuarterPanel;
