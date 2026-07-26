import helperStringLowerCase from './helperStringLowerCase';
import helperStringSubstring from './helperStringSubstring';
import helperStringUpperCase from './helperStringUpperCase';
import toValueString from './toValueString';

const camelCacheMaps: Record<string, string> = {};

/**
 * 将带字符串转成驼峰字符串,例如： project-name 转为 projectName
 * @param str 字符串
 */
function camelCase(str: null | string | undefined): string {
  const val = toValueString(str);
  if (camelCacheMaps[val]) {
    return camelCacheMaps[val];
  }
  let strLen = val.length;
  let rest = val.replaceAll(
    /([-]+)/g,
    (_: string, flag: string, index: number) => {
      return index && index + flag.length < strLen ? '-' : '';
    },
  );
  strLen = rest.length;
  rest = rest
    .replaceAll(/([A-Z]+)/g, (_: string, upper: string, index: number) => {
      const upperLen = upper.length;
      const lowered = helperStringLowerCase(upper);
      if (index) {
        if (upperLen > 2 && index + upperLen < strLen) {
          return (
            helperStringUpperCase(helperStringSubstring(lowered, 0, 1)) +
            helperStringSubstring(lowered, 1, upperLen - 1) +
            helperStringUpperCase(
              helperStringSubstring(lowered, upperLen - 1, upperLen),
            )
          );
        }
        return (
          helperStringUpperCase(helperStringSubstring(lowered, 0, 1)) +
          helperStringSubstring(lowered, 1, upperLen)
        );
      }
      if (upperLen > 1 && index + upperLen < strLen) {
        return (
          helperStringSubstring(lowered, 0, upperLen - 1) +
          helperStringUpperCase(
            helperStringSubstring(lowered, upperLen - 1, upperLen),
          )
        );
      }
      return lowered;
    })
    .replaceAll(/(-[a-zA-Z])/g, (_: string, upper: string) => {
      return helperStringUpperCase(
        helperStringSubstring(upper, 1, upper.length),
      );
    });
  camelCacheMaps[val] = rest;
  return rest;
}

export default camelCase;
