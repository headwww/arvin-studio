import type { DrawerProps as VcDrawerProps } from '@v-c/drawer';

import type { CSSProperties } from 'vue';

import type { DrawerProps } from '.';
import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ClosableType } from '../_util/hooks/useClosable';

import { computed, defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { useMergeSemantic, useToArr, useToProps } from '../_util/hooks';
import useClosable, { pickClosable } from '../_util/hooks/useClosable';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import Skeleton from '../skeleton';

export type DrawerSemanticName = keyof DrawerSemanticClassNames &
  keyof DrawerSemanticStyles;

export interface DrawerSemanticClassNames {
  body?: string;
  close?: string;
  dragger?: string;
  extra?: string;
  footer?: string;
  header?: string;
  mask?: string;
  root?: string;
  section?: string;
  title?: string;
  wrapper?: string;
}

export interface DrawerSemanticStyles {
  body?: CSSProperties;
  close?: CSSProperties;
  dragger?: CSSProperties;
  extra?: CSSProperties;
  footer?: CSSProperties;
  header?: CSSProperties;
  mask?: CSSProperties;
  root?: CSSProperties;
  section?: CSSProperties;
  title?: CSSProperties;
  wrapper?: CSSProperties;
}

export type DrawerClassNamesType = SemanticClassNamesType<
  DrawerProps,
  DrawerSemanticClassNames
>;

export type DrawerStylesType = SemanticStylesType<
  DrawerProps,
  DrawerSemanticStyles
>;

export interface DrawerPanelProps {
  ariaId?: string;
  /** @deprecated Please use `styles.body` instead */
  bodyStyle?: CSSProperties;
  classes?: DrawerClassNamesType;
  /**
   * Recommend to use closeIcon instead
   *
   * e.g.
   *
   * `<Drawer closeIcon={false} />`
   */
  closable?:
    | boolean
    | (Extract<ClosableType, object> & { placement?: 'end' | 'start' });
  closeIcon?: VueNode;
  /** @deprecated Please use `styles.wrapper` instead */
  contentWrapperStyle?: CSSProperties;
  /** @deprecated Please use `styles.content` instead */
  drawerStyle?: CSSProperties;
  extra?: VueNode;
  footer?: VueNode;
  /** @deprecated Please use `styles.footer` instead */
  footerStyle?: CSSProperties;
  /** @deprecated Please use `styles.header` instead */
  headerStyle?: CSSProperties;
  loading?: boolean;

  /** @deprecated Please use `styles.mask` instead */
  maskStyle?: CSSProperties;
  onClose?: VcDrawerProps['onClose'];
  prefixCls: string;
  size?: DrawerProps['size'];
  styles?: DrawerStylesType;
  title?: VueNode;
}

const DrawerPanel = defineComponent<DrawerPanelProps>(
  (props, { slots }) => {
    const {
      classes: contextClassNames,
      styles: contextStyles,
      closable: contextClosable,
      closeIcon: contextCloseIcon,
    } = useComponentBaseConfig('drawer', props, ['closable', 'closeIcon']);

    const { classes: drawerClassNames, styles: drawerStyles } = toPropsRefs(
      props,
      'classes',
      'styles',
    );

    const mergedProps = computed(() => {
      return {
        ...props,
        closable: props?.closable ?? contextClosable.value,
      };
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      DrawerClassNamesType,
      DrawerStylesType,
      DrawerPanelProps
    >(
      useToArr(contextClassNames, drawerClassNames),
      useToArr(contextStyles, drawerStyles),
      useToProps(mergedProps),
    );

    const closablePlacement = computed<'end' | 'start' | undefined>(() => {
      const merged = props?.closable ?? contextClosable.value;
      if (merged === false) {
        return undefined;
      }
      if (typeof merged === 'object' && merged.placement === 'end') {
        return 'end';
      }
      return 'start';
    });

    const customCloseIconRender = (icon: VueNode) => {
      icon = getSlotPropsFnRun({}, { icon }, 'icon');
      const { onClose, prefixCls } = props;
      return (
        <button
          class={clsx(
            `${prefixCls}-close`,
            {
              [`${prefixCls}-close-${closablePlacement.value}`]:
                closablePlacement.value === 'end',
            },
            mergedClassNames.value.close,
          )}
          onClick={onClose}
          style={mergedStyles.value.close}
          type="button"
        >
          {icon}
        </button>
      );
    };

    const closableInfo = useClosable(
      pickClosable(
        computed(() => {
          return {
            closable: props.closable,
            closeIcon: slots?.closeIcon ?? props.closeIcon,
          };
        }),
      ) as any,
      pickClosable(
        computed(() => {
          return {
            closable: contextClosable.value,
            closeIcon: contextCloseIcon.value,
          };
        }),
      ) as any,
      computed(() => {
        return {
          closable: true,
          closeIconRender: customCloseIconRender,
        };
      }) as any,
    );
    return () => {
      const {
        headerStyle,
        prefixCls,
        ariaId,
        bodyStyle,
        loading,
        footerStyle,
      } = props;
      const title = getSlotPropsFnRun(slots, props, 'title');
      const footer = getSlotPropsFnRun(slots, props, 'footer');
      const extra = getSlotPropsFnRun(slots, props, 'extra');
      const [mergedClosable, mergedCloseIcon] = closableInfo.value!;
      const renderHeader = () => {
        if (!title && !mergedClosable) {
          return null;
        }
        return (
          <div
            class={clsx(`${prefixCls}-header`, mergedClassNames.value.header, {
              [`${prefixCls}-header-close-only`]:
                mergedClosable && !title && !extra,
            })}
            style={{
              ...mergedStyles.value?.header,
              ...headerStyle,
            }}
          >
            <div class={`${prefixCls}-header-title`}>
              {closablePlacement.value === 'start' && mergedCloseIcon}
              {!!title && (
                <div
                  class={clsx(
                    `${prefixCls}-title`,
                    mergedClassNames.value.title,
                  )}
                  id={ariaId}
                  style={mergedStyles.value.title}
                >
                  {title}
                </div>
              )}
              {!!extra && (
                <div
                  class={clsx(
                    `${prefixCls}-extra`,
                    mergedClassNames.value.extra,
                  )}
                  style={mergedStyles.value.extra}
                >
                  {extra}
                </div>
              )}
            </div>
            {closablePlacement.value === 'end' && mergedCloseIcon}
          </div>
        );
      };

      const renderFooter = () => {
        if (!footer) {
          return null;
        }
        return (
          <div
            class={clsx(`${prefixCls}-footer`, mergedClassNames.value.footer)}
            style={[mergedStyles.value.footer, footerStyle]}
          >
            {footer}
          </div>
        );
      };
      return (
        <>
          {renderHeader()}
          <div
            class={clsx(`${prefixCls}-body`, mergedClassNames.value.body)}
            style={{
              ...mergedStyles.value.body,
              ...bodyStyle,
            }}
          >
            {loading ? (
              <Skeleton
                active
                class={`${prefixCls}-body-skeleton`}
                paragraph={{ rows: 5 }}
                title={false}
              />
            ) : (
              slots?.default?.()
            )}
          </div>
          {renderFooter()}
        </>
      );
    };
  },
  {
    name: 'DrawerPanel',
    inheritAttrs: false,
  },
);

export default DrawerPanel;
