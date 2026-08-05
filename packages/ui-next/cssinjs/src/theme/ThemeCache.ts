import type { DerivativeFunc } from './interface';
import type Theme from './Theme';

/**
 * 嵌套 Map 结构，将派生函数数组拆解为多层路径存储。
 * 每一层用一个 DerivativeFunc 作为 key，最后一层存储 Theme 实例和访问时间。
 *
 * 示例：derivativeOption = [fn1, fn2]
 * cache
 *   └─ fn1 → { map:
 *                └─ fn2 → { value: [Theme实例, 访问时间] }
 *             }
 */
type ThemeCacheMap = Map<
  DerivativeFunc<any, any>,
  {
    // 指向下一层，非最后一个函数时使用
    map?: ThemeCacheMap;
    // 叶子节点：[Theme实例, 最后访问时间戳]
    value?: [Theme<any, any>, number];
  }
>;

/** 派生函数数组，作为缓存的逻辑 key */
type DerivativeOptions = DerivativeFunc<any, any>[];

/**
 * 判断两个派生函数数组是否完全相同（长度相同且每个函数引用相等）。
 * 用于 delete 时在 keys 数组中定位目标项。
 */
export function sameDerivativeOption(
  left: DerivativeOptions,
  right: DerivativeOptions,
) {
  if (left.length !== right.length) {
    return false;
  }
  for (const [i, element] of left.entries()) {
    if (element !== right[i]) {
      return false;
    }
  }
  return true;
}

/**
 * 主题实例缓存，带 LRU 淘汰策略。
 *
 * 相同的派生函数数组复用同一个 Theme 实例，避免重复创建带来的性能开销。
 * 当缓存数量超过 MAX_CACHE_SIZE + MAX_CACHE_OFFSET 时，
 * 淘汰最久未访问的那一项（访问时间最小的）。
 */
export default class ThemeCache {
  /**
   * 淘汰缓冲区大小。
   * 不在每次超出 MAX_CACHE_SIZE 就立即淘汰，
   * 而是等到超出 MAX_CACHE_SIZE + MAX_CACHE_OFFSET 时才清理一次，
   * 减少频繁淘汰的开销。
   */
  public static MAX_CACHE_OFFSET = 5;

  /** 缓存上限，超过此数量 + OFFSET 时触发淘汰 */
  public static MAX_CACHE_SIZE = 20;

  /** 嵌套 Map，存储实际的 Theme 实例，按派生函数路径索引 */
  private readonly cache: ThemeCacheMap;

  /**
   * 全局访问计数器，单调递增。
   * 每次读取或写入缓存时记录当前值到 value[1]，
   * 数值越小表示越久未访问，淘汰时优先删除。
   */
  private cacheCallTimes: number;

  /** 所有已缓存的派生函数数组，用于遍历和淘汰 */
  private keys: DerivativeOptions[];

  constructor() {
    this.cache = new Map();
    this.keys = [];
    this.cacheCallTimes = 0;
  }

  /**
   * 删除指定派生函数数组对应的缓存项。
   * 同时从 keys 中移除，并递归清理嵌套 Map 中的空节点。
   *
   * @returns 被删除的 Theme 实例，不存在时返回 undefined
   */
  public delete(
    derivativeOption: DerivativeOptions,
  ): Theme<any, any> | undefined {
    if (this.has(derivativeOption)) {
      // 从 keys 中移除
      this.keys = this.keys.filter(
        (item) => !sameDerivativeOption(item, derivativeOption),
      );
      // 递归清理嵌套 Map
      return this.deleteByPath(this.cache, derivativeOption);
    }
    return undefined;
  }

  /** 查找缓存的 Theme 实例，同时刷新访问时间（影响 LRU 淘汰顺序） */
  public get(derivativeOption: DerivativeOptions): Theme<any, any> | undefined {
    return this.internalGet(derivativeOption, true)?.[0];
  }

  /** 判断指定派生函数数组是否已有缓存（不刷新访问时间） */
  public has(derivativeOption: DerivativeOptions): boolean {
    return !!this.internalGet(derivativeOption);
  }

