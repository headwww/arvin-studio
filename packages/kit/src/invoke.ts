import isArray from './isArray';
import map from './map';

function deepGetObj(obj: any, path: string[]): any {
  let index: any = 0;
  const len = path.length;
  let current = obj;
  while (current && index < len) {
    current = current[path[index++] as any];
  }
  return len && current ? current : 0;
}

/**
 * 在 list 的每个元素上执行方法，任何传递的额外参数都会在调用方法的时候传递给它
 *
 * @param list - 要遍历的数组
 * @param path - 方法路径（数组、字符串或函数）
 * @param args - 传递给方法的额外参数
 * @returns 每个元素上执行方法后的结果数组
 */
function invoke(
  list: any[] | undefined,
  path: ((this: any, ...args: any[]) => any) | string | string[],
  ...args: any[]
): any[];
function invoke(list: any, path: any, ...args: any[]): any[];
function invoke(list: any, path: any, ...args: any[]): any[] {
  let func: any;
  const params: any[] = [];
  const paths: string[] = [];
  let index = 0;

  // 收集所有额外参数
  for (; index < args.length; index++) {
    params.push(args[index]);
  }

  if (isArray(path)) {
    const len = path.length - 1;
    for (index = 0; index < len; index++) {
      paths.push(path[index]);
    }
    path = path[len];
  }

  return map(list, (context: any) => {
    let target = context;
    if (paths.length > 0) {
      target = deepGetObj(target, paths);
    }
    func = target[path] || path;
    if (func && func.apply) {
      return func.apply(target, params);
    }
    return undefined;
  });
}

export default invoke;
