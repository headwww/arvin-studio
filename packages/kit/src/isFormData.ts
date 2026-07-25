/* eslint-disable valid-typeof */
import staticStrUndefined from './staticStrUndefined';

/**
 * 判断是否 FormData 对象
 * @param val 值
 */
const supportFormData = typeof FormData !== staticStrUndefined;
function isFormData(val: any): val is FormData {
  return supportFormData && val instanceof FormData;
}

export default isFormData;
