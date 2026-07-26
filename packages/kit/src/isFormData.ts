import staticStrUndefined from './staticStrUndefined';

/**
 * 判断是否 FormData 对象
 * @param val 值
 */
// oxlint-disable-next-line valid-typeof
const supportFormData = typeof FormData !== staticStrUndefined;
function isFormData(val: any): val is FormData {
  return supportFormData && val instanceof FormData;
}

export default isFormData;
