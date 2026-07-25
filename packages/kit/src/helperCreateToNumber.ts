/**
 * 创建字符串转数值函数
 */
function helperCreateToNumber(
  handle: (val: any) => number,
): (str: any) => number {
  return function (str: any): number {
    if (str) {
      const num = handle(str && str.replace ? str.replace(/,/g, '') : str);
      if (!isNaN(num)) {
        return num;
      }
    }
    return 0;
  };
}

export default helperCreateToNumber;
