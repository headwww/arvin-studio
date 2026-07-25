import each from './each';

function helperCreateGetObjects(
  name: string,
  getIndex: number,
): (obj: any) => any[] {
  const proMethod = (Object as any)[name];
  return function (obj: any): any[] {
    const result: any[] = [];
    if (obj) {
      if (proMethod) {
        return proMethod(obj);
      }
      each(
        obj,
        getIndex > 1
          ? function (key: string, _unused: any, _obj: any, ..._: any[]) {
              result.push([`${key}`, obj[key]]);
            }
          : function (...args: any[]) {
              result.push(args[getIndex]);
            },
      );
    }
    return result;
  };
}

export default helperCreateGetObjects;
