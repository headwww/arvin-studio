/**
 * @稳定事件回调钩子（hooks/useEvent）
 *
 * 对标 React 的 useEvent：返回一个"始终指向最新回调"的引用，避免
 * 回调身份变化导致子组件、原生监听器重复订阅或 effect 反复触发。
 *
 * 实现思路：当前版本直接返回原 callback——因为 Vue 3 中组件的
 * props 读取是响应式的，渲染/事件处理器每次执行都能拿到最新值，
 * 不存在 React 里"闭包捕获旧值"的问题，所以无需维护 ref 转发层；
 * 保留该函数作为统一入口，为将来需要真正缓存稳定引用的场景
 * （如传给 addEventListener、避免依赖变化）预留实现空间。
 */
const useEvent = <T extends Function>(callback: T): T => {
  /* 恒等返回：Vue 响应式机制已保证 callback 始终是最新引用 */
  return callback;
};

export default useEvent;
