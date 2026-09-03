/**
 * @v-c/util utils/watchState —— Vue 3 watch 状态工具
 *
 * 两个高阶工厂，都返回"包装后的渲染函数"：
 * - watchState：调用时把参数序列化为状态快照（JSON 字符串）一并传给 fn，
 *   fn 可拿快照判断状态是否变化（用于手动驱动的按需重渲染）；
 * - renderFirstTrigger：只允许第一次调用真正执行，之后调用直接忽略
 *   （"首帧渲染一次后不再触发"的守卫）。
 */
export function watchState() {
  // 最近一次的状态快照（JSON 字符串，跨调用保留）
  let states: any = [];
  return (fn: any, args: any[]) => {
    // 先序列化当前参数作为最新状态快照
    states = JSON.stringify(args);
    // 把参数与快照一起交给 fn（fn 可比较前后快照判断状态是否变化）
    return fn(args, states);
  };
}

/**
 * 首帧渲染守卫：包装渲染函数，只允许首次调用执行，之后静默忽略
 * 用于"仅首次渲染时生效"的副作用/渲染逻辑
 */
export function renderFirstTrigger() {
  // 只触发一次后不再出发
  let triggered = false;
  return (fn: any, args: any[]) => {
    if (triggered) {
      return;
    }

    triggered = true;
    return fn(args);
  };
}
