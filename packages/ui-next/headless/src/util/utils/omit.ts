/**
 * —— 剔除对象指定属性（浅拷贝）
 *
 * 基于浅拷贝删除 keys 中的属性，不修改原对象；
 * 返回类型为 Omit<T, K>（删除 K 后的类型），保持类型安全。
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  // 先浅拷贝，保证不修改调用方传入的对象
  const result = { ...obj };

  // 逐个删除目标属性（在浅拷贝上 delete，不影响原对象）
  keys.forEach((key) => {
    delete result[key];
  });

  return result;
}
