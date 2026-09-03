/**
 *  —— lodash 风格路径赋值与对象合并
 *
 * 能力一：路径赋值（set / internalSet）——沿 path 逐层创建中间容器
 * （对象或数组）并写入 value，全程浅拷贝、不修改原对象；
 * 支持 removeIfUndefined 模式：值为 undefined 时删除目标属性，
 * 父级不存在则整次赋值静默跳过（避免凭空创建结构）。
 * 能力二：对象合并（merge / mergeWith）——把多个对象合并为新的单个对象，
 * 数组默认整体覆盖，可通过 prepareArray 定制；带循环引用保护。
 */
import { get } from './get';

/** 取值/赋值路径：string | number | symbol 的数组（number 段对应数组下标） */
export type Path = (number | string | symbol)[];

/**
 * 内部递归赋值（不对外导出）
 *
 * 每次只处理路径的第一段：克隆当前层容器（按需创建数组/对象），
 * 把剩余路径交给下一层递归；路径耗尽时直接返回 value。
 * @param removeIfUndefined 且值 undefined 时，删除目标属性而非赋 undefined
 */
function internalSet<Entity = any, Output = Entity, Value = any>(
  entity: Entity,
  paths: Path,
  value: Value,
  removeIfUndefined: boolean,
): Output {
  // 路径已走完：本层就是要赋的值
  if (paths.length === 0) return value as unknown as Output;

  const [path, ...restPath] = paths as any;

  // 克隆当前层：entity 为空且本段是数字 → 创建数组；
  // 原值本身是数组 → 浅拷贝数组；否则浅拷贝对象
  let clone: Output;
  if (!entity && typeof path === 'number') clone = [] as unknown as Output;
  else if (Array.isArray(entity)) clone = [...entity] as unknown as Output;
  else clone = { ...entity } as unknown as Output;

  // Delete prop if `removeIfUndefined` and value is undefined
  // 只剩最后一段且要删除：直接 delete 目标属性（不写入 undefined）
  if (removeIfUndefined && value === undefined && restPath.length === 1)
    delete (clone as any)[path][restPath[0]];
  else
    (clone as any)[path] = internalSet(
      (clone as any)[path],
      restPath,
      value,
      removeIfUndefined,
    );

  return clone;
}

/**
 * 沿路径对对象/数组赋值（浅拷贝，不修改原对象）
 *
 * @param entity 源对象（不会被修改）
 * @param paths 路径数组，如 ['a', 0, 'b']
 * @param value 要赋的值
 * @param removeIfUndefined true 且 value 为 undefined 时删除目标属性；
 *   父级容器不存在则整次操作跳过（见下方守卫）
 * @returns 赋值后的新对象
 */
export function set<Entity = any, Output = Entity, Value = any>(
  entity: Entity,
  paths: Path,
  value: Value,
  removeIfUndefined: boolean = false,
): Output {
  // Do nothing if `removeIfUndefined` and parent object not exist
  // 守卫：删除模式下父级不存在时不创建任何结构，直接返回原对象
  if (
    paths.length > 0 &&
    removeIfUndefined &&
    value === undefined &&
    !get(entity, paths.slice(0, -1))
  ) {
    return entity as unknown as Output;
  }

  return internalSet(entity, paths, value, removeIfUndefined);
}

/**
 * 是否为"纯对象"：typeof 为 object、非 null、且原型是 Object.prototype
 * （排除数组、Date、Map 等其它内置对象）
 */
export function isObject(obj: any) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
}

/** 按源值类型创建空容器（数组→[]，其它→{}），用于合并时初始化结构 */
function createEmpty<T>(source: T) {
  return (Array.isArray(source) ? [] : {}) as T;
}

// 枚举键的工具：优先 Reflect.ownKeys（含 symbol 键），降级 Object.keys
const keys = typeof Reflect === 'undefined' ? Object.keys : Reflect.ownKeys;

// ================================ Merge ================================
/** 自定义合并函数：输入当前值（clone 中的）与下一个值（源中的），返回合并结果 */
export type MergeFn = (current: any, next: any) => any;

/**
 * Merge multiple objects. Support custom merge logic.
 * 合并多个对象（支持自定义合并逻辑）。
 * @param sources object sources
 * @param config
 * @param config.prepareArray Customize array prepare function.
 * It will return empty [] by default.
 * So when match array, it will auto be override with next array in sources.
 * @param config.prepareArray 自定义"数组预备"函数：默认返回空数组 []
 * （数组相遇时整体用下一个源中的数组覆盖）；返回其它值可定制合并行为
 */
export function mergeWith<T extends object>(
  sources: T[],
  config: {
    prepareArray?: MergeFn;
  } = {},
) {
  const { prepareArray } = config;
  // 缺省 prepareArray：返回空数组，即数组总是被后一个源覆盖
  const finalPrepareArray: MergeFn = prepareArray || (() => []);

  // 结果容器：按第一个源的形状初始化（数组/对象）
  let clone = createEmpty(sources[0]);

  // 依次把每个源并入 clone（后面的源覆盖前面的）
  sources.forEach((src) => {
    function internalMerge(path: Path, parentLoopSet?: Set<object>) {
      // 继承父级已访问对象集合，用于检测循环引用（避免无限递归）
      const loopSet = new Set(parentLoopSet);

      const value = get(src, path);

      const isArr = Array.isArray(value);

      if (isArr || isObject(value)) {
        // Only add not loop obj
        // 循环引用保护：该对象已被访问过则跳过（引用成环的根由上层处理）
        if (!loopSet.has(value)) {
          loopSet.add(value);

          const originValue = get(clone, path);

          if (isArr) {
            // Array will always be override
            // 数组总是整体覆盖：先按 prepareArray 预备，再写入
            clone = set(clone, path, finalPrepareArray(originValue, value));
          } else if (!originValue || typeof originValue !== 'object') {
            // Init container if not exist
            // clone 中该路径尚无对象：先初始化空容器再递归填充
            clone = set(clone, path, createEmpty(value));
          }

          // 递归合并每个可枚举键（Reflect.ownKeys + 可枚举过滤）
          keys(value).forEach((key) => {
            if (
              (Object as any)?.getOwnPropertyDescriptor?.(value, key)
                ?.enumerable
            ) {
              internalMerge([...path, key], loopSet);
            }
          });
        }
      } else {
        // 叶子值（基本类型）：直接覆盖写入
        clone = set(clone, path, value);
      }
    }

    internalMerge([]);
  });

  return clone;
}

/**
 * Merge multiple objects into a new single object.
 * Arrays will be replaced by default.
 * 合并多个对象为新的单个对象（默认数组整体覆盖）。
 * @param sources 要合并的源对象（后面的优先覆盖前面的）
 */
export function merge<T extends object>(...sources: T[]) {
  return mergeWith(sources);
}
