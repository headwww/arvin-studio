import staticParseInt from './staticParseInt';
import helperGetHGSKeys from './helperGetHGSKeys';
import helperCheckCopyKey from './helperCheckCopyKey';
import hasOwnProp from './hasOwnProp';

const sKeyRE = /(.+)?\[(\d+)\]$/;

/**
 * Blacklist certain keys to prevent Prototype Pollution
 * @param key - 要检查的键名
 */
function isPrototypePolluted(key: string): boolean {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

function setDeepProps(
  obj: any,
  key: string,
  isEnd: boolean,
  nextKey: string | null,
  value: any,
): any {
  if (obj[key]) {
    if (isEnd) {
      obj[key] = value;
    }
  } else {
    let rest: any;
    const currMatchs = key ? key.match(sKeyRE) : null;

    if (isEnd) {
      rest = value;
    } else {
      const nextMatchs = nextKey ? nextKey.match(sKeyRE) : null;
      if (nextMatchs && !nextMatchs[1]) {
        // 如果下一个属性为数组类型
        // oxlint-disable-next-line unicorn/no-new-array
        rest = new Array(staticParseInt(nextMatchs[2]!) + 1);
      } else {
        rest = {};
      }
    }

    if (currMatchs) {
      if (currMatchs[1]) {
        // 如果为对象中数组
        const index = staticParseInt(currMatchs[2]!);
        if (obj[currMatchs[1]]) {
          if (isEnd) {
            obj[currMatchs[1]][index] = rest;
          } else {
            if (obj[currMatchs[1]][index]) {
              rest = obj[currMatchs[1]][index];
            } else {
              obj[currMatchs[1]][index] = rest;
            }
          }
        } else {
          // oxlint-disable-next-line unicorn/no-new-array
          obj[currMatchs[1]] = new Array(index + 1);
          obj[currMatchs[1]][index] = rest;
        }
      } else {
        // 如果为数组
        obj[currMatchs[2]!] = rest;
      }
    } else {
      // 如果为对象
      obj[key] = rest;
    }
    return rest;
  }
  return obj[key];
}

/**
 * 设置对象属性上的值。如果属性不存在则创建它
 *
 * @param obj - 对象
 * @param property - 键、路径
 * @param value - 值
 * @returns 原对象
 */
function set(obj: any, property: string | string[], value: any): any;
function set(obj: any, property: any, value: any): any;
function set(obj: any, property: any, value: any): any {
  if (obj && helperCheckCopyKey(property)) {
    if (
      (obj[property] || hasOwnProp(obj, property)) &&
      !isPrototypePolluted(property)
    ) {
      obj[property] = value;
    } else {
      let rest = obj;
      const props = helperGetHGSKeys(property);
      const len = props.length;

      for (let index = 0; index < len; index++) {
        if (isPrototypePolluted(props[index]!)) {
          continue;
        }
        const isEnd = index === len - 1;
        rest = setDeepProps(
          rest,
          props[index]!,
          isEnd,
          isEnd ? null : props[index + 1]!,
          value,
        );
      }
    }
  }
  return obj;
}

export default set;
