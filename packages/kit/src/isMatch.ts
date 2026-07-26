import findIndexOf from './findIndexOf';
import includeArrays from './includeArrays';
import isEqual from './isEqual';
import keys from './keys';
import some from './some';

/**
 * 判断属性中的键和值是否包含在对象中
 * @param obj 对象
 * @param source 值
 */
function isMatch(obj: any, source: any): boolean {
  const objKeys = keys(obj);
  const sourceKeys = keys(source);
  if (sourceKeys.length > 0) {
    if (includeArrays(objKeys, sourceKeys)) {
      return some(sourceKeys, (key2: any) => {
        return (
          (findIndexOf(objKeys, (key1: any) => {
            return key1 === key2 && isEqual(obj[key1], source[key2]);
          }) as number) > -1
        );
      });
    }
  } else {
    return true;
  }
  return isEqual(obj, source);
}

export default isMatch;
