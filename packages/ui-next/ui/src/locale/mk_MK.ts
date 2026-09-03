import type { Locale } from '.';

import { Pagination_mk_Mk as Pagination } from '@arvin-studio/headless';

import Calendar from '../calendar/locale/mk_MK';
import DatePicker from '../date-picker/locale/mk_MK';
import TimePicker from '../time-picker/locale/mk_MK';

const localeValues: Locale = {
  locale: 'mk',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    placeholder: 'Ве молиме означете',
    close: 'Затвори',
    sortable: 'подредливи',
  },
  Tour: {
    Next: 'Следно',
    Previous: 'Претходно',
    Finish: 'Заврши',
  },
  Modal: {
    okText: 'ОК',
    cancelText: 'Откажи',
    justOkText: 'ОК',
  },
  Popconfirm: {
    okText: 'ОК',
    cancelText: 'Откажи',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Пребарај тука',
    itemUnit: 'предмет',
    itemsUnit: 'предмети',
    remove: 'Отстрани',
    selectAll: 'Изберете ги сите податоци',
    deselectAll: 'Деселектирај ги сите податоци',
    selectCurrent: 'Изберете тековна страница',
    selectInvert: 'Превртете ја тековната страница',
    removeAll: 'Отстранете ги сите податоци',
    removeCurrent: 'Отстранете ја моменталната страница',
  },
  Upload: {
    uploading: 'Се прикачува...',
    removeFile: 'Избриши фајл',
    uploadError: 'Грешка при прикачување',
    previewFile: 'Прикажи фајл',
    downloadFile: 'Преземи фајл',
  },
  Empty: {
    description: 'Нема податоци',
  },
  Icon: {
    icon: 'Икона',
  },
  Text: {
    edit: 'Уреди',
    copy: 'Копирај',
    copied: 'Копирано',
    expand: 'Зголеми',
    collapse: 'Колапс',
  },
  QRCode: {
    expired: 'QR-кодот е истечен',
    refresh: 'Освежи',
    scanned: 'Скенирано',
  },
  ColorPicker: {
    presetEmpty: 'Празен',
    transparent: 'Транспарентен',
    singleColor: 'Еднобојна',
    gradientColor: 'Боја на градиент',
  },
};

export default localeValues;
