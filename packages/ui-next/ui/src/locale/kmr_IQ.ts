import type { Locale } from '.';

import { Pagination_kmr_Iq as Pagination } from '@arvin-studio/headless';

import Calendar from '../calendar/locale/kmr_IQ';
import DatePicker from '../date-picker/locale/kmr_IQ';
import TimePicker from '../time-picker/locale/kmr_IQ';

const localeValues: Locale = {
  locale: 'ku',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    close: 'Betal ke',
    placeholder: 'Ji kerema xwe hilbijêre',
    sortable: 'sorkirin',
  },
  Tour: {
    Next: 'Temam',
    Previous: 'Betal ke',
    Finish: 'Temam',
  },
  Modal: {
    okText: 'Temam',
    cancelText: 'Betal ke',
    justOkText: 'Temam',
  },
  Popconfirm: {
    okText: 'Temam',
    cancelText: 'Betal ke',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Lêgerîn',
    itemUnit: 'tişt',
    itemsUnit: 'tişt',
    remove: 'Rakirin',
    selectAll: 'Hemî daneyan hilbijêrin',
    deselectAll: 'Hemî daneyan jêbirin',
    selectCurrent: 'Rûpelê heyî hilbijêrin',
    selectInvert: 'Rûpelê heyî berovajî bikin',
    removeAll: 'Hemî daneyan jêbirin',
    removeCurrent: 'Rûpelê heyî jêbirin',
  },
  Upload: {
    uploading: 'Bardike...',
    removeFile: 'Pelê rabike',
    uploadError: 'Xeta barkirine',
    previewFile: 'Pelê pêşbibîne',
    downloadFile: 'Pelê dakêşin',
  },
  Empty: {
    description: 'Agahî tune',
  },
  Text: {
    edit: 'Sererast bike',
    copy: 'Kopî bike',
    copied: 'Kopî kirin',
    expand: 'Zêdetir nîşan bide',
    collapse: 'Hilweşîn',
  },
  QRCode: {
    expired: 'Koda QR qediya',
    refresh: 'Refresh',
    scanned: 'Scanned',
  },
  ColorPicker: {
    presetEmpty: 'Empty',
    transparent: 'Transparent',
    singleColor: 'Yek reng',
    gradientColor: 'Rengê gradient',
  },
};

export default localeValues;
