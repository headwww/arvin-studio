import type { Locale } from '.';

import { Pagination_hu_Hu as Pagination } from '@arvin-studio/headless';

import Calendar from '../calendar/locale/hu_HU';
import DatePicker from '../date-picker/locale/hu_HU';
import TimePicker from '../time-picker/locale/hu_HU';

const localeValues: Locale = {
  locale: 'hu',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    close: 'Bezárás',
    placeholder: 'Kérem válasszon',
    sortable: 'válogatható',
  },
  Modal: {
    okText: 'Alkalmazás',
    cancelText: 'Visszavonás',
    justOkText: 'Alkalmazás',
  },
  Popconfirm: {
    okText: 'Alkalmazás',
    cancelText: 'Visszavonás',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Keresés',
    itemUnit: 'elem',
    itemsUnit: 'elemek',
    remove: 'Távolítsa el',
    selectAll: 'Válassza ki az összes adatot',
    deselectAll: 'Törölje az összes adat kijelölését',
    selectCurrent: 'Válassza ki az aktuális oldalt',
    selectInvert: 'Az aktuális oldal megfordítása',
    removeAll: 'Távolítsa el az összes adatot',
    removeCurrent: 'Az aktuális oldal eltávolítása',
  },
  Upload: {
    uploading: 'Feltöltés...',
    removeFile: 'Fájl eltávolítása',
    uploadError: 'Feltöltési hiba',
    previewFile: 'Fájl előnézet',
    downloadFile: 'Fájl letöltése',
  },
  Empty: {
    description: 'Nincs adat',
  },
  Tour: {
    Next: 'Következő',
    Previous: 'Előző',
    Finish: 'Befejezés',
  },
  Text: {
    edit: 'Szerkesztés',
    copy: 'Másolás',
    copied: 'Másolva',
    expand: 'Bontsa ki',
    collapse: 'Összeomlás',
  },
  QRCode: {
    expired: 'A QR kód lejárt',
    refresh: 'Frissítés',
    scanned: 'Beolvasva',
  },
  ColorPicker: {
    presetEmpty: 'Üres',
    transparent: 'Átlátszó',
    singleColor: 'Egyszínű',
    gradientColor: 'Gradiens szín',
  },
};

export default localeValues;
