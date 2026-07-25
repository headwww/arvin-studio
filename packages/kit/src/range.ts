/**
 * 序号列表生成函数
 *
 * @param start - 起始值
 * @param stop - 结束值
 * @param step - 自增值
 * @returns 序号列表
 */
function range(start: number, stop: number): number[];
function range(start: number, stop: number, step: number): number[];
function range(start: any, stop?: any, step?: any): number[] {
  const result: number[] = [];
  let index: number;
  // oxlint-disable-next-line prefer-const
  let len: number;

  // 处理 arguments: 如果只有一个参数，则 start=0, stop=该参数
  if (stop === undefined) {
    stop = start;
    start = 0;
  }

  index = start >> 0;
  len = stop >> 0;

  if (index < len) {
    const stepVal = step >> 0 || 1;
    for (; index < len; index += stepVal) {
      result.push(index);
    }
  }

  return result;
}

export default range;
