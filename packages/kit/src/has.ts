import staticHGKeyRE from './staticHGKeyRE';
import helperGetHGSKeys from './helperGetHGSKeys';
import hasOwnProp from './hasOwnProp';

type PropertyPath = undefined | null | number | number[] | string | string[];

/**
 * 检查键、路径是否是该对象的属性
 * @param obj 对象
 * @param property 键、路径
 */
function has(obj: any, property: PropertyPath): boolean {
  if (obj) {
    if (hasOwnProp(obj, property as string | number)) {
      return true;
    }
    const props: string[] = helperGetHGSKeys(property);
    const len = props.length;
    let rest = obj;
    for (let index = 0; index < len; index++) {
      let isHas = false;
      const prop = props[index];
      const matchs = prop ? prop.match(staticHGKeyRE) : null;
      if (matchs) {
        const arrIndex = matchs[1];
        const objProp = matchs[2];
        if (arrIndex) {
          if (rest[arrIndex] && hasOwnProp(rest[arrIndex], objProp!)) {
            isHas = true;
            rest = rest[arrIndex][objProp!];
          }
        } else {
          if (hasOwnProp(rest, objProp!)) {
            isHas = true;
            rest = rest[objProp!];
          }
        }
      } else {
        if (hasOwnProp(rest, prop!)) {
          isHas = true;
          rest = rest[prop!];
        }
      }
      if (isHas) {
        if (index === len - 1) {
          return true;
        }
      } else {
        break;
      }
    }
  }
  return false;
}

export default has;
