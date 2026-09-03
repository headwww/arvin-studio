import type { Locale } from '.';

import { Pagination_bn_Bd as Pagination } from '@arvin-studio/headless';

import Calendar from '../calendar/locale/bn_BD';
import DatePicker from '../date-picker/locale/bn_BD';
import TimePicker from '../time-picker/locale/bn_BD';

const typeTemplate = '${label} টি সঠিক ${type} নয়।';

const localeValues: Locale = {
  locale: 'bn-bd',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    placeholder: 'অনুগ্রহ করে নির্বাচন করুন',
    close: 'বন্ধ',
    sortable: 'বাছাইযোগ্য',
  },
  Tour: {
    Next: 'পরবর্তী',
    Previous: 'পূর্ববর্তী',
    Finish: 'সমাপ্ত',
  },
  Modal: {
    okText: 'ঠিক',
    cancelText: 'বাতিল',
    justOkText: 'ঠিক',
  },
  Popconfirm: {
    okText: 'ঠিক',
    cancelText: 'বাতিল',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'এখানে অনুসন্ধান',
    itemUnit: 'আইটেম',
    itemsUnit: 'আইটেমসমূহ',
    remove: 'অপসারণ',
    selectCurrent: 'বর্তমান পৃষ্ঠা নির্বাচন করুন',
    removeCurrent: 'বর্তমান পৃষ্ঠাটি সরান',
    selectAll: 'সমস্ত ডেটা নির্বাচন করুন',
    removeAll: 'সমস্ত ডেটা সরান',
    selectInvert: 'বর্তমান পৃষ্ঠাটি উল্টে দিন',
    deselectAll: 'সমস্ত ডেটা অনির্বাচন করুন',
  },
  Upload: {
    uploading: 'আপলোড হচ্ছে ...',
    removeFile: 'ফাইল সরান',
    uploadError: 'আপলোডে সমস্যা',
    previewFile: 'ফাইলের পূর্বরূপ',
    downloadFile: 'ফাইল ডাউনলোড',
  },
  Empty: {
    description: 'কোনও ডেটা নেই',
  },
  Icon: {
    icon: 'আইকন',
  },
  Text: {
    edit: 'সম্পাদনা',
    copy: 'অনুলিপি',
    copied: 'অনুলিপি হয়েছে',
    expand: 'বিস্তৃত করা',
    collapse: 'সঙ্কুচিত',
  },
  Form: {
    optional: '(ঐচ্ছিক)',
    defaultValidateMessages: {
      default: '${label} এর ক্ষেত্রে ক্ষেত্র বৈধতা ত্রুটি',
      required: 'অনুগ্রহ করে ${label} প্রবেশ করান',
      enum: '${label} অবশ্যই [${enum}] এর মধ্যে একটি হতে হবে',
      whitespace: '${label} ফাঁকা অক্ষর হতে পারে না',
      date: {
        format: '${label} তারিখ ফরমেট সঠিক নয়।',
        parse: '${label} তারিখে রূপান্তর করা যায় না',
        invalid: '${label} একটি সঠিক তারিখ না।',
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
        len: '${label} অবশ্যই ${len} অক্ষরের হতে হবে।',
        min: '${label} অবশ্যই অন্তত ${min} অক্ষরের হতে হবে।',
        max: '${label} অবশ্যই ${max} পর্যন্ত অক্ষরের হতে হবে।',
        range: '${label} অবশ্যই ${min}-${max} অক্ষরের এর মধ্যে হতে হবে।',
      },
      number: {
        len: '${label} অবশ্যই ${len} এর সমান হতে হবে',
        min: '${label} অবশ্যই সর্বনিম্ন ${min} হতে হবে',
        max: '${label} অবশ্যই সর্বোচ্চ ${max} হতে হবে',
        range: '${label} অবশ্যই ${min}-${max} এর মধ্যে হতে হবে',
      },
      array: {
        len: 'অবশ্যই ${len} ${label} হতে হবে',
        min: 'কমপক্ষে ${min} ${label}',
        max: 'সর্বাধিক হিসাবে ${max} ${label}',
        range: '${label} এর পরিমাণ অবশ্যই ${min}-${max} এর মধ্যে হতে হবে',
      },
      pattern: {
        mismatch: '${label} এই ${pattern} প্যাটার্নের সাথে মেলে না',
      },
    },
  },
  QRCode: {
    expired: 'QR কোডের মেয়াদ শেষ',
    refresh: 'রিফ্রেশ',
    scanned: 'স্ক্যান করা হয়েছে',
  },
  ColorPicker: {
    presetEmpty: 'খালি',
    transparent: 'স্বচ্ছ',
    singleColor: 'একক রঙ',
    gradientColor: 'গ্রেডিয়েন্ট রঙ',
  },
};

export default localeValues;
