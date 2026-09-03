import type { Locale } from '.';

import { Pagination_pl_Pl as Pagination } from '@arvin-studio/headless';
import Calendar from '../calendar/locale/pl_PL';
import DatePicker from '../date-picker/locale/pl_PL';
import TimePicker from '../time-picker/locale/pl_PL';

const typeTemplate = '${label} nie posiada poprawnej wartości dla typu ${type}';

const localeValues: Locale = {
  locale: 'pl',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    placeholder: 'Wybierz',
    close: 'Zamknij',
    sortable: 'sortowalne',
  },
  Tour: {
    Next: 'Dalej',
    Previous: 'Wróć',
    Finish: 'Zakończ',
  },
  Modal: {
    okText: 'OK',
    cancelText: 'Anuluj',
    justOkText: 'OK',
  },
  Popconfirm: {
    okText: 'OK',
    cancelText: 'Anuluj',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Szukaj',
    itemUnit: 'obiekt',
    itemsUnit: 'obiekty',
    remove: 'Usuń',
    selectCurrent: 'Wybierz aktualną stronę',
    removeCurrent: 'Usuń aktualną stronę',
    selectAll: 'Wybierz wszystkie',
    removeAll: 'Usuń wszystkie',
    selectInvert: 'Odwróć wybór',
    deselectAll: 'Odznacz wszystkie dane',
  },
  Upload: {
    uploading: 'Wysyłanie...',
    removeFile: 'Usuń plik',
    uploadError: 'Błąd wysyłania',
    previewFile: 'Podejrzyj plik',
    downloadFile: 'Pobieranie pliku',
  },
  Empty: {
    description: 'Brak danych',
  },
  Icon: {
    icon: 'Ikona',
  },
  Text: {
    edit: 'Edytuj',
    copy: 'Kopiuj',
    copied: 'Skopiowany',
    expand: 'Rozwiń',
    collapse: 'Zwiń',
  },
  Form: {
    optional: '(opcjonalne)',
    defaultValidateMessages: {
      default: 'Błąd walidacji dla pola ${label}',
      required: 'Pole ${label} jest wymagane',
      enum: 'Pole ${label} musi posiadać wartość z listy: [${enum}]',
      whitespace: 'Pole ${label} nie może być puste',
      date: {
        format: '${label} posiada zły format daty',
        parse: '${label} nie może zostać zinterpretowane jako data',
        invalid: '${label} jest niepoprawną datą',
      },
      types: {
        string: typeTemplate,
        method: typeTemplate,
        array: typeTemplate,
        object: typeTemplate,
        number: typeTemplate,
        date: typeTemplate,
        boolean: typeTemplate,
        integer: typeTemplate,
        float: typeTemplate,
        regexp: typeTemplate,
        email: typeTemplate,
        url: typeTemplate,
        hex: typeTemplate,
      },
      string: {
        len: '${label} musi posiadać ${len} znaków',
        min: '${label} musi posiadać co namniej ${min} znaków',
        max: '${label} musi posiadać maksymalnie ${max} znaków',
        range: '${label} musi posiadać między ${min} a ${max} znaków',
      },
      number: {
        len: '${label} musi mieć wartość o długości ${len}',
        min: '${label} musi mieć wartość większą lub równą ${min}',
        max: '${label} musi mieć wartość mniejszą lub równą ${max}',
        range: '${label} musi mieć wartość pomiędzy ${min} a ${max}',
      },
      array: {
        len: '${label} musi posiadać ${len} elementów',
        min: '${label} musi posiadać co najmniej ${min} elementów',
        max: '${label} musi posiadać maksymalnie ${max} elementów',
        range: '${label} musi posiadać między ${min} a ${max} elementów',
      },
      pattern: {
        mismatch: '${label} nie posiada wartości zgodnej ze wzorem ${pattern}',
      },
    },
  },
  QRCode: {
    expired: 'Kod QR wygasł',
    refresh: 'Odśwież',
    scanned: 'Zeskanowano',
  },
  ColorPicker: {
    presetEmpty: 'Pusty',
    transparent: 'Przezroczysty',
    singleColor: 'Pojedynczy kolor',
    gradientColor: 'Kolor gradientowy',
  },
};

export default localeValues;
