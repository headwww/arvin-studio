import type { Locale } from '.';

import { Pagination_en_Us as Pagination } from '@arvin-studio/headless';

import Calendar from '../calendar/locale/en_US';
import DatePicker from '../date-picker/locale/en_US';
import TimePicker from '../time-picker/locale/en_US';

const typeTemplate = '${label} is not a valid ${type}';

const localeValues: Locale = {
  Table: {
    seqTitle: '#',
    emptyText: 'No Data',
    loadingText: 'Loading...',
    allTitle: 'Select all/cancel',
    dragTip: 'Move: {0}',
    sortAsc: 'Ascending order: lowest to highest',
    sortDesc: 'Descending order: highest to lowest',
    filter: 'Enable filtering for selected columns',
    rowGroupContentTotal: '{0} ({1})',
    resizeColTip: 'Width: {0} pixels',
    resizeRowTip: 'Height: {0} pixels',
    maxFixedCol: 'The maximum number of fixed columns cannot exceed {0}',
    maxGroupCol: 'The maximum number of grouping fields cannot exceed {0}',
    treeDragChild: 'Parents cannot drag to their own children',
  },
  locale: 'en',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    placeholder: 'Please select',
    close: 'Close',
    sortable: 'sortable',
  },
  Tour: {
    Next: 'Next',
    Previous: 'Previous',
    Finish: 'Finish',
  },
  Modal: {
    okText: 'OK',
    cancelText: 'Cancel',
    justOkText: 'OK',
  },
  Popconfirm: {
    okText: 'OK',
    cancelText: 'Cancel',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Search here',
    itemUnit: 'item',
    itemsUnit: 'items',
    remove: 'Remove',
    selectCurrent: 'Select current page',
    removeCurrent: 'Remove current page',
    selectAll: 'Select all data',
    deselectAll: 'Deselect all data',
    removeAll: 'Remove all data',
    selectInvert: 'Invert current page',
  },
  Upload: {
    uploading: 'Uploading...',
    removeFile: 'Remove file',
    uploadError: 'Upload error',
    previewFile: 'Preview file',
    downloadFile: 'Download file',
  },
  Empty: {
    description: 'No data',
  },
  Icon: {
    icon: 'icon',
  },
  Text: {
    edit: 'Edit',
    copy: 'Copy',
    copied: 'Copied',
    expand: 'Expand',
    collapse: 'Collapse',
  },
  Form: {
    optional: '(optional)',
    defaultValidateMessages: {
      default: 'Field validation error for ${label}',
      required: 'Please enter ${label}',
      enum: '${label} must be one of [${enum}]',
      whitespace: '${label} cannot be a blank character',
      date: {
        format: '${label} date format is invalid',
        parse: '${label} cannot be converted to a date',
        invalid: '${label} is an invalid date',
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
        len: '${label} must be ${len} characters',
        min: '${label} must be at least ${min} characters',
        max: '${label} must be up to ${max} characters',
        range: '${label} must be between ${min}-${max} characters',
      },
      number: {
        len: '${label} must be equal to ${len}',
        min: '${label} must be minimum ${min}',
        max: '${label} must be maximum ${max}',
        range: '${label} must be between ${min}-${max}',
      },
      array: {
        len: 'Must be ${len} ${label}',
        min: 'At least ${min} ${label}',
        max: 'At most ${max} ${label}',
        range: 'The amount of ${label} must be between ${min}-${max}',
      },
      pattern: {
        mismatch: '${label} does not match the pattern ${pattern}',
      },
    },
  },
  Image: {
    preview: 'Preview',
  },
  QRCode: {
    expired: 'QR code expired',
    refresh: 'Refresh',
    scanned: 'Scanned',
  },
  ColorPicker: {
    presetEmpty: 'Empty',
    transparent: 'Transparent',
    singleColor: 'Single',
    gradientColor: 'Gradient',
  },
};

export default localeValues;
