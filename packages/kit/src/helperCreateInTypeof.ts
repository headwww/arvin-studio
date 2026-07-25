/* eslint-disable valid-typeof */

/**
 * 创建 typeof 类型判断函数
 */
function helperCreateInTypeof(type: string): (obj: any) => boolean {
  return function (obj: any): boolean {
    return typeof obj === type
  }
}

export default helperCreateInTypeof
