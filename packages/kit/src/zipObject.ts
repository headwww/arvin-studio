import values from './values';
import each from './each';

/**
 * 根据键数组、值数组对转换为对象
 *
 * @param props - 键数组
 * @param values - 值数组
 * @returns 转换后的对象
 */
function zipObject(props: any[], valuesArr: any[]): any;
function zipObject(props: any, valuesArr: any): any;
function zipObject(props: any, valuesArr: any): any {
  const result: Record<string, any> = {};
  const arr = valuesArr || [];

  each(values(props), function (val: any, key: string) {
    result[val] = arr[key];
  });

  return result;
}

export default zipObject;
