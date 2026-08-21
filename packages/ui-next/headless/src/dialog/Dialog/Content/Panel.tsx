import type { CSSProperties } from 'vue';

import type { MouseEventHandler } from '../../../util';
import type { IDialogPropTypes } from '../../IDialogPropTypes';

import { computed, defineComponent, shallowRef } from 'vue';

import { clsx } from '@arvin-studio/kit';

import {
  getStylePxValue,
  pickAttrs,
  useFocusBoundaryProvider,
  useLockFocus,
} from '../../../util';
import { useGetRefContext } from '../../context';

export interface PanelProps extends Omit<IDialogPropTypes, 'getOpenCount'> {
  ariaId?: string;
  holderRef?: (el: HTMLDivElement) => void;
  /** Used for focus lock. When true and open, focus will lock into the panel */
  isFixedPos?: boolean;
  onMouseDown?: (e: MouseEvent) => void;
  onMouseUp?: MouseEventHandler;
  prefixCls: string;
}

export interface ContentRef {
  focus: () => void;
}

const Panel = defineComponent<PanelProps>(
  (props, { expose, slots }) => {
    // ================================= Refs =================================
    const { setPanel } = useGetRefContext();
    const internalRef = shallowRef<HTMLDivElement>();
    const mergeRefFun = (el: HTMLDivElement) => {
      internalRef.value = el;
      setPanel?.(el);
      props?.holderRef?.(el);
    };
    const [, registerAllowedElement] = useLockFocus(
      computed(
        () =>
          !!props.visible && !!props.isFixedPos && props.focusTrap !== false,
      ),
      () => internalRef.value!,
    );
    useFocusBoundaryProvider({
      registerAllowedElement,
    });
    expose({
      focus: () => {
        internalRef.value?.focus?.({ preventScroll: true });
      },
    });
    return () => {
      const {
        width,
        height,
        footer,
        prefixCls,
        classNames: modalClassNames,
        styles: modalStyles,
        title,
        closable,
        closeIcon,
        bodyProps,
        bodyStyle,
        ariaId,
        style,
        className,
        onClose,
        onMouseDown,
        onMouseUp,
        modalRender,
      } = props;
      // ================================ Style =================================
      const contentStyle: CSSProperties = {};
      if (width !== undefined) {
        contentStyle.width = getStylePxValue(width)!;
      }
      if (height !== undefined) {
        contentStyle.height = getStylePxValue(height)!;
      }

      // ================================ Render ================================
      const footerNode = footer ? (
        <div
          class={clsx(`${prefixCls}-footer`, modalClassNames?.footer)}
          style={{ ...modalStyles?.footer }}
        >
          {footer}
        </div>
      ) : null;

      const headerNode = title ? (
        <div
          class={clsx(`${prefixCls}-header`, modalClassNames?.header)}
          style={{ ...modalStyles?.header }}
        >
          <div
            class={clsx(`${prefixCls}-title`, modalClassNames?.title)}
            id={ariaId}
            style={{ ...modalStyles?.title }}
          >
            {title}
          </div>
        </div>
      ) : null;

      const closableFun = () => {
        if (typeof closable === 'object' && closable !== null) {
          return closable;
        }
        if (closable) {
          return {
            closeIcon: closeIcon ?? <span class={`${prefixCls}-close-x`} />,
          };
        }
        return {};
      };
      const closableObj = closableFun();

      const ariaProps = pickAttrs(closableObj, true);

      const closeBtnIsDisabled =
        typeof closable === 'object' && closable?.disabled;

      const closerNode = closable ? (
        <button
          aria-label="Close"
          onClick={onClose}
          type="button"
          {...ariaProps}
          class={clsx(`${prefixCls}-close`, modalClassNames?.close)}
          disabled={closeBtnIsDisabled}
          style={modalStyles?.close}
        >
          {closableObj.closeIcon}
        </button>
      ) : null;

      const content = (
        <div
          class={clsx(`${prefixCls}-container`, modalClassNames?.container)}
          style={modalStyles?.container}
        >
          {closerNode}
          {headerNode}

          <div
            class={clsx(`${prefixCls}-body`, modalClassNames?.body)}
            style={{ ...bodyStyle, ...modalStyles?.body }}
            {...bodyProps}
          >
            {slots?.default?.()}
          </div>
          {footerNode}
        </div>
      );

      const renderContent = () => {
        return modalRender ? modalRender(content) : content;
      };

      return (
        <div
          key="dialog-element"
          role="dialog"
          {...({
            'aria-labelledby': title ? ariaId : null,
          } as any)}
          aria-modal="true"
          class={[prefixCls, className]}
          onMousedown={onMouseDown}
          onMouseup={onMouseUp}
          ref={mergeRefFun}
          style={{ ...style, ...contentStyle }}
          tabindex={-1}
        >
          {renderContent()}
        </div>
      );
    };
  },
  {
    name: 'Panel',
    inheritAttrs: false,
  },
);

export default Panel;
