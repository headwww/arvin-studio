import staticWindow from './staticWindow';

/**
 * 判断是否 Window 对象
 * @param val 值
 */
function isWindow(val: any): val is Window {
  return !!(staticWindow && !!(val && val === val.window));
}

export default isWindow;
