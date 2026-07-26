/**
 * 获取一个指定范围内随机数
 * @param min 最小值
 * @param max 最大值
 */
function random(min: number, max: number): number {
  return min >= max
    ? min
    : (min = Math.trunc(min)) + Math.round(Math.random() * ((max || 9) - min));
}

export default random;
