import arrayEach from './arrayEach';
import clone from './clone';
import isArray from './isArray';
import keys from './keys';

const objectAssignFns = Object.assign;

function handleAssign(destination: any, args: any[], isClone?: boolean): any {
  const len = args.length;
  for (let index = 1; index < len; index++) {
    const source = args[index];
    arrayEach(
      keys(args[index]),
      isClone
        ? (key: string) => {
            destination[key] = clone(source[key], isClone as any);
          }
        : (key: string) => {
            destination[key] = source[key];
          },
    );
  }
  return destination;
}

/**
 * 将一个或多个源对象复制到目标对象中
 * @param target 目标对象
 * @param sources 要从中复制属性的一个或多个源对象
 */
function assign<T, U>(target: T, source1: U): T & U;
function assign<T, U, V>(target: T, source1: U, source2: V): T & U & V;
function assign<T, U, V, W>(
  target: T,
  source1: U,
  source2: V,
  source3: W,
): T & U & V & W;
function assign(target: any, ...sources: any[]): any;

function assign(target: any, ...sources: any[]): any {
  if (target) {
    const args = [target, ...sources];
    if (target === true) {
      if (args.length > 1) {
        target = isArray(args[1]) ? [] : {};
        return handleAssign(target, args, true);
      }
    } else {
      return objectAssignFns
        ? objectAssignFns(target, ...sources)
        : handleAssign(target, args);
    }
  }
  return target;
}

export default assign;
