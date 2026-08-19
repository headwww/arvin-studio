import { ref } from 'vue';

/**
 * 输入框光标位置记录/恢复
 *
 * 用途：输入框内容被程序改写（如 formatter 格式化、step 步进、precision 归一化）时，
 * 浏览器会把光标重置到末尾——本钩子在改写前记录光标上下文，改写后尽量恢复到原位。
 *
 * 恢复策略（按优先级）：
 * 1. 前缀没变 → 光标放在前缀之后；
 * 2. 后缀没变 → 光标放在"末尾 - 后缀长度"；
 * 3. 都变了 → 用原光标前的最后一个字符在新字符串里查找，定位到其后一位。
 */
/**
 * Keep input cursor in the correct position if possible.
 * Is this necessary since we have `formatter` which may mass the content?
 */
export default function useCursor(
  input: HTMLInputElement,
  focused: boolean,
): [() => void, () => void] {
  // 记录的光标上下文（记录时刻的选区 + 前后文本）
  const selectionRef = ref<null | {
    afterTxt?: string;
    beforeTxt?: string;
    end?: null | number;
    start?: null | number;
    value?: string;
  }>(null);

  /** 记录当前光标位置与上下文（改写内容前调用） */
  function recordCursor() {
    // Record position
    // 记录选区与前后文本
    try {
      const { selectionStart: start, selectionEnd: end, value } = input;
      const beforeTxt = value.substring(0, start!);
      const afterTxt = value.substring(end!);

      selectionRef.value = {
        start,
        end,
        value,
        beforeTxt,
        afterTxt,
      };
    } catch {
      // Fix error in Chrome:
      // Failed to read the 'selectionStart' property from 'HTMLInputElement'
      // https://stackoverflow.com/q/21177489/3040605
      // Chrome 在部分情况下读取 selectionStart 会抛错，静默忽略
    }
  }

  /**
   * Restore logic:
   *  1. back string same
   *  2. start string same
   * 恢复逻辑：见文件头三策略
   */
  function restoreCursor() {
    if (input && selectionRef.value && focused) {
      try {
        const { value } = input;
        const { beforeTxt, afterTxt, start } = selectionRef.value;

        let startPos = value.length;

        // 策略 1：前缀未变 → 光标放前缀之后
        if (beforeTxt && value.startsWith(beforeTxt)) {
          startPos = beforeTxt.length;
        }
        // 策略 2：后缀未变 → 光标放末尾减后缀长度处
        else if (afterTxt && value.endsWith(afterTxt)) {
          startPos = value.length - selectionRef.value.afterTxt!.length;
        }
        // 策略 3：都变了 → 用原光标前一个字符在新串中定位
        else {
          const beforeLastChar = beforeTxt![start! - 1];
          const newIndex = value.indexOf(beforeLastChar!, start! - 1);
          if (newIndex !== -1) {
            startPos = newIndex + 1;
          }
        }

        input.setSelectionRange(startPos, startPos);
      } catch (error: any) {
        console.warn(
          false,
          `Something warning of cursor restore. Please fire issue about this: ${error.message}`,
        );
      }
    }
  }

  return [recordCursor, restoreCursor];
}
