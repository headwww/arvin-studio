import helperCreateIterateHandle from './helperCreateIterateHandle';

/**
 * 判断是否所有项都匹配
 * @param list 数组
 * @param iterate 回调
 * @param context 上下文
 */
function every<T, C = any>(
  list: T[] | undefined,
  iterate: (this: C, item: T, index: number, list: T[]) => boolean,
  context?: C,
): boolean;

function every(obj: any, iterate: any, context?: any): any {
  return helperCreateIterateHandle(
    'every',
    true,
    1,
    false,
    true,
  )(obj, iterate, context);
}

export default every;
