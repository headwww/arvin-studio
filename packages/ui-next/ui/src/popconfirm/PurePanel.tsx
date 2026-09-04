import type { CSSProperties } from 'vue';

import type {
  PopconfirmProps,
  PopconfirmSemanticClassNames,
  PopconfirmSemanticStyles,
} from '.';
import type { ButtonProps } from '../button';

import { computed, defineComponent } from 'vue';

import { ExclamationCircleFilled } from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import ActionButton from '../_util/ActionButton';
import { isRenderable } from '../_util/is';
import Button from '../button';
import { useComponentBaseConfig, useConfig } from '../config-provider/context';
import defaultLocale from '../locale/en_US';
import useLocale from '../locale/useLocale';
import PopoverPurePanel from '../popover/PurePanel';
import useStyle from './style';

export interface PopconfirmLocale {
  cancelText: string;
  okText: string;
}

export interface OverlayProps extends Pick<
  PopconfirmProps,
  | 'cancelButtonProps'
  | 'cancelText'
  | 'description'
  | 'icon'
  | 'okButtonProps'
  | 'okText'
  | 'okType'
  | 'showCancel'
  | 'title'
> {
  classes?: PopconfirmSemanticClassNames;
  close?: (...args: any[]) => void;
  onCancel?: (e?: MouseEvent) => void;
  onConfirm?: (e?: MouseEvent) => void;
  onPopupClick?: (e: MouseEvent) => void;
  prefixCls: string;
  styles?: PopconfirmSemanticStyles;
}

export const Overlay = defineComponent<OverlayProps>(
  (props) => {
    const config = useConfig();
    const btnPrefixCls = computed(
      () => config.value?.getPrefixCls?.('btn') ?? 'as-btn',
    );
    const [contextLocale] = useLocale('Popconfirm', defaultLocale.Popconfirm);

    return () => {
      const {
        prefixCls,
        icon = <ExclamationCircleFilled />,
        title,
        description,
        cancelText,
        okText,
        okType = 'primary',
        okButtonProps,
        cancelButtonProps,
        showCancel = true,
        close,
        onConfirm,
        onCancel,
        onPopupClick,
        classes,
        styles,
      } = props;
      const cancelButtonAttrs: ButtonProps = {
        size: 'small',
        ...cancelButtonProps,
      };
      const okButtonAttrs: ButtonProps = {
        size: 'small',
        ...okButtonProps,
      };
      const mergedCancelText = cancelText ?? contextLocale?.value?.cancelText;
      const mergedOkText = okText ?? contextLocale?.value?.okText;
      const mergedShowCancel = showCancel !== false;

      const handlePopupClick = (e: MouseEvent) => {
        onPopupClick?.(e);
      };

      return (
        <div class={`${prefixCls}-inner-content`} onClick={handlePopupClick}>
          <div class={`${prefixCls}-message`}>
            {icon && (
              <span
                class={clsx(`${prefixCls}-message-icon`, classes?.icon)}
                style={styles?.icon}
              >
                {icon}
              </span>
            )}
            <div class={`${prefixCls}-message-text`}>
              {isRenderable(title) && (
                <div
                  class={clsx(`${prefixCls}-title`, classes?.title)}
                  style={styles?.title}
                >
                  {title}
                </div>
              )}
              {isRenderable(description) && (
                <div
                  class={clsx(`${prefixCls}-description`, classes?.content)}
                  style={styles?.content}
                >
                  {description}
                </div>
              )}
            </div>
          </div>
          <div class={`${prefixCls}-buttons`}>
            {mergedShowCancel && (
              <Button onClick={onCancel} {...cancelButtonAttrs}>
                {mergedCancelText}
              </Button>
            )}
            <ActionButton
              actionFn={onConfirm}
              buttonProps={okButtonAttrs}
              close={close}
              emitEvent
              prefixCls={btnPrefixCls.value}
              quitOnNullishReturnValue
              type={okType}
            >
              {mergedOkText}
            </ActionButton>
          </div>
        </div>
      );
    };
  },
  {
    name: 'AsPopconfirmOverlay',
    inheritAttrs: false,
  },
);

export interface PurePanelProps
  extends Omit<OverlayProps, 'prefixCls'>, Pick<PopconfirmProps, 'placement'> {
  class?: string;
  style?: CSSProperties;
}

const PurePanel = defineComponent<PurePanelProps>(
  (props) => {
    const { prefixCls } = useComponentBaseConfig('popconfirm', props as any);
    const [hashId, cssVarCls] = useStyle(prefixCls);

    return () => (
      <PopoverPurePanel
        class={clsx(
          prefixCls.value,
          hashId.value,
          cssVarCls.value,
          props.class,
        )}
        content={<Overlay prefixCls={prefixCls.value} {...props} />}
        placement={props.placement}
        style={props.style}
      />
    );
  },
  {
    name: 'PopconfirmPurePanel',
    inheritAttrs: false,
  },
);

export default PurePanel;
