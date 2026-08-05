export type KeyType = number | string;
type ValueType = [number, any]; // [times, realValue] // [引用次数, 真实值]

const SPLIT = '%';

/** 用 `SPLIT` 将多级 key 数组拼接成一个扁平字符串，作为 Map 的实际键 */
export function pathKey(keys: KeyType[]) {
  return keys.join(SPLIT);
}

/** 全局更新序号，单调递增，用于记录静态样式的插入顺序 */
let updateId = 0;

class Entity {
  /** @private 内部缓存 Map，请勿直接访问。key 为路径字符串，value 为 [引用次数, 真实值] */
  cache = new Map<string, ValueType>();
  /** 已被提取过的 key 集合，用于静态样式去重 */
  extracted: Set<string> = new Set();

  /** 当前缓存实例的唯一标识 */
  instanceId: string;

  /** @private 记录每个 key 最后一次更新时对应的全局 updateId，用于还原样式插入顺序 */
  updateTimes = new Map<string, number>();

  constructor(instanceId: string) {
    this.instanceId = instanceId;
  }

  /** 语义版读取：接受 key 数组，内部自动拼接路径后查询缓存 */
  get(keys: KeyType[]): null | ValueType {
    return this.opGet(pathKey(keys));
  }

  /** 快速版读取：直接接受已拼好的路径字符串，省去重复拼接开销 */
  opGet(keyPathStr: string): null | ValueType {
    return this.cache.get(keyPathStr) || null;
  }

  /**
   * 快速版更新：直接接受已拼好的路径字符串，省去重复拼接开销。
   * - valueFn 返回 null → 删除该缓存项及其更新记录
   * - valueFn 返回新值 → 写入缓存，并用当前 updateId 记录本次更新顺序，然后 updateId 自增
   */
  opUpdate(
    keyPathStr: string,
    valueFn: (origin: null | ValueType) => null | ValueType,
  ) {
    const prevValue = this.cache.get(keyPathStr)!;
    const nextValue = valueFn(prevValue);

    if (nextValue === null) {
      // 返回 null 表示删除：同时清除缓存和顺序记录
      this.cache.delete(keyPathStr);
      this.updateTimes.delete(keyPathStr);
    } else {
      // 写入新值，并记录本次更新的全局顺序
      this.cache.set(keyPathStr, nextValue);
      this.updateTimes.set(keyPathStr, updateId);
      updateId += 1;
    }
  }

  /** 语义版更新：接受 key 数组，内部自动拼接路径后执行更新 */
  update(
    keys: KeyType[],
    valueFn: (origin: null | ValueType) => null | ValueType,
  ) {
    return this.opUpdate(pathKey(keys), valueFn);
  }
}

export default Entity;
