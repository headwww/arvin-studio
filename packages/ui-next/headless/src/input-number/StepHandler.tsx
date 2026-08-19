/**
 *
 * 上下步进按钮（spinner 的 ▲/▼）：
 * - 单击触发一次 step；
 * - **按住不放**：延迟 STEP_DELAY(600ms) 后进入 STEP_INTERVAL(200ms) 的循环步进
 *   （鼠标松开/移出停止）；
 * - 用 <span role="button"> 而非原生 button：配合 onMousedown preventDefault
 *   避免抢焦点/触发 input 的 blur；
 * - 无自定义内容时渲染一个空 span（样式层画箭头），可被 upHandler/downHandler 插槽替换。
 */
import type { SlotsType } from 'vue';

import { defineComponent, onUnmounted, ref } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { filterEmpty, raf } from '../util';

/**
 * When click and hold on a button - the speed of auto changing the value.
 * 按住时自动步进的间隔
 */
const STEP_INTERVAL = 200;

/**
 * When click and hold on a button - the delay before auto changing the value.
 * 按住后进入自动步进前的延迟
 */
const STEP_DELAY = 600;

export interface StepHandlerProps {
  action: 'down' | 'up';
  className?: string;
  disabled?: boolean;
  onStep: (up: boolean, emitter: 'handler' | 'keyboard' | 'wheel') => void;
  prefixCls: string;
  style?: any;
}

export default defineComponent({
  name: 'StepHandler',
  props: {
    prefixCls: { type: String, required: true },
    action: { type: String as () => 'down' | 'up', required: true },
    disabled: { type: Boolean, default: false },
    className: String,
    style: Object,
    onStep: { type: Function, required: true },
  },
  emits: ['step'],
  slots: Object as SlotsType<{
    default?: any;
  }>,
  setup(props, { slots, emit }) {
    // ======================== Step ========================
    const stepTimeoutRef = ref<any>(null);
    // 用 rAF 包裹的停止调用（解决 Safari 事件顺序问题，见下方注释）
    const frameIds = ref<number[]>([]);

    const onStopStep = () => {
      clearTimeout(stepTimeoutRef.value);
    };

    // We will interval update step when hold mouse down
    // 按住鼠标：先立即步进一次，再延迟后进入循环步进
    const onStepMouseDown = (e: MouseEvent, up: boolean) => {
      e.preventDefault();
      onStopStep();

      emit('step', up, 'handler');

      // Loop step for interval
      // 循环步进：每 STEP_INTERVAL 触发一次
      function loopStep() {
        emit('step', up, 'handler');
        stepTimeoutRef.value = setTimeout(loopStep, STEP_INTERVAL);
      }

      // First time press will wait some time to trigger loop step update
      // 首次按住先等 STEP_DELAY，再开始循环
      stepTimeoutRef.value = setTimeout(loopStep, STEP_DELAY);
    };

    // 卸载时清理定时器与未执行帧
    onUnmounted(() => {
      onStopStep();
      frameIds.value.forEach((id) => raf.cancel(id));
    });

    return () => {
      const { prefixCls, action, disabled, className, style } = props;
      const isUpAction = action === 'up';

      const actionClassName = `${prefixCls}-action`;
      const mergedClassName = clsx(
        actionClassName,
        `${actionClassName}-${action}`,
        {
          [`${actionClassName}-${action}-disabled`]: disabled,
        },
        className,
      );

      // eslint-disable-next-line unicorn/no-return-array-push
      const safeOnStopStep = () => frameIds.value.push(raf(onStopStep));
      const children = filterEmpty(slots?.default?.());
      return (
        <span
          aria-disabled={disabled}
          aria-label={isUpAction ? 'Increase Value' : 'Decrease Value'}
          class={mergedClassName}
          onMousedown={(e: MouseEvent) => onStepMouseDown(e, isUpAction)}
          onMouseleave={safeOnStopStep}
          onMouseup={safeOnStopStep}
          role="button"
          style={style}
          unselectable="on"
        >
          {/* 自定义内容优先；缺省渲染空 span（样式层绘制箭头） */}
          {children.length > 0 ? (
            children
          ) : (
            <span
              class={`${prefixCls}-action-${action}-inner`}
              unselectable="on"
            />
          )}
        </span>
      );
    };
  },
});
