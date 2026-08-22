import type { CSSProperties } from 'vue';

import type { SegmentedValue } from './';

import {
  computed,
  defineComponent,
  onBeforeUnmount,
  shallowRef,
  Transition,
  watch,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getTransitionProps } from '../util';

type ThumbReact = null | {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

export interface MotionThumbInterface {
  containerRef: HTMLDivElement;
  direction?: 'ltr' | 'rtl';
  getValueIndex: (value: SegmentedValue) => number;
  motionName: string;
  onMotionEnd: VoidFunction;
  onMotionStart: VoidFunction;
  prefixCls: string;
  value: SegmentedValue;
  vertical?: boolean;
}

function calcThumbStyle(
  targetElement: HTMLElement | null | undefined,
  vertical?: boolean,
): ThumbReact {
  if (!targetElement) return null;

  const style: ThumbReact = {
    left: targetElement.offsetLeft,
    right:
      (targetElement.parentElement!.clientWidth as number) -
      targetElement.clientWidth -
      targetElement.offsetLeft,
    width: targetElement.clientWidth,
    top: targetElement.offsetTop,
    bottom:
      (targetElement.parentElement!.clientHeight as number) -
      targetElement.clientHeight -
      targetElement.offsetTop,
    height: targetElement.clientHeight,
  };

  if (vertical) {
    // Adjusts positioning and size for vertical layout by setting horizontal properties to 0 and using vertical properties from the style object.
    return {
      left: 0,
      right: 0,
      width: 0,
      top: style.top,
      bottom: style.bottom,
      height: style.height,
    };
  }

  return {
    left: style.left,
    right: style.right,
    width: style.width,
    top: 0,
    bottom: 0,
    height: 0,
  };
}

function toPX(value: number | undefined): string | undefined {
  return value === undefined ? undefined : `${value}px`;
}

const defaults = {
  vertical: false,
} as any;
const MotionThumb = defineComponent<MotionThumbInterface>(
  (props = defaults) => {
    const preValue = shallowRef(props.value);
    const prevStyle = shallowRef<ThumbReact>(null);
    const nextStyle = shallowRef<ThumbReact>(null);
    const motionKey = shallowRef(0);
    let asyncId: null | ReturnType<typeof setTimeout> = null;

    const clearAsync = () => {
      if (!asyncId) {
        return;
      }

      clearTimeout(asyncId);
      asyncId = null;
    };

    // =========================== Effect ===========================
    const findValueElement = (val: SegmentedValue) => {
      const getValueIndex = props.getValueIndex;
      const containerRef = props.containerRef;
      const prefixCls = props.prefixCls;
      const index = getValueIndex(val);
      const ele = containerRef?.querySelectorAll<HTMLDivElement>(
        `.${prefixCls}-item`,
      )[index];
      return ele?.offsetParent && ele;
    };

    watch(
      () => props.value,
      () => {
        if (preValue.value === props.value) {
          return;
        }

        clearAsync();
        const prev = findValueElement(preValue.value);
        const next = findValueElement(props.value);

        const calcPrevStyle = calcThumbStyle(prev, props.vertical);
        const calcNextStyle = calcThumbStyle(next, props.vertical);
        preValue.value = props.value;
        prevStyle.value = calcPrevStyle;
        nextStyle.value = calcNextStyle;
        motionKey.value += 1;
        if (prev && next) {
          props.onMotionStart?.();
        } else {
          props?.onMotionEnd?.();
        }
      },
      {
        immediate: true,
        flush: 'post',
      },
    );

    const thumbStart = computed(() => {
      if (props.vertical) {
        return toPX(prevStyle.value?.top ?? 0);
      }
      if (props.direction === 'rtl') {
        return toPX(-(prevStyle.value?.right as number));
      }
      return toPX(prevStyle.value?.left as number);
    });

    const thumbActive = computed(() => {
      if (props.vertical) {
        return toPX(nextStyle.value?.top ?? 0);
      }
      if (props.direction === 'rtl') {
        return toPX(-(nextStyle.value?.right as number));
      }
      return toPX(nextStyle.value?.left as number);
    });

    const isLatestMotion = (el: Element) => {
      return (
        Number((el as HTMLElement).dataset.motionKey ?? -1) === motionKey.value
      );
    };

    // =========================== Motion ===========================
    const onAppearStart = (_el: Element) => {
      clearAsync();
      const el = _el as HTMLElement;
      if (!isLatestMotion(el)) {
        return;
      }
      if (props.vertical) {
        el.style.transform = 'translateY(var(--thumb-start-top))';
        el.style.height = 'var(--thumb-start-height)';
        return;
      }
      el.style.transform = 'translateX(var(--thumb-start-left))';
      el.style.width = 'var(--thumb-start-width)';
    };

    const onAppearActive = (_el: Element) => {
      const el = _el as HTMLElement;
      if (!isLatestMotion(el)) {
        return;
      }
      clearAsync();
      asyncId = setTimeout(() => {
        if (!isLatestMotion(el)) {
          return;
        }
        if (props.vertical) {
          el.style.transform = 'translateY(var(--thumb-active-top))';
          el.style.height = 'var(--thumb-active-height)';
          return;
        }
        el.style.transform = 'translateX(var(--thumb-active-left))';
        el.style.width = 'var(--thumb-active-width)';
      }, 0);
    };

    const onVisibleChanged = (_el?: Element) => {
      if (_el && !isLatestMotion(_el)) {
        return;
      }
      clearAsync();
      prevStyle.value = null;
      nextStyle.value = null;
      props?.onMotionEnd?.();
    };
    onBeforeUnmount(() => {
      clearAsync();
    });
    return () => {
      const { prefixCls } = props;
      // =========================== Render ===========================
      // No need motion when nothing exist in queue
      if (!prevStyle.value || !nextStyle.value) {
        return null;
      }
      const transitionProps = getTransitionProps(props?.motionName, {
        onBeforeEnter: onAppearStart,
        onEnter: onAppearActive,
        onAfterEnter: onVisibleChanged,
        // key 变化时旧元素会触发 leave，需要立即隐藏防止出现两个 thumb
        onBeforeLeave: (el) => {
          (el as HTMLElement).style.display = 'none';
        },
        onLeave: (_el, done) => {
          done();
        },
      });
      const visible = true;
      const mergedStyle = {
        '--thumb-start-left': thumbStart.value,
        '--thumb-start-width': toPX(prevStyle.value?.width),
        '--thumb-active-left': thumbActive.value,
        '--thumb-active-width': toPX(nextStyle.value?.width),
        '--thumb-start-top': thumbStart.value,
        '--thumb-start-height': toPX(prevStyle.value?.height),
        '--thumb-active-top': thumbActive.value,
        '--thumb-active-height': toPX(nextStyle.value?.height),
      } as CSSProperties;
      return (
        <Transition {...transitionProps}>
          {visible ? (
            <div
              class={clsx(`${prefixCls}-thumb`)}
              data-motion-key={motionKey.value}
              key={motionKey.value}
              style={mergedStyle}
            />
          ) : null}
        </Transition>
      );
    };
  },
);

export default MotionThumb;
