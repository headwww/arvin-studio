import type { CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit } from '../_util';
import type { ThemeConfig } from '../config-provider/component-config';
import type { ModalFuncProps, ModalLocale } from './interface';

import { computed, defineComponent } from 'vue';

import { getTransitionName } from '@arvin-studio/headless';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import { CONTAINER_MAX_OFFSET } from '../_util/hooks';
import { normalizeMaskConfig } from '../_util/hooks/useMergedMask';
import isNonNullable from '../_util/isNonNullable';
import { getSlotPropsFnRun } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import ConfigProvider from '../config-provider/index';
import useLocale from '../locale/useLocale';
import { useToken } from '../theme/internal';
import ConfirmCancelBtn from './components/ConfirmCancelBtn';
import ConfirmOkBtn from './components/ConfirmOkBtn';
import { useModalProvider } from './context';
import { getConfirmLocale } from './locale';
import Modal from './Modal';
import Confirm from './style/confirm';

const CONFIRM_OMIT_SEMANTIC_NAMES = ['body'];

export interface ConfirmDialogProps extends ModalFuncProps {
  afterClose?: () => void;
  autoFocusButton?: 'cancel' | 'ok' | null;
  close?: (...args: any[]) => void;
  iconPrefixCls?: string;
  /**
   * Do not throw if is await mode
   */
  isSilent?: () => boolean;
  /** @private Internal Usage. Do not override this */
  locale?: ModalLocale;
  /**
   * `close` prop support `...args` that pass to the developer
   * that we can not break this.
   * Provider `onClose` for internal usage
   */
  onConfirm?: (confirmed: boolean) => void;

  prefixCls: string;

  rootPrefixCls?: string;

  /**
   * Only passed by static method
   */
  theme?: ThemeConfig;
}

export const ConfirmContent = defineComponent<
  ConfirmDialogProps & {
    confirmPrefixCls: string;
    contentClassName?: string;
    contentStyle?: CSSProperties;
  },
  EmptyEmit,
  string,
  SlotsType<{ default?: () => any }>
>(
  (props) => {
    if (isDev) {
      const { icon } = props;
      const warning = devUseWarning('Modal');
      warning(
        !(typeof icon === 'string' && (icon as any)?.length > 2),
        'breaking',
        `\`icon\` is using VueNode instead of string naming in v4. Please check \`${icon as any}\` at https://ant.design/components/icon`,
      );
    }

    const mergedType = computed(() => {
      const { type } = props;
      return type || 'confirm';
    });

    const mergedOkCancel = computed(() => {
      const okCancel = props.okCancel;
      return okCancel ?? mergedType.value === 'confirm';
    });
    const autoFocusButton =
      props.autoFocusButton === null ? false : props.autoFocusButton || 'ok';

    const [locale] = useLocale('Modal', getConfirmLocale());
    const mergedLocale = computed(() => props.locale || locale?.value);
    const okTextLocale = computed(
      () =>
        props?.okText ??
        (mergedOkCancel.value
          ? mergedLocale.value?.okText
          : mergedLocale.value?.justOkText),
    );
    const cancelTextLocale = computed(
      () => props?.cancelText ?? mergedLocale.value?.cancelText,
    );

    const { closable } = props;
    const { onClose } =
      closable && typeof closable === 'object' ? closable : {};

    const memoizedValue = computed(() => ({
      autoFocusButton,
      cancelTextLocale: cancelTextLocale.value,
      okTextLocale: okTextLocale.value,
      mergedOkCancel: mergedOkCancel.value,
      onClose,
      ...props,
    }));

    useModalProvider(memoizedValue as any);

    return () => {
      const { confirmPrefixCls, footer, contentClassName, contentStyle } =
        props;
      const content = getSlotPropsFnRun({}, props, 'content', false);
      const icon = getSlotPropsFnRun({}, props, 'icon', false);
      const title = getSlotPropsFnRun({}, props, 'title', false);
      let mergedIcon = icon as any;
      if (!icon && icon !== null) {
        switch (mergedType.value) {
          case 'error': {
            mergedIcon = <CloseCircleFilled />;
            break;
          }
          case 'info': {
            mergedIcon = <InfoCircleFilled />;
            break;
          }
          case 'success': {
            mergedIcon = <CheckCircleFilled />;
            break;
          }
          default: {
            mergedIcon = <ExclamationCircleFilled />;
          }
        }
      }

      const hasTitle = isNonNullable(title) && title !== '';
      const hasIcon = isNonNullable(mergedIcon);
      const bodyCls = `${confirmPrefixCls}-body`;

      const footerOriginNode = (
        <>
          <ConfirmCancelBtn />
          <ConfirmOkBtn />
        </>
      );
      return (
        <div class={`${confirmPrefixCls}-body-wrapper`}>
          <div
            class={clsx(bodyCls, {
              [`${bodyCls}-has-title`]: hasTitle,
              [`${bodyCls}-no-icon`]: !hasIcon,
            })}
          >
            {mergedIcon}
            <div class={`${confirmPrefixCls}-paragraph`}>
              {hasTitle && (
                <span class={`${confirmPrefixCls}-title`}>{title}</span>
              )}
              <div
                class={clsx(`${confirmPrefixCls}-content`, contentClassName)}
                style={contentStyle}
              >
                {content}
              </div>
            </div>
          </div>
          {footer === undefined || typeof footer === 'function' ? (
            <div class={`${confirmPrefixCls}-btns`}>
              {typeof footer === 'function'
                ? footer({
                    originNode: footerOriginNode,
                    extra: { OkBtn: ConfirmOkBtn, CancelBtn: ConfirmCancelBtn },
                  })
                : footerOriginNode}
            </div>
          ) : (
            footer
          )}
          <Confirm prefixCls={props.prefixCls} />
        </div>
      );
    };
  },
  {
    name: 'ConfirmContent',
    inheritAttrs: false,
  },
);

