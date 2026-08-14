/**
 * @file 语义化 classNames / styles 合并工具
 *
 * 核心概念："语义化样式"能力允许用户通过 `classNames` 和 `styles`
 * props 精细控制组件内部各区域的样式。例如 Modal 组件支持：
 *
 * ```ts
 * <Modal classNames={{ body: 'custom-body', header: { root: 'custom-header' } }}
 *        styles={{ body: { padding: 0 } }} />
 * ```
 *
 * 此模块提供：
 * 1. `SemanticSchema` — 定义组件的 classNames/styles 嵌套结构
 * 2. `mergeClassNames` — 按 schema 合并多个 className 来源，支持嵌套对象和字符串快捷方式
 * 3. `mergeStyles` — 合并多个 styles 对象
 * 4. `useMergeSemantic` — 响应式 Hook，组合 classNames + styles 的合并
 * 5. `fillObjectBySchema` — 按 schema 补全缺失的嵌套 key
 */

import type { CSSProperties, Ref } from 'vue';

import type { AnyObject, EmptyObject, ValidChar } from '../types';

import { computed, unref } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

/**
 * 语义化结构的 Schema 定义。
 *
 * 描述组件的 classNames/styles 的嵌套层级。例如：
 * ```ts
 * const modalSchema: SemanticSchema = {
 *   root: {},
 *   header: { _default: 'root', title: {}, extra: {} },
 *   body: {},
 *   footer: {},
 * };
 * ```
 *
 * `_default` 字段表示：当用户传字符串而非对象时，字符串赋值给哪个子 key。
 * 如 `classNames={{ header: 'my-header' }}` 会变为 `{ header: { root: 'my-header' } }`。
 */
export type SemanticSchema = {
  [key: `${ValidChar}${string}`]: SemanticSchema;
} & { _default?: string };

/** 组件某区域的 className 映射，如 `{ root: 'my-root', title: 'my-title' }` */
export type SemanticClassNames<Name extends string> = Partial<
  Record<Name, string>
>;

/** 组件某区域的 styles 映射，如 `{ root: { padding: 0 } }` */
export type SemanticStyles<Name extends string> = Partial<
  Record<Name, CSSProperties>
>;

/**
 * 可解析类型：支持直接传值或传一个函数（接收 { props } 返回结果）。
 * 函数形式用于根据当前 props 动态计算 className/style。
 */
export type Resolvable<T, P extends AnyObject> =
  | ((info: { props: P }) => T)
  | T;

/** 语义化值的通用类型（静态值或函数） */
export type SemanticType<P = any, T = any> = ((info: { props: P }) => T) | T;

/** 语义化 classNames 的完整类型（嵌套结构 + 可解析） */
export type SemanticClassNamesType<
  Props extends AnyObject,
  SemanticClassNames extends { [K in keyof SemanticClassNames]?: string },
  NestedStructure extends EmptyObject = EmptyObject,
> = NestedStructure & Resolvable<Readonly<SemanticClassNames>, Props>;

/** 语义化 styles 的完整类型（嵌套结构 + 可解析） */
export type SemanticStylesType<
  Props extends AnyObject,
  SemanticStyles extends { [K in keyof SemanticStyles]?: CSSProperties },
  NestedStructure extends EmptyObject = EmptyObject,
> = NestedStructure & Resolvable<Readonly<SemanticStyles>, Props>;

/**
 * 按 schema 合并多个 classNames 对象。
 *
 * 合并规则：
 * 1. 如果 schema 中某个 key 是普通字段（无子 schema）→ 直接用 clsx 合并字符串
 * 2. 如果 schema 中某个 key 下有子结构：
 *    - 当前值为对象 → 递归合并子 key
 *    - 当前值为字符串 → 通过 schema._default 映射到对应的子 key
 *
 * @param schema - 组件的语义化结构定义
 * @param classNames - 多个 className 来源（按优先级从低到高）
 *
 * @example
 * const schema = { body: { _default: 'root', title: {} }, footer: {} };
 * mergeClassNames(schema,
 *   { body: 'base', footer: 'ft' },           // 全局默认
 *   { body: { root: 'override' } },           // 组件级覆盖
 * );
 * // → { body: { root: 'base override' }, footer: 'ft' }
 * //   其中 'base' 通过 _default 映射为 body.root
 */
export function mergeClassNames<
  Name extends string,
  SemanticClassNames extends Partial<Record<Name, any>>,
