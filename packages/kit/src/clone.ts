import arrayEach from './arrayEach';
import objectEach from './objectEach';
import objectToString from './staticObjectToString';

function getCativeCtor(val: any, args?: any): any {
  // oxlint-disable-next-line no-proto
  const Ctor = val.__proto__.constructor;
  return args ? new Ctor(args) : new Ctor();
}

function handleValueClone(item: any, isDeep?: boolean): any {
  return isDeep ? copyValue(item, isDeep) : item;
}

function copyValue(val: any, isDeep?: boolean): any {
  if (val) {
    switch (objectToString.call(val)) {
      case '[object Arguments]':
      case '[object Array]': {
        const restArr: any[] = [];
        arrayEach(val, (item: any) => {
          restArr.push(handleValueClone(item, isDeep));
        });
        return restArr;
      }
      case '[object Date]':
      case '[object RegExp]': {
        return getCativeCtor(val, val.valueOf());
      }
      case '[object Map]': {
        const restMap: Map<any, any> = getCativeCtor(val);
        restMap.forEach((item: any, key: any) => {
          restMap.set(key, handleValueClone(item, isDeep));
        });
        return restMap;
      }
      case '[object Object]': {
        const restObj: Record<string, any> = Object.create(
          Object.getPrototypeOf(val),
        );
        objectEach(val, (item: any, key: string) => {
          restObj[key] = handleValueClone(item, isDeep);
        });
        return restObj;
      }
      case '[object Set]': {
        const restSet: Set<any> = getCativeCtor(val);
        restSet.forEach((item: any) => {
          restSet.add(handleValueClone(item, isDeep));
        });
        return restSet;
      }
    }
  }
  return val;
}

/**
 * 浅拷贝/深拷贝
 *
 * @param obj 对象
 */
function clone<T>(obj: T): T;

/**
 * 浅拷贝/深拷贝
 *
 * @param obj 对象
 * @param deep 是否深拷贝
 */
function clone<T>(obj: T, deep: boolean): T;

function clone(obj: any, deep?: boolean): any {
  if (obj) {
    return copyValue(obj, deep);
  }
  return obj;
}

export default clone;
