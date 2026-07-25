/**
 * 判断对象自身属性中是否具有指定的属性
 * @param obj 对象
 * @param key 键值
 */
function hasOwnProp(obj: any, key: string | number): boolean {
  // oxlint-disable-next-line no-prototype-builtins
  return obj && obj.hasOwnProperty ? obj.hasOwnProperty(key) : false;
}

export default hasOwnProp;
