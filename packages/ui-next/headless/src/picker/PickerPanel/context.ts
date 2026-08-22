import type { InjectionKey, Ref } from 'vue';

import type {
  FilledPanelClassNames,
  FilledPanelStyles,
} from '../hooks/useSemantic';
import type { PanelMode, SharedPanelProps } from '../interface';

import { inject, provide } from 'vue';

export interface SharedPanelContextProps {
  classNames: FilledPanelClassNames;
  styles: FilledPanelStyles;
}

const SharedPanelContextKey: InjectionKey<Ref<SharedPanelContextProps>> =
  Symbol('SharedPanelContext');

export function provideSharedPanelContext(
  context: Ref<SharedPanelContextProps>,
) {
  provide(SharedPanelContextKey, context);
}

export function useSharedPanelContext() {
  return inject(
    SharedPanelContextKey,
    null as any,
  ) as null | Ref<SharedPanelContextProps>;
}

export interface PanelContextProps<DateType extends object = any> extends Pick<
  SharedPanelProps<DateType>,
  | 'cellRender'
  | 'disabledDate'
  | 'generateConfig'
  | 'hoverRangeValue'
  | 'hoverValue'
  | 'locale'
  | 'maxDate'
  | 'minDate'
  | 'nextIcon'
  | 'onHover'

  // Limitation
  | 'onSelect'
  | 'pickerValue'
  | 'prefixCls'

  // Icon
  | 'prevIcon'
  | 'superNextIcon'
  | 'superPrevIcon'
  | 'values'
> {
  classNames: FilledPanelClassNames;
  now: DateType;
  panelType: PanelMode;
  styles: FilledPanelStyles;
}

const PanelContextKey: InjectionKey<Ref<PanelContextProps>> =
  Symbol('PanelContext');

export function providePanelContext<DateType extends object = any>(
  context: Ref<PanelContextProps<DateType>>,
) {
  provide(PanelContextKey, context as any);
}

export function usePanelContext<DateType extends object = any>() {
  return inject(PanelContextKey, null as any) as null | Ref<
    PanelContextProps<DateType>
  >;
}

export function useInfo<DateType extends object = any>(
  props: SharedPanelProps<DateType>,
  panelType: PanelMode,
  sharedContext?: null | Ref<SharedPanelContextProps>,
): [sharedProps: PanelContextProps<DateType>, now: DateType] {
  const ctx = sharedContext ?? useSharedPanelContext();
  const classNames = ctx?.value.classNames;
  const styles = ctx?.value.styles;

  const {
    prefixCls,
    generateConfig,
    locale,
    disabledDate,
    minDate,
    maxDate,
    cellRender,
    hoverValue,
    hoverRangeValue,
    onHover,
    values,
    pickerValue,
    onSelect,
    prevIcon,
    nextIcon,
    superPrevIcon,
    superNextIcon,
  } = props;

  const now = generateConfig!.getNow();

  const info: PanelContextProps<DateType> = {
    now,
    values,
    pickerValue,
    prefixCls,
    classNames: classNames!,
    styles: styles!,
    disabledDate,
    minDate,
    maxDate,
    cellRender,
    hoverValue,
    hoverRangeValue,
    onHover,
    locale,
    generateConfig,
    onSelect,
    panelType,
    prevIcon,
    nextIcon,
    superPrevIcon,
    superNextIcon,
  };

  return [info, now];
}

export interface PickerHackContextProps {
  hideHeader?: boolean;
  hideNext?: boolean;
  hidePrev?: boolean;
  onCellDblClick?: () => void;
}

const PickerHackContextKey: InjectionKey<Ref<PickerHackContextProps>> =
  Symbol('PickerHackContext');

export function providePickerHackContext(context: Ref<PickerHackContextProps>) {
  provide(PickerHackContextKey, context);
}

export function usePickerHackContext() {
  return inject(
    PickerHackContextKey,
    null as any,
  ) as null | Ref<PickerHackContextProps>;
}
