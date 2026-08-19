import { onUnmounted, ref } from 'vue';

import { raf } from '../../util';

/**
 * useFrame：rAF 去抖调度钩子
 *
 * 多次调用只保留**最后一次**（每次调用先取消上一个 rAF）：
 * 用于"输入后的下一帧再处理"的场景（如 collectInputValue 中把中文句号
 * 替换为小数点的延迟处理），避免连续输入时重复执行。
 */

/**
 * Always trigger latest once when call multiple time
 */
const useFrame = () => {
  const idRef = ref(0);

  const cleanUp = () => {
    raf.cancel(idRef.value);
  };

  // 卸载时取消未执行的帧
  onUnmounted(cleanUp);

  // 返回调度函数：取消上一个，注册最新的
  return (callback: () => void) => {
    cleanUp();

    idRef.value = raf(() => {
      callback();
    });
  };
};
export default useFrame;
