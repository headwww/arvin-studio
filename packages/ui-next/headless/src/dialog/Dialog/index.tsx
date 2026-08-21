import type { CSSProperties } from 'vue';

import type { IDialogPropTypes } from '../IDialogPropTypes';
import type { ContentRef } from './Content/Panel';

import { defineComponent, nextTick, shallowRef, useId, watch } from 'vue';

import { contains, pickAttrs, warning } from '../../util';
import { getMotionName } from '../util';
import Content from './Content';
import Mask from './Mask';

const defaults = {
  prefixCls: 'headless-dialog',
  visible: false,
  // keyboard: true,
  focusTriggerAfterClose: true,
  closable: true,
  mask: true,
  maskClosable: true,
  forceRender: false,
} as IDialogPropTypes;

const Dialog = defineComponent<IDialogPropTypes>(
  (props = defaults, { expose, slots }) => {
    // @ts-expect-error this is a global variable which injected by babel plugin
    // eslint-disable-next-line n/prefer-global/process
    if (process.env.NODE_ENV !== 'production') {
      ['wrapStyle', 'bodyStyle', 'maskStyle'].forEach((prop) => {
        warning(
          !(prop in props && (props as any)[prop]),
          `${prop} is deprecated, please use styles instead.`,
        );
      });
      if ('wrapClassName' in props && props.wrapClassName) {
        warning(
          false,
          `wrapClassName is deprecated, please use classNames instead.`,
        );
      }
    }

    const lastOutSideActiveElementRef = shallowRef<HTMLDivElement | null>(null);
    const wrapperRef = shallowRef<HTMLDivElement>();
    const contentRef = shallowRef<ContentRef>();
    const animatedVisible = shallowRef(props.visible);
    const isFixedPos = shallowRef(false);
    // ========================== Init ==========================
    const ariaId = useId();

    function saveLastOutSideActiveElementRef() {
      if (!contains(wrapperRef.value, (document as any).activeElement)) {
        lastOutSideActiveElementRef.value =
          document.activeElement as HTMLDivElement;
      }
    }
    function focusDialogContent() {
      if (!contains(wrapperRef.value, (document as any).activeElement)) {
        contentRef.value?.focus?.();
      }
    }

    // ========================= Events =========================
    function onDialogVisibleChanged(newVisible: boolean) {
      // Try to focus
      if (newVisible) {
        focusDialogContent();
      } else {
        const _animatedVisible = animatedVisible.value;
        // Clean up scroll bar & focus back
        animatedVisible.value = false;

        if (
          props.mask &&
          lastOutSideActiveElementRef.value &&
          props.focusTriggerAfterClose
        ) {
          try {
            lastOutSideActiveElementRef.value?.focus?.({ preventScroll: true });
          } catch {
            // Do nothing
          }
          lastOutSideActiveElementRef.value = null;
        }

        // Trigger afterClose only when change visible from true to false
        if (_animatedVisible) {
          props?.afterClose?.();
        }
      }

      props?.afterOpenChange?.(newVisible);
    }

    function onInternalClose(e: any) {
      props?.onClose?.(e);
    }

    // >>> Content
    const mouseDownOnMaskRef = shallowRef(false);

    // >>> Wrapper
    // Close only when element not on dialog
    let onWrapperClick: any = null;
    watch(
      () => props.maskClosable,
      () => {
        onWrapperClick = props.maskClosable
          ? (e: any) => {
              if (wrapperRef.value === e.target && mouseDownOnMaskRef.value) {
                onInternalClose(e);
              }
            }
          : null;
      },
      {
        immediate: true,
      },
    );

    function onWrapperMouseDown(e: MouseEvent) {
      mouseDownOnMaskRef.value = e.target === wrapperRef.value;
    }
    // function onWrapperKeyDown(e: any) {
    //   if (props.keyboard && e === KeyCode.ESC) {
    //     e.stopPropagation()
    //     onInternalClose(e)
    //   }
    // }

    // ========================= Effect =========================
    watch(
      () => props.visible,
      () => {
        if (props.visible) {
          mouseDownOnMaskRef.value = false;
          animatedVisible.value = true;
          saveLastOutSideActiveElementRef();
          nextTick(() => {
            const wrapEl = wrapperRef.value;
            if (wrapEl) {
              const computedStyle = getComputedStyle(wrapEl);
              isFixedPos.value = computedStyle.position === 'fixed';
            }
          });

          if (
            !getMotionName(
              props.prefixCls!,
              props.transitionName,
              props.animation,
            )
          ) {
            nextTick(() => {
              onDialogVisibleChanged(true);
            });
          }
        } else if (
          animatedVisible.value &&
          !getMotionName(
            props.prefixCls!,
            props.transitionName,
            props.animation,
          )
        ) {
          onDialogVisibleChanged(false);
        }
      },
      {
        immediate: true,
      },
    );

    expose({});
    return () => {
      const {
        zIndex,
        wrapStyle,
        wrapProps,
        wrapClassName,
        closable,
        // Dialog
        transitionName,
        animation,
        styles: modalStyles,
        prefixCls,
        rootClassName,
        visible,
        mask,
        maskAnimation,
        maskTransitionName,
        maskStyle,
        maskProps,
        classNames: modalClassNames,
        rootStyle,
      } = props;
      const mergedStyle: CSSProperties = {
        zIndex,
        ...wrapStyle,
        ...modalStyles?.wrapper,
        display: animatedVisible.value ? undefined : 'none',
      };

      // ========================= Render =========================
      return (
        <div
          class={[`${prefixCls}-root`, rootClassName]}
          style={rootStyle}
          {...pickAttrs(props, { data: true })}
        >
          <Mask
            className={modalClassNames?.mask}
            maskProps={maskProps}
            motionName={getMotionName(
              prefixCls!,
              maskTransitionName,
              maskAnimation,
            )}
            prefixCls={prefixCls!}
            style={{ zIndex, ...maskStyle, ...modalStyles?.mask }}
            visible={!!(mask && visible)}
          />
          <div
            class={[
              `${prefixCls}-wrap`,
              wrapClassName,
              modalClassNames?.wrapper,
            ]}
            onClick={onWrapperClick}
            onMousedown={onWrapperMouseDown}
            ref={wrapperRef}
            style={mergedStyle}
            {...wrapProps}
          >
            <Content
              {...{
                ...props,
                onClose: onInternalClose,
                onVisibleChanged: onDialogVisibleChanged,
              }}
              ariaId={ariaId}
              closable={closable}
              isFixedPos={isFixedPos.value}
              motionName={getMotionName(prefixCls!, transitionName, animation)!}
              prefixCls={prefixCls!}
              ref={contentRef}
              v-slots={slots}
              visible={!!visible}
            />
          </div>
        </div>
      );
    };
  },
  {
    name: 'Dialog',
  },
);

export default Dialog;
