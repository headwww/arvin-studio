import helperStringLowerCase from './helperStringLowerCase';
import helperStringSubstring from './helperStringSubstring';
import toValueString from './toValueString';

const kebabCacheMaps: Record<string, string> = {};

/**
 * 将带驼峰字符串转成字符串,例如： projectName 转为 project-name
 * @param str 字符串
 */
function kebabCase(str: string): string;
function kebabCase(str: any): string;
function kebabCase(str: any): string {
  const val = toValueString(str);
  if (kebabCacheMaps[val]) {
    return kebabCacheMaps[val];
  }
  if (/^[A-Z]+$/.test(val)) {
    return helperStringLowerCase(val);
  }
  let rest = val
    .replace(
      /^([a-z])([A-Z]+)([a-z]+)$/,
      (_: string, prevLower: string, upper: string, nextLower: string) => {
        const upperLen = upper.length;
        if (upperLen > 1) {
          return `${prevLower}-${helperStringLowerCase(helperStringSubstring(upper, 0, upperLen - 1))}-${helperStringLowerCase(helperStringSubstring(upper, upperLen - 1, upperLen))}${nextLower}`;
        }
        return helperStringLowerCase(`${prevLower}-${upper}${nextLower}`);
      },
    )
    .replace(
      /^([A-Z]+)([a-z]+)?$/,
      (_: string, upper: string, nextLower: string) => {
        const upperLen = upper.length;
        return helperStringLowerCase(
          `${helperStringSubstring(upper, 0, upperLen - 1)}-${helperStringSubstring(upper, upperLen - 1, upperLen)}${nextLower || ''}`,
        );
      },
    )
    .replaceAll(
      /([a-z]?)([A-Z]+)([a-z]?)/g,
      (
        _: string,
        prevLower: string,
        upper: string,
        nextLower: string,
        index: number,
      ) => {
        const upperLen = upper.length;
        if (upperLen > 1) {
          let prevStr = prevLower;
          if (prevLower) {
            prevStr += '-';
          }
          if (nextLower) {
            return `${(prevLower ? prevStr : '') + helperStringLowerCase(helperStringSubstring(upper, 0, upperLen - 1))}-${helperStringLowerCase(helperStringSubstring(upper, upperLen - 1, upperLen))}${nextLower}`;
          }
        }
        return (
          (prevLower || '') +
          (index ? '-' : '') +
          helperStringLowerCase(upper) +
          (nextLower || '')
        );
      },
    );
  rest = rest.replaceAll(
    /([-]+)/g,
    (_: string, flag: string, index: number) => {
      return index && index + flag.length < rest.length ? '-' : '';
    },
  );
  kebabCacheMaps[val] = rest;
  return rest;
}

export default kebabCase;
