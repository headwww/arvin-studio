/**
 * （React 生态 useMergedState 的 Vue 移植）
 *
 * 解决的问题：组件既要支持受控（外部传 value 并监听 onChange 回写），
 * 又要支持非受控（内部自己维护状态），useMergedState 把两者合并为一个
 * 对外"看起来总是有值"的 mergedValue。
 *
 * 与 useControlledState 的区别（两者容易混淆）：
 * - useControlledState 面向 v-model：setState 通过 emit('update:xxx') 回写，
 *   返回值直接就是外部传入的 state ref；
 * - useMergedState 面向回调：triggerChange 调用 option.onChange（不 emit），
 *   并支持 postState 对对外值做后处理，内部额外维护 innerValue。
 *
 * 值来源优先级：外部 value ref > defaultValue > defaultStateValue。
 */
import type { ComputedRef, Ref, UnwrapRef } from 'vue';

import { ref, toRaw, unref, watch, watchEffect } from 'vue';

/**
 * 合并外部受控值与内部状态
 *
 * @param defaultStateValue 兜底初始值；传函数时惰性求值
 * @param option 可选项：
 *   - defaultValue：非受控模式的初始值（优先级高于 defaultStateValue）；
 *   - value：外部受控 ref（有值时覆盖内部状态，成为唯一数据源）；
 *   - onChange：值变化回调（参数 newValue, prevValue）；
 *   - postState：对对外展示值做后处理（如把 null 归一化为 undefined）
 * @returns [mergedValue, triggerChange]
 *   - mergedValue：对外暴露的合并值（受控时跟随外部 value，否则跟随内部状态）；
 *   - triggerChange：更新内部状态并触发 onChange 的 setter
 */
export default function useMergedState<T, R = Ref<T>>(
  defaultStateValue: (() => T) | T,
  option?: {
    defaultValue?: (() => T) | T;
    onChange?: (val: T, prevValue: T) => void;
    postState?: (val: T) => T;
    value?: ComputedRef<T> | Ref<T> | Ref<UnwrapRef<T>>;
  },
): [R, (val: T) => void] {
  const { defaultValue, value = ref() } = option || {};
  // 初始值优先级 3：defaultStateValue（函数则惰性求值）
  let initValue: T =
    typeof defaultStateValue === 'function'
      ? (defaultStateValue as any)()
      : defaultStateValue;
  // 初始值优先级 1：外部受控 value 已有值（unref 解包后使用）
  if (value.value !== undefined) initValue = unref(value as any) as T;

  // 初始值优先级 2：defaultValue
  if (defaultValue !== undefined)
    initValue =
      typeof defaultValue === 'function'
        ? (defaultValue as any)()
        : defaultValue;

  // 内部真实状态（非受控时由 triggerChange 维护）
  const innerValue = ref(initValue) as Ref<T>;
  // 对外合并值：始终由 watchEffect 同步（受控取外部，非受控取内部）
  const mergedValue = ref(initValue) as Ref<T>;
  watchEffect(() => {
    // 外部受控值优先，否则回落到内部状态
    let val = value.value === undefined ? innerValue.value : value.value;
    // postState 后处理（如归一化/转换）
    if (option?.postState) val = option.postState(val as T);
    mergedValue.value = val as T;
  });

  /**
   * 更新值：写内部状态；仅当值确实变化（toRaw 去代理后比较，避免响应式包装干扰）
   * 且配置了 onChange 时触发回调
   */
  function triggerChange(newValue: T) {
    const preVal = mergedValue.value;
    innerValue.value = newValue;
    if (toRaw(mergedValue.value) !== newValue && option?.onChange)
      option.onChange(newValue, preVal);
  }

  // Effect of reset value to `undefined`
  // 外部 value 变化时同步内部状态（reset 语义：外部把值重置后，内部跟随）
  watch(value, () => {
    innerValue.value = value.value as T;
  });

  return [mergedValue as unknown as R, triggerChange];
}
