/**
 *
 * 只在 dev（NODE_ENV !== 'production'）下输出警告，生产构建被完全跳过
 * （条件写在 if 里，便于 uglify/terser 做 DCE 优化）。
 * 能力：
 * - warning / note：基础警告与提示输出，可经 preMessage 注册的
 *   预处理函数链改写消息（返回 null 可阻止输出）；
 * - warningOnce / noteOnce：同一消息只警告一次（去重）；
 * - preMessage / resetWarned：注册消息预处理、重置去重记录。
 */
let warned: Record<string, boolean> = {};

/** 消息预处理函数：可改写或拦截（返回 null/undefined 则抑制）即将输出的消息 */
export type preMessageFn = (
  message: string,
  type: 'note' | 'warning',
) => null | number | string | undefined;

/** 已注册的消息预处理函数列表（按注册顺序依次执行） */
const preWarningFns: preMessageFn[] = [];

/**
 * Pre warning enable you to parse content before console.error.
 * Modify to null will prevent warning.
 * 注册消息预处理函数：在 console 输出前改写消息内容，返回 null 可阻止输出。
 */
export function preMessage(fn: preMessageFn) {
  preWarningFns.push(fn);
}

/**
 * 输出警告（dev 模式下 valid 为假时调用 console.error）
 * @param valid 条件成立时不警告
 * @param message 警告内容（输出前经预处理链改写）
 */
export function warning(valid: boolean, message: string) {
  // Support uglify
  // 条件前置便于压缩工具做死代码消除（生产环境整个 if 被删掉）
  // @ts-expect-error this is a global variable which injected by babel plugin
  // eslint-disable-next-line n/prefer-global/process
  if (process.env.NODE_ENV === 'production' || valid || console === undefined) {
    return;
  }

  // 依次经过所有预处理函数改写消息
  const finalMessage = preWarningFns.reduce(
    (msg, preMessageFn) => (preMessageFn as any)(msg ?? '', 'warning'),
    message,
  );

  // 预处理返回假值时抑制输出
  if (finalMessage) console.error(`Warning: ${finalMessage}`);
}

/**
 * 输出提示（dev 模式下 valid 为假时调用 console.warn，区别于 warning 的 error）
 * @param valid 条件成立时不提示
 * @param message 提示内容（输出前经预处理链改写）
 */
export function note(valid: boolean, message: string) {
  // Support uglify
  // 条件前置便于压缩工具做死代码消除（生产环境整个 if 被删掉）
  // @ts-expect-error this is a global variable which injected by babel plugin
  // eslint-disable-next-line n/prefer-global/process
  if (process.env.NODE_ENV === 'production' || valid || console === undefined) {
    return;
  }

  const finalMessage = preWarningFns.reduce(
    (msg, preMessageFn) => (preMessageFn as any)(msg ?? '', 'note'),
    message,
  );

  if (finalMessage) console.warn(`Note: ${finalMessage}`);
}

/** 清空去重记录：之后 warningOnce / noteOnce 可再次输出相同消息 */
export function resetWarned() {
  warned = {};
}

/**
 * 去重执行器：同一消息只调用一次 method（其余调用被静默跳过）
 * @param method 实际输出函数（如 warning / note）
 * @param valid 条件成立时不输出
 * @param message 消息内容（用作去重 key）
 */
export function call(
  method: (valid: boolean, message: string) => void,
  valid: boolean,
  message: string,
) {
  if (valid || warned[message]) {
    return;
  }

  method(false, message);
  warned[message] = true;
}

/** 同一消息只警告一次（去重版 warning） */
export function warningOnce(valid: boolean, message: string) {
  call(warning, valid, message);
}

/** 同一消息只提示一次（去重版 note） */
export function noteOnce(valid: boolean, message: string) {
  call(note, valid, message);
}

// 把配套工具挂到默认导出上，支持 import warningOnce from '...' 后直接调用
warningOnce.preMessage = preMessage;
warningOnce.resetWarned = resetWarned;
warningOnce.noteOnce = noteOnce;

/** 默认导出：去重版警告（含 preMessage / resetWarned / noteOnce 静态方法） */
export default warningOnce;
