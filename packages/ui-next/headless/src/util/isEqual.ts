/**
 *  深比较工具（isEqual）
 *
 * 递归比较两个对象字面量是否相等。算法思路：
 * 1. 引用相等（===）直接判定相等；
 * 2. 用 refSet 记录已访问的 a 引用，检测并处理循环引用
 *    （检测到环时给出警告并判为不相等，避免无限递归）；
 * 3. shallow 模式只比较第一层：递归深度 > 1 时直接返回 false；
 * 4. 数组：长度必须一致，再逐元素递归比较；
 * 5. 普通对象：键数量一致，且每个键的值递归相等；
 * 6. 其余类型（函数 / 非对象的原始值等）一律不相等。
 */
import warning from './warning';

/**
 * Deeply compares two object literals.
 * @param obj1 object 1
 * @param obj2 object 2
 * @param shallow shallow compare
 * 深比较两个对象字面量；shallow 为 true 时只比较第一层。
 */
function isEqual(obj1: any, obj2: any, shallow = false): boolean {
  // https://github.com/mapbox/mapbox-gl-js/pull/5979/files#diff-fde7145050c47cc3a306856efd5f9c3016e86e859de9afbd02c879be5067e58f
  // 记录本次比较中已访问过的 a 引用，用于检测循环引用
  const refSet = new Set<any>();
  /**
   * 递归比较核心
   * @param level 当前递归深度（shallow 模式据此判断是否已超过第一层）
   */
  function deepEqual(a: any, b: any, level = 1): boolean {
    // 循环引用检测：a 已访问过说明存在环，给出警告并判为不相等
    const circular = refSet.has(a);
    warning(!circular, 'Warning: There may be circular references');
    if (circular) return false;

    // 引用相等（含同一原始值）直接判定相等
    if (a === b) return true;

    // shallow 模式：只比较第一层，进入第二层后直接判为不相等
    if (shallow && level > 1) return false;

    // 记录 a，供更深层递归检测环
    refSet.add(a);
    const newLevel = level + 1;
    // 数组：长度必须一致，再逐元素递归
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;

      for (const [i, element] of a.entries()) {
        if (!deepEqual(element, b[i], newLevel)) return false;
      }
      return true;
    }
    // 普通对象：键数量一致，且每个键的值递归相等
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const keys = Object.keys(a);
      if (keys.length !== Object.keys(b).length) return false;

      return keys.every((key) => deepEqual(a[key], b[key], newLevel));
    }
    // other
    // 其余类型（函数等）不相等
    return false;
  }

  return deepEqual(obj1, obj2);
}

export default isEqual;
