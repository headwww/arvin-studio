import type { Locale } from '.';

import { Pagination_da_Dk as Pagination } from '@arvin-studio/headless';

import Calendar from '../calendar/locale/da_DK';
import DatePicker from '../date-picker/locale/da_DK';
import TimePicker from '../time-picker/locale/da_DK';

const typeTemplate = '${label} er ikke en gyldig ${type}';
const localeValues: Locale = {
  locale: 'da',
  DatePicker,
  TimePicker,
  Calendar,
  Pagination,
  global: {
    close: 'Luk',
    placeholder: 'Vælg venligst',
    sortable: 'sorterbar',
  },
  Tour: {
    Next: 'Næste',
    Previous: 'Forrige',
    Finish: 'Færdiggørelse',
  },
  Modal: {
    okText: 'OK',
    cancelText: 'Afbryd',
    justOkText: 'OK',
  },
  Popconfirm: {
    okText: 'OK',
    cancelText: 'Afbryd',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Søg her',
    itemUnit: 'element',
    itemsUnit: 'elementer',
    remove: 'Fjern',
    selectAll: 'Vælg alle data',
    deselectAll: 'Fravælg alle data',
    selectCurrent: 'Vælg den aktuelle side',
    selectInvert: 'Inverter den aktuelle side',
    removeAll: 'Fjern alle data',
    removeCurrent: 'Fjern den aktuelle side',
  },
  Upload: {
    uploading: 'Uploader...',
    removeFile: 'Fjern fil',
    uploadError: 'Fejl ved upload',
    previewFile: 'Forhåndsvisning',
    downloadFile: 'Download fil',
  },
  Empty: {
    description: 'Ingen data',
  },
  Form: {
    optional: '(valgfrit)',
    defaultValidateMessages: {
      default: 'Feltvalideringsfejl ${label}',
      required: 'Indtast venligst ${label}',
      enum: '${label} skal være en af [${enum}]',
      whitespace: '${label} kan ikke være et tomt tegn',
      date: {
        format: '${label} Datoformatet er ugyldigt',
        parse: '${label} kan ikke konverteres til en dato',
        invalid: '${label} er en ugyldig dato',
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
        len: '${label} skal være ${len} tegn',
        min: '${label} mindst ${min} tegn',
        max: '${label} op til ${max} tegn',
        range: '${label} skal være mellem ${min} og ${max} tegn',
      },
      number: {
        len: '${label} skal være lig med ${len}',
        min: '${label} Minimumsværdien er ${min}',
        max: '${label} maksimal værdi er ${max}',
        range: '${label} skal være mellem ${min}-${max}',
      },
      array: {
        len: 'Skal være ${len} ${label}',
        min: 'Mindst  ${min} ${label}',
        max: 'Højst ${max} ${label}',
        range: 'Mængden af ${label} skal være mellem ${min}-${max}',
      },
      pattern: {
        mismatch: '${label} stemmer ikke overens med mønsteret ${pattern}',
      },
    },
  },
  Text: {
    edit: 'Rediger',
    copy: 'Kopiér',
    copied: 'Kopieret',
    expand: 'Udvid',
    collapse: 'Kollaps',
  },
  QRCode: {
    expired: 'QR-koden er udløbet',
    refresh: 'Opdater',
    scanned: 'Scannet',
  },
  ColorPicker: {
    presetEmpty: 'Tom',
    transparent: 'Gennemsigtig',
    singleColor: 'Enkelt farve',
    gradientColor: 'Gradient farve',
  },
};

export default localeValues;
