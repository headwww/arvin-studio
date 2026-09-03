/**
 * usePrevious：追踪上一次值
 *
 * 接收一个取值函数（保证 watch 的 getter 形态），
 * 返回包含上一次值的 ref（首次执行为 undefined）。
 * 用于"从 A 状态切走"时判断是否真的发生了切换（如编辑态退出时还焦）。
 */
import { ref, watch } from 'vue';

function usePrevious<T>(value: () => T): { value: T | undefined } {
  const previous = ref<T>();
  watch(value, (_val, oldVal) => {
    previous.value = oldVal;
  });

  return previous;
}

export default usePrevious;