>(schema?: SemanticSchema, ...classNames: (SemanticClassNames | undefined)[]) {
  const mergedSchema = schema || {};

  return classNames
    .filter(Boolean)
    .reduce<SemanticClassNames>((acc: any, cur) => {
      Object.keys(cur || {}).forEach((key) => {
        const keySchema = mergedSchema[
          key as keyof SemanticSchema
        ] as SemanticSchema;
        const curVal = (cur as SemanticClassNames)[
          key as keyof SemanticClassNames
        ];
        if (keySchema && typeof keySchema === 'object') {
          if (curVal && typeof curVal === 'object') {
            // 值是对象 → 递归合并子结构
            acc[key] = mergeClassNames(keySchema, acc[key], curVal);
          } else {
            // 值是字符串 → 通过 _default 找到对应子 key
            const { _default: defaultField } = keySchema;
            if (defaultField) {
              acc[key] ||= {};
              acc[key][defaultField] = clsx(acc[key][defaultField], curVal);
            }
          }
        } else {
          // 无子结构 → 直接拼接 className
          acc[key] = clsx(acc[key], curVal);
        }
      });
      return acc;
    }, {} as SemanticClassNames);
}

/** 非响应式版的 classNames 合并（内部使用） */
function useSemanticClassNames<ClassNamesType extends AnyObject>(
  schema?: SemanticSchema,
  ...classNames: (Partial<ClassNamesType> | undefined)[]
) {
  return mergeClassNames(schema, ...classNames);
}

/**
 * 合并多个 styles 对象，后者的同名 key 覆盖前者。
 * 与 mergeClassNames 不同，styles 不需要 schema（样式对象不需要嵌套映射）。
 */
export function mergeStyles<StylesType extends AnyObject>(
  ...styles: (Partial<StylesType> | undefined)[]
) {
  return styles
    .filter(Boolean)
    .reduce<Record<PropertyKey, CSSProperties>>((acc, cur = {}) => {
      Object.keys(cur).forEach((key) => {
        acc[key] = { ...acc[key], ...cur[key] };
      });
      return acc;
    }, {});
}

/** 非响应式版的 styles 合并（内部使用） */
function useSemanticStyles<StylesType extends AnyObject>(
  ...styles: (Partial<StylesType> | undefined)[]
) {
  return mergeStyles(...styles);
}

/**
 * 按 schema 补全对象中缺失的嵌套 key。
 * 确保合并后的 classNames/styles 包含 schema 中定义的所有层级。
 * 缺失的 key 填充为空对象 `{}`。
 */
function fillObjectBySchema<T extends AnyObject>(
  obj: T,
  schema: SemanticSchema,
): T {
  const newObj: any = { ...obj };
  Object.keys(schema).forEach((key) => {
    if (key === '_default') {
      return;
    }

    const nestSchema = (schema as any)[key] as SemanticSchema;
    const nextValue = newObj[key] || {};
    newObj[key] = nestSchema
      ? fillObjectBySchema(nextValue, nestSchema)
      : nextValue;
  });
  return newObj;
}

/**
 * 解析语义化值：如果是函数则调用（传入 { props }），否则直接返回。
 * 支持用户根据当前 props 动态计算 className/style。
 */
export function resolveStyleOrClass<T extends AnyObject>(
  value: ((config: any) => T) | T,
  info: { props: AnyObject },
) {
  return typeof value === 'function' ? value(info) : value;
}

/** 可能为函数的语义化值 */
type MaybeFn<T, P> = ((info: { props: P }) => T) | T | undefined;

/** 排除函数类型，只保留对象 */
type ObjectOnly<T> = T extends (...args: any) => any ? never : T;

/**
 * 语义化 classNames / styles 合并的主 Hook（响应式版）。
 *
 * 完成以下步骤：
 * 1. 解析所有来源中的函数（resolveStyleOrClass）
 * 2. 合并 classNames（通过 mergeClassNames + schema）
 * 3. 合并 styles（通过 mergeStyles）
 * 4. 如果有 schema → 用 fillObjectBySchema 补全缺失的嵌套 key
 *
 * @param classNamesList - 多个 className 来源的 Ref 数组（按优先级从低到高）
 * @param stylesList - 多个 styles 来源的 Ref 数组
 * @param info - 包含当前 props 的 Ref，传给函数型来源
 * @param schema - 可选的语义化结构定义
 * @returns [mergedClassNames, mergedStyles] 两个 computed ref
 */
export function useMergeSemantic<
  ClassNamesType extends AnyObject,
  StylesType extends AnyObject,
  Props extends AnyObject,
