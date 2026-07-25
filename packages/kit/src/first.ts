import values from './values';

/**
 * 获取对象第一个值
 */
function first<T>(list: T[] | ArrayLike<T> | undefined): T;
function first(obj: any): any {
  return values(obj)[0];
}

export default first;
