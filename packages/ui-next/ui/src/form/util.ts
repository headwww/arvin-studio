import type { ValidateStatus } from './FormItem';
import type { InternalNamePath, Meta } from './types';

import { clone } from '@arvin-studio/kit';

// form item name black list.  in form ,you can use form.id get the form item element.
// use object hasOwnProperty will get better performance if black list is longer.
const formItemNameBlackList = new Set(['nextSibling', 'parentNode', 'tagName']);

// default form item id prefix.
const defaultItemNamePrefixCls: string = 'form_item';

export function toArray<T>(candidate?: false | T | T[]): T[] {
  if (candidate === undefined || candidate === false) {
    return [];
  }
  return Array.isArray(candidate) ? candidate : [candidate];
}

/**
 * Key used to track the rendered control instance of a Form.Item.
 * Unlike `getFieldId`, this is not prefixed with the form name, so it stays
 * stable no matter whether the Form declares a `name`.
 */
export function toNamePathStr(namePath: InternalNamePath): string {
  return namePath.join('_');
}

export function getFieldId(
  namePath: InternalNamePath,
  formName?: string,
): string | undefined {
  if (namePath.length === 0) {
    return undefined;
  }

  const mergedId = namePath.join('_');

  if (formName) {
    return `${formName}_${mergedId}`;
  }

  const isIllegalName = formItemNameBlackList.has(mergedId);

  return isIllegalName ? `${defaultItemNamePrefixCls}_${mergedId}` : mergedId;
}

/**
 * Get merged status by meta or passed `validateStatus`.
 */
export function getStatus<DefaultValue>(
  errors: any[],
  warnings: any[],
  meta: Meta,
  defaultValidateStatus: DefaultValue | ValidateStatus,
  hasFeedback?: boolean,
  validateStatus?: ValidateStatus,
): DefaultValue | ValidateStatus {
  let status = defaultValidateStatus;

  if (validateStatus !== undefined) {
    status = validateStatus;
  } else if (meta.validating) {
    status = 'validating';
  } else if (errors.length > 0) {
    status = 'error';
  } else if (warnings.length > 0) {
    status = 'warning';
  } else if (meta.touched || (hasFeedback && meta.validated)) {
    // success feedback should display when pass hasFeedback prop and current value is valid value
    status = 'success';
  }
  return status;
}

export function initialValueFormat(value: any) {
  // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons
  if (value === undefined || value === null || value === '') {
    return value;
  }
  if (Array.isArray(value) || typeof value === 'object') {
    return clone(value, true);
  }
  return value;
}
