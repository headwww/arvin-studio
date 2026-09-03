import type { FormInstance, InternalFormInstance } from '../types';

export function toArray<T>(value?: null | T | T[]): T[] {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function isFormInstance<T>(
  form: FormInstance | T,
): form is FormInstance {
  return form && !!(form as InternalFormInstance)._init;
}