>(
  classNamesList: Ref<MaybeFn<ClassNamesType, Props>[]>,
  stylesList: Ref<MaybeFn<StylesType, Props>[]>,
  info: Ref<{ props: Props }>,
  schema?: Ref<SemanticSchema>,
) {
  // 解析所有来源中的函数
  const resolvedClassNamesList = computed(() => {
    return classNamesList.value.map((classNames) =>
      classNames ? resolveStyleOrClass(classNames, info.value) : undefined,
    );
  });
  const resolvedStylesList = computed(() => {
    return stylesList.value.map((styles) =>
      styles ? resolveStyleOrClass(styles, info.value) : undefined,
    );
  });

  const mergedClassNames = computed(
    () =>
      useSemanticClassNames(
        schema?.value,
        ...resolvedClassNamesList.value,
      ) as ObjectOnly<ClassNamesType>,
  );
  const mergedStyles = computed(
    () =>
      useSemanticStyles(...resolvedStylesList.value) as ObjectOnly<StylesType>,
  );
  const _merged = computed(() => {
    if (!schema?.value) {
      return [mergedClassNames.value, mergedStyles.value] as const;
    }
    // 按 schema 补全缺失的嵌套 key
    return [
      fillObjectBySchema<ObjectOnly<ClassNamesType>>(
        mergedClassNames.value,
        schema.value,
      ),
      fillObjectBySchema<ObjectOnly<StylesType>>(
        mergedStyles.value,
        schema.value,
      ),
    ] as const;
  });
  return [
    computed(() => _merged.value[0]),
    computed(() => _merged.value[1]),
  ] as const;
}

/**
 * `useMergeSemantic` 的非响应式版本。
 * 用于不需要响应式追踪的场景（如 setup 外或一次性计算）。
 */
export function useMergeSemanticNoRef<
  ClassNamesType extends AnyObject,
  StylesType extends AnyObject,
  Props extends AnyObject,
>(
  classNamesList: MaybeFn<ClassNamesType, Props>[],
  stylesList: MaybeFn<StylesType, Props>[],
  info: { props: Props },
  schema?: SemanticSchema,
) {
  const resolvedClassNamesList = classNamesList.map((classNames) =>
    classNames ? resolveStyleOrClass(classNames, info) : undefined,
  );

  const resolvedStylesList = stylesList.map((styles) =>
    styles ? resolveStyleOrClass(styles, info) : undefined,
  );

  const mergedClassNames = useSemanticClassNames(
    schema,
    ...resolvedClassNamesList,
  ) as ObjectOnly<ClassNamesType>;

  const mergedStyles = useSemanticStyles(
    ...resolvedStylesList,
  ) as ObjectOnly<StylesType>;
  const fn = () => {
    if (!schema) {
      return [mergedClassNames, mergedStyles] as const;
    }
    return [
      fillObjectBySchema<ObjectOnly<ClassNamesType>>(mergedClassNames, schema),
      fillObjectBySchema<ObjectOnly<StylesType>>(mergedStyles, schema),
    ] as const;
  };
  return fn();
}

/**
 * 将多个 Ref 合并为一个数组 computed。
 * 用于将分散的 Ref 参数收集到 useMergeSemantic 的 classNamesList/stylesList 中。
 */
export function useToArr<T = any>(...args: Ref<T | undefined>[]) {
  return computed(() => args.map(unref));
}

/**
 * 将 props 包装为 `{ props }` 结构，适配 useMergeSemantic 的 info 参数格式。
 */
export function useToProps<T>(props: Ref<T>) {
  return computed(() => ({ props: props.value }));
}

/**
 * 将 ConfigProvider 的根级内联 `style` prop 包装为语义化的 `{ root: style }` 对象。
 *
 * 这样做的好处：`styles.root` 能够被语义化合并流程处理（与其他来源的 root style 合并），
 * 而不是直接应用到根元素上覆盖掉语义化 styles.root。
 * 与 ant-design#58474 对齐。
 */
export function useSemanticRootStyle<Style = CSSProperties>(
  style: Ref<Style | undefined>,
) {
  return computed(() => (style.value ? { root: style.value } : undefined));
}

interface RemoveBaseAttributesOptions {
  class?: boolean;
  omit?: string[];
  style?: boolean;
}

const defaultOptions = {
  class: true,
  style: true,
};

/**
 * 从 attrs 中剥离 class 和 style，返回纯净的属性对象。
 * 与 props-util 中的版本功能相同，语义化版本的一个副本。
 */
export function pureAttrs(
  attrs: Record<string, any>,
  options: RemoveBaseAttributesOptions = defaultOptions,
) {
  const newAttrs = { ...attrs };
  if (options.class) {
    delete newAttrs.class;
  }
  if (options.style) {
    delete newAttrs.style;
  }
  if (options.omit) {
    return omit(newAttrs, options.omit);
  }
  return newAttrs;
}

/**
 * 从 attrs 中分离 class、style 和其余属性。
 * 如有 props，class/style 优先从 attrs 取，fallback 到 props。
 */
export function getAttrStyleAndClass(
  attrs: Record<string, any>,
  options?: RemoveBaseAttributesOptions,
  props?: Record<string, any>,
) {
  return {
    className: attrs.class ?? props?.class,
    style: attrs.style ?? props?.style,
    restAttrs: pureAttrs(attrs, options),
  } as { className: any; restAttrs: Record<string, any>; style: any };
}