const defaults = {
  closable: false,
} as any;

const ConfirmDialog = defineComponent<ConfirmDialogProps>(
  (props = defaults) => {
    const {
      cancelButtonProps: contextCancelButtonProps,
      okButtonProps: contextOkButtonProps,
    } = useComponentBaseConfig('modal', props, [
      'okButtonProps',
      'cancelButtonProps',
    ]);

    if (isDev) {
      const warning = devUseWarning('Modal');
      [
        ['bodyStyle', 'styles.body'],
        ['maskStyle', 'styles.mask'],
      ].forEach(([deprecatedName, newName]) => {
        warning.deprecated(
          (props as any)[deprecatedName!] === undefined,
          deprecatedName!,
          newName!,
        );
      });
    }
    const [, token] = useToken();
    const mergedZIndex = computed(
      () => props.zIndex ?? token.value.zIndexPopupBase + CONTAINER_MAX_OFFSET,
    );

    return () => {
      const {
        close,
        maskStyle,
        direction,
        prefixCls,
        wrapClassName,
        rootPrefixCls,
        bodyStyle,
        closable = false,
        styles,
        title,
        class: className,
        style,
        width = 416,
        type,
        maskClosable: customMaskClosable,
        mask,
        ...restProps
      } = props;

      const confirmPrefixCls = `${prefixCls}-confirm`;

      const mergedMaskFn = () => {
        const nextMaskConfig = normalizeMaskConfig(mask, customMaskClosable);
        nextMaskConfig.closable ??= false;
        return nextMaskConfig;
      };

      const mergedMask = mergedMaskFn();

      const semanticStyles =
        typeof styles === 'function'
          ? (info: any) => ({
              body: bodyStyle,
              mask: maskStyle,
              ...(styles as any)(info),
            })
          : { body: bodyStyle, mask: maskStyle, ...styles };

      const mergedType = type || 'confirm';
      const classString = clsx(
        confirmPrefixCls,
        `${confirmPrefixCls}-${mergedType}`,
        { [`${confirmPrefixCls}-rtl`]: direction === 'rtl' },
        className,
      );

      return (
        <Modal
          {...(restProps as any)}
          _renderSemanticContent={({
            classNames: mergedClassNames,
            styles: mergedStyles,
          }) => (
            <ConfirmContent
              {...props}
              cancelButtonProps={{
                ...contextCancelButtonProps.value,
                ...props.cancelButtonProps,
              }}
              confirmPrefixCls={confirmPrefixCls}
              contentClassName={mergedClassNames.body}
              contentStyle={mergedStyles.body}
              okButtonProps={{
                ...contextOkButtonProps.value,
                ...props.okButtonProps,
              }}
            />
          )}
          _semanticOmit={CONFIRM_OMIT_SEMANTIC_NAMES}
          class={classString}
          closable={closable}
          footer={null}
          mask={mergedMask}
          maskTransitionName={getTransitionName(
            rootPrefixCls || '',
            'fade',
            props.maskTransitionName,
          )}
          onCancel={() => {
            close?.({ triggerCancel: true });
            props.onConfirm?.(false);
          }}
          style={style as any}
          styles={semanticStyles}
          title={title}
          transitionName={getTransitionName(
            rootPrefixCls || '',
            'zoom',
            props.transitionName,
          )}
          width={width}
          wrapClassName={clsx(
            { [`${confirmPrefixCls}-centered`]: !!props.centered },
            wrapClassName,
          )}
          zIndex={mergedZIndex.value}
        />
      );
    };
  },
  {
    name: 'ConfirmDialog',
    inheritAttrs: false,
  },
);

const ConfirmDialogWrapper = defineComponent<ConfirmDialogProps>(
  (props) => {
    return () => {
      const { rootPrefixCls, iconPrefixCls, direction, theme } = props;
      return (
        <ConfigProvider
          direction={direction}
          iconPrefixCls={iconPrefixCls}
          prefixCls={rootPrefixCls}
          theme={theme}
        >
          <ConfirmDialog {...props} />
        </ConfigProvider>
      );
    };
  },
  {
    name: 'ConfirmDialogWrapper',
    inheritAttrs: false,
  },
);

export default ConfirmDialogWrapper;
