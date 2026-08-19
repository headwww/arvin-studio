import type { Ref } from 'vue';

import type { InputRef } from '@arvin-studio/headless';

import { onBeforeUnmount, onMounted } from 'vue';

/**
 * 清除密码输入框的 value 属性，以避免浏览器自动填充闪烁。
 */
export default function useRemovePasswordTimeout(
  inputRef: Ref<InputRef | null | undefined>,
  triggerOnMount = false,
) {
  const timeoutIds: Array<ReturnType<typeof setTimeout>> = [];

  const removePasswordTimeout = () => {
    const timer = setTimeout(() => {
      const input = inputRef.value?.input;
      if (
        input &&
        input.getAttribute('type') === 'password' &&
        input.hasAttribute('value')
      ) {
        input.removeAttribute('value');
      }
    }, 0);
    timeoutIds.push(timer);
  };

  onMounted(() => {
    if (triggerOnMount) {
      removePasswordTimeout();
    }
  });

  onBeforeUnmount(() => {
    timeoutIds.forEach((timer) => {
      clearTimeout(timer);
    });
    timeoutIds.length = 0;
  });

  return removePasswordTimeout;
}
