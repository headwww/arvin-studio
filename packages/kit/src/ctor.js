var setupDefaults = require('./setupDefaults')

var arrayEach = require('./arrayEach')
var each = require('./each')
var isFunction = require('./isFunction')

var assign = require('./assign')

var AsKit = function () {}

function mixin () {
  arrayEach(arguments, function (methods) {
    each(methods, function (fn, name) {
      AsKit[name] = isFunction(fn) ? function () {
        var result = fn.apply(AsKit.$context, arguments)
        AsKit.$context = null
        return result
      } : fn
    })
  })
}

function setConfig (options) {
  return assign(setupDefaults, options)
}

function getConfig () {
  return setupDefaults
}

var version = '@VERSION'

AsKit.VERSION = version
AsKit.version = version
AsKit.mixin = mixin
AsKit.setup = setConfig
AsKit.setConfig = setConfig
AsKit.getConfig = getConfig

module.exports = AsKit
