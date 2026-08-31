/* eslint-disable no-useless-assignment */
import type { CSSProperties } from 'vue';

import type {
  SplitterProps,
  SplitterSemanticDraggerClassNames,
} from './interface';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import {
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  UpOutlined,
} from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { genCssVar } from '../theme/util/genStyleUtils';

export type ShowCollapsibleIconMode = 'auto' | boolean;

export interface SplitBarProps {
  active: boolean;
  ariaMax: number;
  ariaMin: number;
  ariaNow: number;
  collapsibleIcon?: SplitterProps['collapsibleIcon'];
  containerSize: number;
  draggerClassName?: SplitterSemanticDraggerClassNames;
  draggerIcon?: SplitterProps['draggerIcon'];
  draggerStyle?: CSSProperties;
  endCollapsible: boolean;
  index: number;
  lazy?: boolean;
  onCollapse: (index: number, type: 'end' | 'start') => void;
  onDraggerDoubleClick?: (index: number) => void;
  onOffsetEnd: (lazyEnd?: boolean) => void;
  onOffsetStart: (index: number) => void;
  onOffsetUpdate: (
    index: number,
    offsetX: number,
    offsetY: number,
    lazyEnd?: boolean,
  ) => void;
  prefixCls: string;
  resizable: boolean;
  rootPrefixCls: string;
  showEndCollapsibleIcon: ShowCollapsibleIconMode;
  showStartCollapsibleIcon: ShowCollapsibleIconMode;
  startCollapsible: boolean;
  vertical: boolean;
}

function getValidNumber(num?: number): number {
  return typeof num === 'number' && !Number.isNaN(num) && Number.isFinite(num)
    ? Math.round(num)
    : 0;
}

const DOUBLE_CLICK_TIME_GAP = 300;

