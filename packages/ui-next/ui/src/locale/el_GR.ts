import type { Locale } from '.';

import { Pagination_el_Gr as Pagination } from '@arvin-studio/headless';

import Calendar from '../calendar/locale/el_GR';
import DatePicker from '../date-picker/locale/el_GR';
import TimePicker from '../time-picker/locale/el_GR';

const typeTemplate = 'Το ${label} δεν είναι έγκυρο ${type}';

const localeValues: Locale = {
  locale: 'el',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    placeholder: 'Παρακαλώ επιλέξτε',
    close: 'Κλείσιμο',
    sortable: 'διαλογήσιμος',
  },
  Modal: {
    okText: 'ΟΚ',
    cancelText: 'Άκυρο',
    justOkText: 'Εντάξει',
  },
  Tour: {
    Next: 'Επόμενο',
    Previous: 'Προηγούμενο',
    Finish: 'Τέλος',
  },
  Popconfirm: {
    okText: 'ΟΚ',
    cancelText: 'Άκυρο',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Αναζήτηση',
    itemUnit: 'αντικείμενο',
    itemsUnit: 'αντικείμενα',
    remove: 'Αφαίρεση',
    selectCurrent: 'Επιλογή τρέχουσας σελίδας',
    removeCurrent: 'Αφαίρεση τρέχουσας σελίδας',
    selectAll: 'Επιλογή όλων των δεδομένων',
    removeAll: 'Αφαίρεση όλων των δεδομένων',
    selectInvert: 'Αντιστροφή τρέχουσας σελίδας',
    deselectAll: 'Καταργήστε την επιλογή όλων των δεδομένων',
  },
  Upload: {
    uploading: 'Μεταφόρτωση...',
    removeFile: 'Αφαίρεση αρχείου',
    uploadError: 'Σφάλμα μεταφόρτωσης',
    previewFile: 'Προεπισκόπηση αρχείου',
    downloadFile: 'Λήψη αρχείου',
  },
  Empty: {
    description: 'Δεν υπάρχουν δεδομένα',
  },
  Icon: {
    icon: 'εικονίδιο',
  },
  Text: {
    edit: 'Επεξεργασία',
    copy: 'Αντιγραφή',
    copied: 'Αντιγράφηκε',
    expand: 'Ανάπτυξη',
    collapse: 'Σύμπτυξη',
  },
  Form: {
    optional: '(προαιρετικό)',
    defaultValidateMessages: {
      default: 'Σφάλμα επικύρωσης πεδίου για ${label}',
      required: 'Παρακαλώ εισάγετε ${label}',
      enum: 'Το ${label} πρέπει να είναι ένα από [${enum}]',
      whitespace: 'Το ${label} δεν μπορεί να είναι κενός χαρακτήρας',
      date: {
        format: 'Η μορφή ημερομηνίας του ${label} είναι άκυρη',
        parse: 'Το ${label} δεν μπορεί να μετατραπεί σε ημερομηνία',
        invalid: 'Το ${label} είναι μια άκυρη ημερομηνία',
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
        len: 'Το ${label} πρέπει να είναι ${len} χαρακτήρες',
        min: 'Το ${label} πρέπει να είναι τουλάχιστον ${min} χαρακτήρες',
        max: 'Το ${label} πρέπει να είναι το πολύ ${max} χαρακτήρες',
        range: 'Το ${label} πρέπει να είναι μεταξύ ${min}-${max} χαρακτήρων',
      },
      number: {
        len: 'Το ${label} πρέπει να είναι ίσο με ${len}',
        min: 'Το ${label} πρέπει να είναι τουλάχιστον ${min}',
        max: 'Το ${label} πρέπει να είναι το πολύ ${max}',
        range: 'Το ${label} πρέπει να είναι μεταξύ ${min}-${max}',
      },
      array: {
        len: 'Πρέπει να είναι ${len} ${label}',
        min: 'Τουλάχιστον ${min} ${label}',
        max: 'Το πολύ ${max} ${label}',
        range: 'Το ποσό του ${label} πρέπει να είναι μεταξύ ${min}-${max}',
      },
      pattern: {
        mismatch: 'Το ${label} δεν ταιριάζει με το μοτίβο ${pattern}',
      },
    },
  },
  QRCode: {
    expired: 'Ο κωδικός QR έληξε',
    refresh: 'Ανανέωση',
    scanned: 'Σαρώθηκε',
  },
  ColorPicker: {
    presetEmpty: 'Κενό',
    transparent: 'Διαφανές',
    singleColor: 'Μονόχρωμο',
    gradientColor: 'Διαβάθμιση χρώματος',
  },
};

export default localeValues;