  /**
   * 写入缓存。
   * 若已存在则直接更新；若是新 key 且缓存已满，先淘汰最久未访问的一项再写入。
   */
  public set(
    derivativeOption: DerivativeOptions,
    value: Theme<any, any>,
  ): void {
    // 新 key：检查是否需要淘汰
    if (!this.has(derivativeOption)) {
      if (
        this.size() + 1 >
        ThemeCache.MAX_CACHE_SIZE + ThemeCache.MAX_CACHE_OFFSET
      ) {
        // 遍历所有 key，找到访问时间最小（最久未访问）的那一项
        const [targetKey] = this.keys.reduce<[DerivativeOptions, number]>(
          (result, key) => {
            const [, callTimes] = result;
            if (this.internalGet(key)![1] < callTimes) {
              return [key, this.internalGet(key)![1]];
            }
            return result;
          },
          [this.keys[0]!, this.cacheCallTimes],
        );
        // 淘汰最久未访问的缓存项
        this.delete(targetKey);
      }

      this.keys.push(derivativeOption);
    }

    // 沿派生函数路径逐层写入嵌套 Map
    let cache = this.cache;
    derivativeOption.forEach((derivative, index) => {
      if (index === derivativeOption.length - 1) {
        // 最后一层：写入 value（Theme实例 + 当前访问时间）
        cache.set(derivative, { value: [value, this.cacheCallTimes++] });
      } else {
        // 中间层：确保 map 存在，然后继续深入
        const cacheValue = cache.get(derivative);
        if (!cacheValue) {
          cache.set(derivative, { map: new Map() });
        } else if (!cacheValue.map) {
          cacheValue.map = new Map();
        }
        cache = cache.get(derivative)!.map!;
      }
    });
  }

  /** 当前缓存的主题数量 */
  public size(): number {
    return this.keys.length;
  }

  /**
   * 递归删除指定路径上的缓存节点。
   * 删除叶子节点后，若某个中间节点变为空（无 map 也无 value），也一并清除，避免内存泄漏。
   *
   * @param currentCache 当前层的 Map
   * @param derivatives  剩余待删除的路径（每次递归消耗第一个元素）
   * @returns 被删除的 Theme 实例
   */
  // eslint-disable-next-line unicorn/consistent-class-member-order
  private deleteByPath(
    currentCache: ThemeCacheMap,
    derivatives: DerivativeFunc<any, any>[],
  ): Theme<any, any> | undefined {
    const cache = currentCache.get(derivatives[0]!)!;
    if (derivatives.length === 1) {
      // 到达叶子节点
      if (cache.map) {
        // 该节点还有子路径（其他派生函数组合共用了这一段前缀），只清除 value，保留 map
        currentCache.set(derivatives[0]!, { map: cache.map });
      } else {
        // 该节点没有子节点，直接删除整个节点
        currentCache.delete(derivatives[0]!);
      }
      return cache.value?.[0];
    }
    // 递归处理下一层
    const result = this.deleteByPath(cache.map!, derivatives.slice(1));
    // 递归返回后，若当前节点已无任何内容，清除它
    if ((!cache.map || cache.map.size === 0) && !cache.value) {
      currentCache.delete(derivatives[0]!);
    }
    return result;
  }

  /**
   * 内部查找方法，沿派生函数数组逐层遍历嵌套 Map，找到叶子节点。
   *
   * @param derivativeOption 派生函数数组，作为查找路径
   * @param updateCallTimes  是否更新该缓存项的最后访问时间（get 时传 true，has 时传 false）
   * @returns [Theme实例, 最后访问时间] 或 undefined（未命中）
   */
  private internalGet(
    derivativeOption: DerivativeOptions,
    updateCallTimes: boolean = false,
  ): [Theme<any, any>, number] | undefined {
    // 从根节点开始，包一层 { map } 是为了让第一次循环和后续循环逻辑统一
    let cache: ReturnType<ThemeCacheMap['get']> = { map: this.cache };
    derivativeOption.forEach((derivative) => {
      // eslint-disable-next-line unicorn/prefer-ternary
      if (cache) {
        // 沿路径逐层深入
        cache = cache?.map?.get(derivative);
      } else {
        cache = undefined;
      }
    });
    // 命中且需要更新访问时间时，刷新时间戳
    if (cache?.value && updateCallTimes) {
      cache.value[1] = this.cacheCallTimes++;
    }
    return cache?.value;
  }
}
