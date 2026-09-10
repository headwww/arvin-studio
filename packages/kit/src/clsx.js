/**
  * 解析单个类名值，支持字符串、数字、数组、对象
  *
  * @param {*} mix 类名值
  * @return {String}
  */
function toVal (mix) {
  var str = ''
  var index, len, y

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix
  } else if (typeof mix === 'object' && mix !== null) {
    if (Array.isArray(mix)) {
      for (index = 0, len = mix.length; index < len; index++) {
        if (!mix[index]) {
          continue
        }

        y = toVal(mix[index])
        if (y) {
          if (str) {
            str += ' '
          }
          str += y
        }
      }
    } else {
      for (y in mix) {
        if (!mix[y]) {
          continue
        }

        if (str) {
          str += ' '
        }
        str += y
      }
    }
  }

  return str
}

/**
  * 将多个类名合并成一个字符串, 例如: clsx('a', ['b', { c: true, d: false }]) 结果为 'a b c'
  *
  * @param {...*} inputs 类名, 支持字符串、数字、数组、对象
  * @return {String}
  */
function clsx () {
  var str = ''
  var index, len, x

  for (index = 0, len = arguments.length; index < len; index++) {
    if (!arguments[index]) {
      continue
    }

    x = toVal(arguments[index])
    if (x) {
      if (str) {
        str += ' '
      }
      str += x
    }
  }

  return str
}

module.exports = clsx
