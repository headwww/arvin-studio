import { clsx } from '@arvin-studio/kit';

const _InputStatuses = [
  'warning',
  'error',
  '',
  'success',
  'validating',
] as const;

export type InputStatus = (typeof _InputStatuses)[number];

export type ValidateStatus =
  | ''
  | 'error'
  | 'success'
  | 'validating'
  | 'warning';

export function getStatusClassNames(
  prefixCls: string,
  status?: ValidateStatus,
  hasFeedback?: boolean,
) {
  return clsx({
    [`${prefixCls}-status-success`]: status === 'success',
    [`${prefixCls}-status-warning`]: status === 'warning',
    [`${prefixCls}-status-error`]: status === 'error',
    [`${prefixCls}-status-validating`]: status === 'validating',
    [`${prefixCls}-has-feedback`]: hasFeedback,
  });
}

export function getMergedStatus(
  contextStatus?: ValidateStatus,
  customStatus?: InputStatus,
) {
  return customStatus || contextStatus;
}
