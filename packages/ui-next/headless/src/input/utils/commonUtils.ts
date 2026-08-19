/**
 *  公共工具
 *
 * 核心问题：某些场景（清除、截断、受控回写）需要把"修改后的 value"
 * 塞进 onChange 的事件对象里。原生 Event.target 的 value 只读不可改，
 * 所以这里采用"克隆 target"方案：
 * - createPatchedTarget：克隆真实节点并写入新 value（detached，不污染真实 DOM），
 *   同时保留 selection 信息、把 setSelectionRange 转发回真实节点；
 * - buildSafeEvent：基于克隆 target 重建一个安全的合成事件（保留原始事件的
 *   关键字段与 preventDefault/stopPropagation，并附带 nativeEvent 引用）；
 * - 按需选择：需要改 value 用 cloneEvent（detached clone），
 *   不需要改 value 用 cloneEventWithTarget（直接挂真实 target，避免无谓克隆，
 *   参考 rc-input#175）。
 */
import type { BaseInputProps, InputProps } from '../interface';

/**
 * 克隆 target 并写入新 value（detached，不挂载到 DOM）
 * 保留：value、selectionStart/End；setSelectionRange 转发到真实节点
 */
function createPatchedTarget<E extends HTMLInputElement | HTMLTextAreaElement>(
  target: E,
  value: any,
): E {
  const patched = target.cloneNode(true) as E;
  patched.value = value;

  if (
    typeof target.selectionStart === 'number' &&
    typeof target.selectionEnd === 'number'
  ) {
    patched.selectionStart = target.selectionStart;
    patched.selectionEnd = target.selectionEnd;
  }

  // 保持外部 setSelectionRange 仍然作用在真实 target 上
  patched.setSelectionRange = (start, end, direction) => {
    target.setSelectionRange(start, end, direction as any);
  };

  return patched;
}

/**
 * 基于指定 target 重建安全事件对象：
 * 复制原生事件的关键字段 + target/currentTarget，
 * preventDefault/stopPropagation 绑定回原生事件，并保留 nativeEvent
 */
function buildSafeEvent<
  EventType extends Event,
  Element extends HTMLInputElement | HTMLTextAreaElement,
>(event: EventType, target: Element): EventType {
  const safeEvent: any = {
    type: (event as any)?.type,
    timeStamp: (event as any)?.timeStamp,
    bubbles: (event as any)?.bubbles,
    cancelable: (event as any)?.cancelable,
    composed: (event as any)?.composed,

    target,
    currentTarget: target,

    preventDefault: (event as any)?.preventDefault
      ? (event as any).preventDefault.bind(event)
      : undefined,
    stopPropagation: (event as any)?.stopPropagation
      ? (event as any).stopPropagation.bind(event)
      : undefined,
    stopImmediatePropagation: (event as any)?.stopImmediatePropagation
      ? (event as any).stopImmediatePropagation.bind(event)
      : undefined,

    nativeEvent: event,
  };

  return safeEvent as EventType;
}

// 需要修改 value 时，克隆一个带有新 value 的 target（detached），避免污染真实节点
/** 事件 + 新 value → 基于克隆 target 的安全事件（value 已被修改） */
function cloneEvent<
  EventType extends Event,
  Element extends HTMLInputElement | HTMLTextAreaElement,
>(event: EventType, target: Element, value: any): EventType {
  const patchedTarget = createPatchedTarget(target, value);
  return buildSafeEvent(event, patchedTarget);
}

// value 无需修改时，保持真实 target 挂载，避免使用 detached clone
// https://github.com/react-component/input/pull/175
/** 事件无需改 value → 基于真实 target 的安全事件（避免无谓克隆） */
function cloneEventWithTarget<
  EventType extends Event,
  Element extends HTMLInputElement | HTMLTextAreaElement,
>(event: EventType, target: Element): EventType {
  return buildSafeEvent(event, target);
}

/** 是否有前后 addon */
export function hasAddon(props: BaseInputProps | InputProps) {
  return !!(props.addonBefore || props.addonAfter);
}

/** 是否需要 affix-wrapper 包裹（前缀/后缀/清除按钮任一存在） */
export function hasPrefixSuffix(props: BaseInputProps | InputProps) {
  return !!(props.prefix || props.suffix || props.allowClear);
}

/**
 * 统一触发 onChange：
 * - click 类型事件（清除按钮）→ 值为 '' 的克隆事件
 * - 其他事件且提供了 targetValue：
 *   - 值确实变化 → 克隆事件（带新 value）
 *   - 值未变化 → 真实 target 事件
 * - file 类型 / 无 targetValue → 原样透传
 */
export function resolveOnChange<
  E extends HTMLInputElement | HTMLTextAreaElement,
>(
  target: E,
  e: CompositionEvent | Event | MouseEvent,
  onChange: ((event: Event) => void) | undefined,
  targetValue?: string,
) {
  if (!onChange) return;

  // 清除：值固定为 ''
  if ((e as any)?.type === 'click') {
    onChange(cloneEvent(e as any, target, ''));
    return;
  }

  if (target.type !== 'file' && targetValue !== undefined) {
    if (target.value === targetValue) {
      onChange(cloneEventWithTarget(e as any, target));
    } else {
      onChange(cloneEvent(e as any, target, targetValue));
    }
    return;
  }

  onChange(e);
}