const SplitBar = defineComponent<SplitBarProps>(
  (props, { slots, attrs }) => {
    const {
      vertical,
      resizable,
      index,
      containerSize,
      ariaNow,
      ariaMin,
      ariaMax,
      prefixCls,
      rootPrefixCls,
      lazy,
    } = toPropsRefs(
      props,
      'vertical',
      'resizable',
      'index',
      'containerSize',
      'ariaNow',
      'ariaMin',
      'ariaMax',
      'prefixCls',
      'rootPrefixCls',
      'lazy',
    );

    const splitBarPrefixCls = computed(() => `${prefixCls.value}-bar`);
    const lastClickTimeRef = shallowRef<number>(0);
    const barVarName = computed(
      () => genCssVar(rootPrefixCls.value, 'splitter')[0],
    );
    // ======================== Resize ========================
    const startPos = shallowRef<[x: number, y: number]>();
    const constrainedOffset = shallowRef(0);

    const constrainedOffsetX = computed(() =>
      vertical.value ? 0 : constrainedOffset.value,
    );
    const constrainedOffsetY = computed(() =>
      vertical.value ? constrainedOffset.value : 0,
    );
    const onMouseDown = (event: MouseEvent) => {
      event.stopPropagation();
      const currentTime = Date.now();
      const timeGap = currentTime - lastClickTimeRef.value;

      if (timeGap > 0 && timeGap < DOUBLE_CLICK_TIME_GAP) {
        // Prevent drag start if it's a double-click action
        return;
      }

      lastClickTimeRef.value = currentTime;
      if (resizable.value && event.currentTarget) {
        startPos.value = [event.pageX, event.pageY];
        props?.onOffsetStart?.(index.value);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!(resizable.value && e.touches.length === 1)) {
        return;
      }

      const touch = e.touches[0]!;
      startPos.value = [touch.pageX, touch.pageY];
      props?.onOffsetStart?.(index.value);
    };

    // Updated constraint calculation
    const getConstrainedOffset = (rawOffset: number) => {
      const currentPos = (containerSize.value * ariaNow.value) / 100;
      const newPos = currentPos + rawOffset;

      // Calculate available space
      const minAllowed = Math.max(
        0,
        (containerSize.value * ariaMin.value) / 100,
      );
      const maxAllowed = Math.min(
        containerSize.value,
        (containerSize.value * ariaMax.value) / 100,
      );
      // Constrain new position within bounds
      const clampedPos = Math.max(minAllowed, Math.min(maxAllowed, newPos));
      return clampedPos - currentPos;
    };

    const handleLazyMove = (offsetX: number, offsetY: number) => {
      constrainedOffset.value = getConstrainedOffset(
        vertical.value ? offsetY : offsetX,
      );
    };

    const handleLazyEnd = () => {
      props?.onOffsetUpdate?.(
        index.value,
        constrainedOffsetX.value,
        constrainedOffsetY.value,
        true,
      );
      constrainedOffset.value = 0;
      props?.onOffsetEnd?.(true);
    };

    const getVisibilityClass = (mode: ShowCollapsibleIconMode): string => {
      switch (mode) {
        case true: {
          return `${splitBarPrefixCls.value}-collapse-bar-always-visible`;
        }
        case false: {
          return `${splitBarPrefixCls.value}-collapse-bar-always-hidden`;
        }
        case 'auto': {
          return `${splitBarPrefixCls.value}-collapse-bar-hover-only`;
        }
      }
    };

    watch(
      [startPos, index, lazy],
      (_n, _o, onCleanup) => {
        if (!startPos.value) {
          return;
        }

        const onMouseMove = (e: MouseEvent) => {
          const { pageX, pageY } = e;
          const offsetX = pageX - startPos.value![0]!;
          const offsetY = pageY - startPos.value![1]!;

          if (lazy.value) {
            handleLazyMove(offsetX, offsetY);
          } else {
            props?.onOffsetUpdate?.(index.value, offsetX, offsetY);
          }
        };

        const onMouseUp = () => {
          if (lazy.value) {
            handleLazyEnd();
          } else {
            props?.onOffsetEnd?.();
          }
          startPos.value = undefined;
        };
        const handleTouchMove = (e: TouchEvent) => {
          if (e.touches.length !== 1) {
            return;
          }

          const touch = e.touches[0]!;
          const offsetX = touch.pageX - startPos.value![0]!;
          const offsetY = touch.pageY - startPos.value![1]!;
          if (lazy.value) {
            handleLazyMove(offsetX, offsetY);
          } else {
            props?.onOffsetUpdate?.(index.value, offsetX, offsetY);
          }
        };

        const handleTouchEnd = () => {
          if (lazy.value) {
            handleLazyEnd();
          } else {
            props?.onOffsetEnd?.();
          }
          startPos.value = undefined;
        };

        const eventHandlerMap: Partial<
          Record<keyof WindowEventMap, EventListener>
        > = {
          mousemove: onMouseMove as EventListener,
          mouseup: onMouseUp,
          touchmove: handleTouchMove as EventListener,
          touchend: handleTouchEnd,
        };

        for (const [event, handler] of Object.entries(eventHandlerMap)) {
          window.addEventListener(event, handler);
        }

        onCleanup(() => {
          for (const [event, handler] of Object.entries(eventHandlerMap)) {
            window.removeEventListener(event, handler);
          }
        });
      },
      {
        immediate: true,
        flush: 'post',
      },
    );
    return () => {
      const {
        collapsibleIcon,
        draggerClassName,
        draggerStyle,
        active,
        startCollapsible,
        showStartCollapsibleIcon,
        onCollapse,
        endCollapsible,
        showEndCollapsibleIcon,
      } = props;
      const transformStyle: Record<string, any> = {
        [barVarName.value('bar-preview-offset')]:
          `${constrainedOffset.value}px`,
      };

      const propCollapsibleIconStart = collapsibleIcon?.start;
      const propCollapsibleIconEnd = collapsibleIcon?.end;

      const collapsibleIconStart = getSlotPropsFnRun(
        slots,
        { collapsibleIconStart: propCollapsibleIconStart },
        'collapsibleIconStart',
        false,
      );
      const collapsibleIconEnd = getSlotPropsFnRun(
        slots,
        { collapsibleIconEnd: propCollapsibleIconEnd },
        'collapsibleIconEnd',
        false,
      );
      const draggerIcon = getSlotPropsFnRun(slots, props, 'draggerIcon', false);
      // ======================== Render ========================
      const renderIconsFn = () => {
        let startIcon = null;
        let endIcon = null;

        const startCustomize = collapsibleIconStart !== undefined;
        const endCustomize = collapsibleIconEnd !== undefined;
        if (vertical.value) {
          startIcon = startCustomize ? collapsibleIconStart : <UpOutlined />;
          endIcon = endCustomize ? collapsibleIconEnd : <DownOutlined />;
        } else {
          startIcon = startCustomize ? collapsibleIconStart : <LeftOutlined />;
          endIcon = endCustomize ? collapsibleIconEnd : <RightOutlined />;
        }
        return [startIcon, endIcon, startCustomize, endCustomize];
      };
      const [startIcon, endIcon, startCustomize, endCustomize] =
        renderIconsFn();
      const onCollapseKeyDown = (e: KeyboardEvent, type: 'end' | 'start') => {
        if (!(e.key === 'Enter' || e.key === ' ')) {
          return;
        }

        e.preventDefault();
        onCollapse(index.value, type);
      };
      return (
        <div {...attrs} class={splitBarPrefixCls.value}>
          {lazy.value && (
            <div
              class={clsx(`${splitBarPrefixCls.value}-preview`, {
                [`${splitBarPrefixCls.value}-preview-active`]:
                  !!constrainedOffset.value,
              })}
              style={transformStyle}
            />
          )}

          <div
            aria-disabled={!resizable.value}
            aria-orientation={vertical.value ? 'horizontal' : 'vertical'}
            aria-valuemax={getValidNumber(ariaMax.value)}
            aria-valuemin={getValidNumber(ariaMin.value)}
            aria-valuenow={getValidNumber(ariaNow.value)}
            class={clsx(
              `${splitBarPrefixCls.value}-dragger`,
              {
                [`${splitBarPrefixCls.value}-dragger-disabled`]:
                  !resizable.value,
                [`${splitBarPrefixCls.value}-dragger-active`]: active,
                [`${splitBarPrefixCls.value}-dragger-customize`]:
                  draggerIcon !== undefined,
              },
              draggerClassName?.default,
              active && draggerClassName?.active,
            )}
            onDblclick={() => props?.onDraggerDoubleClick?.(index.value)}
            onMousedown={onMouseDown}
            onTouchstart={onTouchStart}
            role="separator"
            style={draggerStyle}
          >
            {draggerIcon === undefined ? null : (
              <div class={clsx(`${splitBarPrefixCls.value}-dragger-icon`)}>
                {draggerIcon}
              </div>
            )}
          </div>

          {/* Start Collapsible */}
          {startCollapsible && (
            <div
              aria-label="Toggle start panel"
              class={clsx(
                `${splitBarPrefixCls.value}-collapse-bar`,
                `${splitBarPrefixCls.value}-collapse-bar-start`,
                {
                  [`${splitBarPrefixCls.value}-collapse-bar-customize`]:
                    startCustomize,
                },
                getVisibilityClass(showStartCollapsibleIcon),
              )}
              onClick={() => onCollapse(index.value, 'start')}
              onKeydown={(e: KeyboardEvent) => onCollapseKeyDown(e, 'start')}
              role="button"
              tabindex={0}
            >
              <span
                class={clsx(
                  `${splitBarPrefixCls.value}-collapse-icon`,
                  `${splitBarPrefixCls.value}-collapse-start`,
                )}
              >
                {startIcon}
              </span>
            </div>
          )}

          {/* End Collapsible */}
          {endCollapsible && (
            <div
              aria-label="Toggle end panel"
              class={clsx(
                `${splitBarPrefixCls.value}-collapse-bar`,
                `${splitBarPrefixCls.value}-collapse-bar-end`,
                {
                  [`${splitBarPrefixCls.value}-collapse-bar-customize`]:
                    endCustomize,
                },
                getVisibilityClass(showEndCollapsibleIcon),
              )}
              onClick={() => onCollapse(index.value, 'end')}
              onKeydown={(e: KeyboardEvent) => onCollapseKeyDown(e, 'end')}
              role="button"
              tabindex={0}
            >
              <span
                class={clsx(
                  `${splitBarPrefixCls.value}-collapse-icon`,
                  `${splitBarPrefixCls.value}-collapse-end`,
                )}
              >
                {endIcon}
              </span>
            </div>
          )}
        </div>
      );
    };
  },
  {
    name: 'SplitBar',
    inheritAttrs: false,
  },
);

export default SplitBar;
