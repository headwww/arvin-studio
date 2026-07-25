import setupDefaults from './setupDefaults'
import round from './round'
import ceil from './ceil'
import floor from './floor'
import isNumber from './isNumber'
import toValueString from './toValueString'
import toFixed from './toFixed'
import toNumberString from './toNumberString'
import assign from './assign'

export interface CommafyOptions {
  /**
   * 分割位数，默认3
   */
  spaceNumber?: number
  /**
   * 分隔符，默认','
   */
  separator?: string
  /**
   * 只对 number 类型有效，小数位数,默认null
   */
  digits?: number
  /**
   * 只对 number 类型有效，四舍五入，默认true
   */
  round?: boolean
  /**
   * 只对 number 类型有效，向上舍入
   */
  ceil?: boolean
  /**
   * 只对 number 类型有效，向下舍入
   */
  floor?: boolean
}

/**
 * 数值千分位分隔符、小数点
 * @param num 数值/字符串
 * @param options 可选参数
 */
function commafy(num: string | number | null | undefined, options?: CommafyOptions): string {
  const opts = assign({}, (setupDefaults as any).commafyOptions, options)
  const optDigits = opts.digits
  const isNum = isNumber(num)
  let rest: any
  let result: any
  let isNegative: any
  let intStr: any
  let floatStr: any
  if (isNum) {
    rest = (opts.ceil ? ceil : (opts.floor ? floor : round))(num as number, optDigits)
    result = toNumberString(optDigits ? toFixed(rest, optDigits) : rest).split('.')
    intStr = result[0]
    floatStr = result[1]
    isNegative = intStr && rest < 0
    if (isNegative) {
      intStr = intStr.substring(1, intStr.length)
    }
  } else {
    rest = toValueString(num).replace(/,/g, '')
    result = rest ? [rest] : []
    intStr = result[0]
  }
  if (result.length) {
    return (isNegative ? '-' : '') + intStr.replace(new RegExp('(?=(?!(\\b))(.{' + (opts.spaceNumber || 3) + '})+$)', 'g'), (opts.separator || ',')) + (floatStr ? ('.' + floatStr) : '')
  }
  return rest
}

export default commafy
