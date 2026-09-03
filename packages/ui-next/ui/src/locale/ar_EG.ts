import type { Locale } from '.';

import { Pagination_ar_Eg as Pagination } from '@arvin-studio/headless';

import Calendar from '../calendar/locale/ar_EG';
import DatePicker from '../date-picker/locale/ar_EG';
import TimePicker from '../time-picker/locale/ar_EG';

const typeTemplate = 'ليس ${label} من نوع ${type} صالحًا';

const localeValues: Locale = {
  locale: 'ar',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    placeholder: 'يرجى التحديد',
    close: 'إغلاق',
    sortable: 'قابل للفرز',
  },
  Tour: {
    Next: 'التالي',
    Previous: 'السابق',
    Finish: 'إنهاء',
  },
  Modal: {
    okText: 'تأكيد',
    cancelText: 'إلغاء',
    justOkText: 'تأكيد',
  },
  Popconfirm: {
    okText: 'تأكيد',
    cancelText: 'إلغاء',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'ابحث هنا',
    itemUnit: 'عنصر',
    itemsUnit: 'عناصر',
    remove: 'إزالة',
    selectAll: 'حدد كافة البيانات',
    deselectAll: 'إلغاء تحديد كافة البيانات',
    selectCurrent: 'حدد الصفحة الحالية',
    selectInvert: 'عكس الصفحة الحالية',
    removeAll: 'إزالة كافة البيانات',
    removeCurrent: 'إزالة الصفحة الحالية',
  },
  Upload: {
    uploading: 'جاري الرفع...',
    removeFile: 'احذف الملف',
    uploadError: 'مشكلة فى الرفع',
    previewFile: 'استعرض الملف',
    downloadFile: 'تحميل الملف',
  },
  Empty: {
    description: 'لا توجد بيانات',
  },
  Icon: {
    icon: 'أيقونة',
  },
  Text: {
    edit: 'تعديل',
    copy: 'نسخ',
    copied: 'نقل',
    expand: 'وسع',
    collapse: 'طي',
  },
  Form: {
    defaultValidateMessages: {
      default: 'خطأ في حقل الإدخال ${label}',
      required: 'يرجى إدخال ${label}',
      enum: '${label} يجب أن يكون واحدا من [${enum}]',
      whitespace: '${label} لا يمكن أن يكون حرفًا فارغًا',
      date: {
        format: '${label} تنسيق التاريخ غير صحيح',
        parse: '${label} لا يمكن تحويلها إلى تاريخ',
        invalid: 'تاريخ ${label} غير صحيح',
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
        len: 'يجب ${label} ان يكون ${len} أحرف',
        min: '${label} على الأقل ${min} أحرف',
        max: '${label} يصل إلى ${max} أحرف',
        range: 'يجب ${label} ان يكون مابين ${min}-${max} أحرف',
      },
      number: {
        len: '${len} ان يساوي ${label} يجب',
        min: '${min} الأدنى هو ${label} حد',
        max: '${max} الأقصى هو ${label} حد',
        range: '${max}-${min} ان يكون مابين ${label} يجب',
      },
      array: {
        len: 'يجب أن يكون ${label} طوله ${len}',
        min: 'يجب أن يكون ${label} طوله الأدنى ${min}',
        max: 'يجب أن يكون ${label} طوله الأقصى ${max}',
        range: 'يجب أن يكون ${label} طوله مابين ${min}-${max}',
      },
      pattern: {
        mismatch: 'لا يتطابق ${label} مع ${pattern}',
      },
    },
  },
  QRCode: {
    expired: 'انتهت صلاحية رمز الاستجابة السريعة',
    refresh: 'انقر للتحديث',
    scanned: 'تم المسح',
  },
  ColorPicker: {
    presetEmpty: 'لا يوجد',
    transparent: 'شفاف',
    singleColor: 'لون واحد',
    gradientColor: 'تدرج لوني',
  },
};

export default localeValues;
