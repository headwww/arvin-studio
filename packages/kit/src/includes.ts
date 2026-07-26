import hasOwnProp from './hasOwnProp';

/**
 * 判断对象是否包含该值，成功返回 true 否则 false
 *
 * @param obj - 要检查的对象
 * @param val - 要查找的值
 * @returns 如果对象包含该值则返回 true，否则返回 false
 */
function includes(obj: any, val: any): boolean {
  if (obj) {
    if (obj.includes) {
      return obj.includes(val);
    }
    for (const key in obj) {
      if (hasOwnProp(obj, key) && val === obj[key]) {
        return true;
      }
    }
  }
  return false;
}

export default includes;
