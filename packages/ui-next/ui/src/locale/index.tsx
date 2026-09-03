import type { InjectionKey, Ref } from 'vue';

import type { PickerLocale as DatePickerLocale } from '../date-picker';
import type { TransferLocale as TransferLocaleForEmpty } from '../empty';
import type { ValidateMessages } from '../form/types.ts';
import type { ModalLocale } from '../modal/interface.ts';
import type { PaginationLocale } from '../pagination';
import type { PopconfirmLocale } from '../popconfirm/PurePanel';
import type { TimePickerLocale } from '../time-picker';
import type { TourLocale } from '../tour';
import type { TransferLocale } from '../transfer';
import type { UploadLocale } from '../upload/interface.ts';

import { computed, defineComponent, inject, provide, ref } from 'vue';

export type LocaleContextProps = Locale & { exist?: boolean };

export interface LocaleContext {
  locale: Ref<LocaleContextProps>;
}

const LocaleContextKey: InjectionKey<LocaleContext> = Symbol('LocaleContext');
export const AS_MARK = 'internalMark';
export interface LocaleProviderProps {
  /** @internal */
  _AS_MARK__?: string;
  locale: Locale;
}
export interface Locale {
  Calendar?: DatePickerLocale;
  ColorPicker?: {
    gradientColor: string;
    presetEmpty: string;
    singleColor: string;
    transparent: string;
  };
  DatePicker?: DatePickerLocale;
  Empty?: TransferLocaleForEmpty;
  Form?: {
    defaultValidateMessages: ValidateMessages;
    optional?: string;
  };
  global?: {
    close?: string;
    placeholder?: string;
    sortable?: string;
  };
  Icon?: Record<string, any>;
  Image?: {
    preview: string;
  };
  locale: string;
  Modal?: ModalLocale;
  Pagination?: PaginationLocale;
  Popconfirm?: PopconfirmLocale;
  QRCode?: {
    expired?: string;
    refresh?: string;
    scanned?: string;
  };
  Select?: Record<string, any>;

  Text?: {
    collapse?: any;
    copied?: any;
    copy?: any;
    edit?: any;
    expand?: any;
  };
  TimePicker?: TimePickerLocale;
  Tour?: TourLocale;
  Transfer?: TransferLocale;
  Upload?: UploadLocale;
}
export function useLocaleProvider(props: LocaleContext) {
  provide(LocaleContextKey, props);
}

export const LocaleProvider = defineComponent<LocaleProviderProps>(
  (props, { slots }) => {
    const locale = computed<LocaleContextProps>(() => ({
      ...props.locale,
      exist: true,
    }));
    useLocaleProvider({ locale });
    return () => {
      return slots?.default?.();
    };
  },
  {
    name: 'LocaleProvider',
  },
);

export function useLocaleContext() {
  return inject(LocaleContextKey, {
    locale: ref(undefined),
  } as unknown as LocaleContext);
}
