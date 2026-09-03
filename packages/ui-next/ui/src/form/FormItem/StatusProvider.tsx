import type { FeedbackIcons, ValidateStatus } from '.';
import type { FormItemStatusContextProps } from '../context';
import type { Meta, NamePath } from '../types';

import { computed, defineComponent } from 'vue';

import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  LoadingOutlined,
} from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import {
  useFormContext,
  useFormItemInputContext,
  useFormItemInputContextProvider,
} from '../context';
import { getStatus } from '../util';

const iconMap = {
  success: CheckCircleFilled,
  warning: ExclamationCircleFilled,
  error: CloseCircleFilled,
  validating: LoadingOutlined,
};

export interface StatusProviderProps {
  errors: any[];
  hasFeedback?: boolean | { icons?: FeedbackIcons };
  meta: Meta;
  name?: NamePath;
  noStyle?: boolean;
  prefixCls: string;
  // children?: React.ReactNode;
  validateStatus?: ValidateStatus;
  warnings: any[];
}

const StatusProvider = defineComponent<StatusProviderProps>(
  (props, { slots }) => {
    const formContext = useFormContext();
    const formItemContext = useFormItemInputContext();
    const formItemInputNewContext = computed(() => {
      const {
        errors,
        warnings,
        hasFeedback,
        validateStatus,
        prefixCls,
        meta,
        noStyle,
        name,
      } = props;
      const itemPrefixCls = `${prefixCls}-item`;
      const { feedbackIcons } = formContext.value ?? {};

      const mergedValidateStatus = getStatus(
        errors,
        warnings,
        meta,
        null,
        !!hasFeedback,
        validateStatus,
      );
      const {
        isFormItemInput: parentIsFormItemInput,
        status: parentStatus,
        hasFeedback: parentHasFeedback,
        feedbackIcon: parentFeedbackIcon,
        name: parentName,
      } = formItemContext.value;

      let feedbackIcon: any;
      if (hasFeedback) {
        const customIcons =
          (hasFeedback !== true && hasFeedback.icons) || feedbackIcons;
        const customIconNode =
          mergedValidateStatus &&
          customIcons?.({ status: mergedValidateStatus, errors, warnings })?.[
            mergedValidateStatus
          ];
        const IconNode = mergedValidateStatus
          ? iconMap[mergedValidateStatus]
          : null;
        feedbackIcon =
          customIconNode !== false && IconNode ? (
            <span
              class={clsx(
                `${itemPrefixCls}-feedback-icon`,
                `${itemPrefixCls}-feedback-icon-${mergedValidateStatus}`,
              )}
            >
              {customIconNode || <IconNode />}
            </span>
          ) : null;
      }

      const context: FormItemStatusContextProps = {
        status: mergedValidateStatus || '',
        errors,
        warnings,
        hasFeedback: !!hasFeedback,
        feedbackIcon,
        isFormItemInput: true,
        name,
      };

      // No style will follow parent context
      if (noStyle) {
        context.status = (mergedValidateStatus ?? parentStatus) || '';
        context.isFormItemInput = parentIsFormItemInput;
        context.hasFeedback = !!(hasFeedback ?? parentHasFeedback);
        context.feedbackIcon =
          hasFeedback === undefined ? parentFeedbackIcon : context.feedbackIcon;
        context.name = name ?? parentName;
      }

      return context;
    });
    useFormItemInputContextProvider(formItemInputNewContext);
    return () => {
      return slots?.default?.();
    };
  },
  {
    name: 'StatusProvider',
    inheritAttrs: false,
  },
);

export default StatusProvider;
