import type { Ref } from 'vue';

import type {
  CellRender,
  CellRenderInfo,
  SharedPickerProps,
} from '../../interface';

export default function useCellRender<DateType extends object = any>(
  cellRender: Ref<SharedPickerProps<DateType>['cellRender'] | undefined>,
  dateRender?: Ref<SharedPickerProps<DateType>['dateRender'] | undefined>,
  monthCellRender?: Ref<
    SharedPickerProps<DateType>['monthCellRender'] | undefined
  >,
  range?: Ref<CellRenderInfo<DateType>['range'] | undefined>,
) {
  // ======================== Render ========================
  // Merged render
  const mergedCellRender = (
    current: DateType | number | string,
    info: CellRenderInfo<DateType>,
  ) => {
    if (cellRender.value) {
      return cellRender.value(current, info);
    }

    const date = current as DateType;

    if (dateRender?.value && info.type === 'date') {
      return dateRender.value(date, info.today);
    }
    if (monthCellRender?.value && info.type === 'month') {
      return monthCellRender.value(date, info.locale!);
    }
    return info.originNode;
  };

  // Cell render
  const onInternalCellRender: CellRender<DateType> = (date, info) =>
    mergedCellRender(date, { ...info, range: range?.value });

  return onInternalCellRender;
}
