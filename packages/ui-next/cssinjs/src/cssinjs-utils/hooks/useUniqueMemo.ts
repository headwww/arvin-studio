/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  useUniqueMemo — 跨组件实例的共享记忆化 Hook
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 与 Vue 的 computed 不同，computed 是"每个组件实例独立"的缓存。
 * useUniqueMemo 是"整个应用全局共享"的缓存——同一个 deps 组合，
 * 所有组件实例返回同一个值，memoFn 只执行一次。
 *
 * 适用场景：返回值是纯函数式对象（无状态、不可变），如 genCalc 计算器。
 * 不适用于：存储组件私有状态的场景。
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  ArrayKeyMap — 支持数组 key 的 Map，带自动过期清理
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   key 的构造：deps 数组 → 每个元素转为 "类型_值" → 用 "|" 拼接。
 *   原始类型用值本身，对象用 WeakMap 分配的自增 ID。
 *
 *   内存管理：每 10000 次操作触发一次清理，
 *   删除 10 分钟内未访问的条目（避免长期运行应用内存泄漏）。
 */
const BEAT_LIMIT = 1000 * 60 * 10; // 10 分钟过期阈值

class ArrayKeyMap<T> {
  private accessBeat = 0; // 访问计数器，超过 10000 触发清理

  /** 记录每个 key 的最后访问时间（用于过期清理） */
  private lastAccessBeat = new Map<string, number>();

  /** 实际存储：compositeKey → value */
  private map = new Map<string, T>();

  private nextID = 0;
  /** 给每个对象分配唯一 ID（WeakMap 确保对象被 GC 时 ID 自动释放） */
  private objectIDMap = new WeakMap<object, number>();

  get(keys: unknown[]) {
    const compositeKey = this.getCompositeKey(keys);
    const cache = this.map.get(compositeKey);
    if (cache !== undefined) {
      // 更新最后访问时间（续期）
      this.lastAccessBeat.set(compositeKey, Date.now());
    }
    this.accessBeat += 1;
    return cache;
  }

  set(keys: unknown[], value: T) {
    // 写入前先尝试清理过期条目
    this.clear();
    const compositeKey = this.getCompositeKey(keys);
    this.map.set(compositeKey, value);
    this.lastAccessBeat.set(compositeKey, Date.now());
  }

  /**
   * 定期清理过期条目。
   * 每 10000 次访问触发一次，删除 lastAccessBeat > 10 分钟的条目。
   * 不删得太频繁是为了平衡清理开销和内存占用。
   */
  // eslint-disable-next-line unicorn/consistent-class-member-order
  private clear() {
    // eslint-disable-next-line unicorn/no-negated-comparison
    if (!(this.accessBeat > 10_000)) {
      return;
    }

    const now = Date.now();
    this.lastAccessBeat.forEach((beat, key) => {
      // eslint-disable-next-line unicorn/no-negated-comparison
      if (!(now - beat > BEAT_LIMIT)) {
        return;
      }

      this.map.delete(key);
      this.lastAccessBeat.delete(key);
    });
    this.accessBeat = 0;
  }

  /**
   * 将 deps 数组转换为唯一的字符串 key。
   *
   * @example
   *   ['css', 'Button', 'as'] → "string_css|string_Button|string_ant"
   *   [{}]                     → "obj_0"
   */
  private getCompositeKey(keys: unknown[]) {
    return keys
      .map((key) => {
        if (key && typeof key === 'object') {
          return `obj_${this.getObjectID(key as object)}`;
        }
        return `${typeof key}_${String(key)}`;
      })
      .join('|');
  }

  /**
   * 为对象分配唯一 ID。
   * 使用 WeakMap 存储，当对象被垃圾回收时，对应的 ID 条目也自动释放。
   */
  private getObjectID(obj: object) {
    if (this.objectIDMap.has(obj)) {
      return this.objectIDMap.get(obj) as number;
    }
    const id = this.nextID;
    this.objectIDMap.set(obj, id);
    this.nextID += 1;
    return id;
  }
}

/** 模块级单例 Map，整个应用共享同一个缓存空间 */
const uniqueMap = new ArrayKeyMap<unknown>();

/**
 * 跨组件实例的共享记忆化函数。
 *
 * 原理：用模块级 Map 按 deps 缓存结果。
 * deps 相同 → 直接返回缓存值（即使调用方是不同的组件实例）。
 * deps 不同 → 执行 memoFn，写入缓存并返回。
 *
 * @param memoFn - 工厂函数，只在缓存未命中时执行
 * @param deps - 依赖数组，按 === 和结构比较
 * @returns 缓存或新计算的值
 */
function useUniqueMemo<T>(memoFn: () => T, deps: unknown[]): T {
  const cachedValue = uniqueMap.get(deps);
  if (cachedValue !== undefined) {
    return cachedValue as T;
  }
  const newValue = memoFn();
  uniqueMap.set(deps, newValue);
  return newValue;
}

export default useUniqueMemo;
