# @arvin-studio/cssinjs 架构拆解

## 一句话概述

将 **CSSObject（JS 对象）** 经过 parse → normalize → DOM 注入的流水线，最终变成浏览器 `<head>` 中的 `<style>` 标签。整个过程中，Token（设计变量）和 Style（组件样式）分离管理，通过 Vue 3 响应式系统 + 引用计数缓存底座串联在一起。

---

## 最终产物：DOM 里到底生成了什么

一个 Button 组件最终在浏览器 `<head>` 中生成三类 `<style>` 标签：

```html
<!-- ① 全局 CSS 变量（useCacheToken 注入） -->
<style data-css-hash="abc" data-token-hash="css-var-root">
  :where(.css-abc).css-var-root {
    --as-color-primary: #1677ff;
    --as-font-size: 14px;
  }
</style>

<!-- ② Button 组件级 CSS 变量（useCSSVarRegister 注入） -->
<style data-css-hash="xyz" data-token-hash="css-var-root">
  :where(.css-abc).css-var-root.as-btn {
    --as-btn-font-weight: 400;
    --as-btn-icon-gap: 8px;
  }
</style>

<!-- ③ Button 组件样式（useStyleRegister 注入） -->
<style data-css-hash="def">
  :where(.css-abc).as-btn {
    color: var(--as-color-primary);
    font-weight: var(--as-btn-font-weight);
  }
</style>
```

关键设计：组件样式里存的不是 `#1677ff`，而是 `var(--as-color-primary)`。换主题时只需更新 ① 中的 CSS 变量值，组件样式 ③ 不需要重新生成。

---

## 模块全景图

```
┌─────────────────────────────────────────────────────────────────┐
│                      应用入口                                    │
│  <StyleProvider> 通过 Vue provide/inject 向下传递全局配置         │
│  配置项: cache, hashPriority, layer, transformers, linters       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   genStyleUtils（调度层）                         │
│                                                                  │
│  组件开发者的唯一入口: genStyleHooks('Button', styleFn, defToken) │
│  内部组装 mergedToken，然后调用两个底层 Hook                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ useCacheToken│  │useStyleRegister│ │useCSSVarRegister│
  │   (token轨道) │  │  (style轨道)  │  │  (cssVar轨道)  │
  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
         │                 │                 │
         └─────────┬───────┴─────────┬───────┘
                   ▼                 ▼
         ┌────────────────────────────────┐
         │       useGlobalCache            │
         │   (引用计数 + 缓存管理底座)       │
         └───────────────┬────────────────┘
                         ▼
         ┌────────────────────────────────┐
         │    Cache Entity（Map 存储）     │
         │   key → [refCount, cachedValue] │
         └────────────────────────────────┘
                         │
                         ▼
                    DOM <style>
```

---

## 7 步流水线：从配置到 DOM

```
步骤 1: StyleProvider
        收集全局配置 → provide/inject 向下传递
        ↓

步骤 2: useToken（项目实现，内部调 useCacheToken）
        种子 Token → Theme.getDerivativeToken() → AliasToken
        transformToken() → 值替换为 var(--xxx) 引用
        注入 CSS 变量到 DOM
        ↓

步骤 3: genStyleHooks 组装 mergedToken
        token + componentCls + iconCls + calc + defaultComponentToken
        ↓

步骤 4: styleFn(mergedToken)
        组件开发者写的样式函数，返回 CSSObject
        ↓

步骤 5: parseStyle(CSSObject → 嵌套 CSS 字符串)
        展平数组 → 驼峰转连字符 → 数字加 px
        → 注入 hashId 到选择器 → 提取 Keyframes
        ↓

步骤 6: normalizeStyle(嵌套 CSS → 扁平 CSS)
        stylis compile() 解析嵌套
        → prefixer() 浏览器前缀
        → stringify() 展平
        ↓

步骤 7: updateCSS(扁平 CSS → DOM <style>)
        写入/更新 <style> 标签
```

---

## 拆解路线图

按从基础到上层、从数据到渲染的顺序，分成 6 个阶段：

### 阶段 1: 缓存底座 — `Cache.ts` + `useGlobalCache.ts`

**解决什么问题**：三个轨道（token / style / cssVar）都需要缓存管理，把"存什么、何时清"提炼成公共底座。

**核心文件**：
- `src/Cache.ts` — Entity 类，Map<string, [refCount, cachedValue]>，key 用 `%` 拼接多级路径
- `src/hooks/useGlobalCache.ts` — 引用计数 Hook，管理缓存条目的生命周期

**要搞清楚的概念**：
- 引用计数 +1 / -1 的时机
- 延迟 500ms 移除（为什么需要，什么场景触发）
- pendingDecrements 处理竞态（卸载→挂载→卸载）
- computed 急切求值 + watch(flush:'sync') 类比 React useInsertionEffect
- onCacheEffect / onCacheRemove 两个回调的分工
- prefix 命名空间隔离三个轨道
- effectMap 对 onCacheEffect 的去重

---

### 阶段 2: Token 系统 — `theme/` → `useCacheToken.ts` → `css-variables.ts`

**解决什么问题**：设计变量怎么从原始值变成 CSS 变量，再变成组件可用的 `var()` 引用。

**核心文件**：
- `src/theme/Theme.ts` — 持有一组派生函数，getDerivativeToken() 链式执行
- `src/theme/createTheme.ts` — 工厂 + 缓存（相同函数引用复用实例）
- `src/theme/ThemeCache.ts` — LRU 淘汰的 Theme 实例缓存（上限 20 + 5 缓冲）
- `src/hooks/useCacheToken.ts` — Token 轨道 Hook
- `src/util/css-variables.ts` — `transformToken()` 核心转换

**要搞清楚的概念**：
- DesignToken → DerivativeFunc[] → DerivativeToken 的 Pipeline
- `transformToken()` 如何把 `{ colorPrimary: '#1677ff' }` 变成 `{ colorPrimary: 'var(--as-color-primary)' }` + 一串 CSS 变量声明
- `flattenToken()` 为什么需要哈希（token 对象 200+ 属性，直接拼 key 太长）
- `memoResult()` 基于 WeakMap 的依赖记忆化
- `tokenKeys` 引用计数 + `cleanTokenStyle()` 的批量清理策略
- `_tokenKey` 的作用：标记 token 身份，变化时触发缓存更新

---

### 阶段 3: 样式流水线 — `useStyleRegister.ts`

**解决什么问题**：JS 对象怎么一步步变成 CSS 字符串。

这是最核心的文件，分两大部分：

#### 3a. Parser: `parseStyle()`

**核心文件**：`src/hooks/useStyleRegister.ts`（前半部分）

**函数签名**：

```typescript
function parseStyle(
  interpolation: CSSInterpolation,  // 输入：CSSObject 或数组
  config: ParseConfig,              // { hashId, hashPriority, layer, transformers, linters }
  parseInfo: ParseInfo,             // { root, injectHash, parentSelectors } — 内部递归用
): [styleStr: string, effectStyle: Record<string, string>]
```

- `styleStr` — 嵌套 CSS 字符串（还需 stylis 展平），如 `:where(.css-abc).as-btn{color:red;:hover{color:blue;}}`
- `effectStyle` — 需要全局唯一的样式（`@keyframes`、`@layer`声明），去重后独立注入

**整体流程（3 个阶段）**：

```
阶段1: 展平
  interpolation → flattenList() → 一维 CSSObject[]

阶段2: 遍历处理每个 CSSObject
  对每个 key-value：
    ├─ value 是对象 → 嵌套选择器，注入 hashId，递归
    └─ value 是叶子 → appendStyle()：驼峰→连字符、数字加px、lint

阶段3: 包裹
  非 root           → {styleStr}
  root + layer      → @layer name {styleStr}
```

##### 阶段1: `flattenList()` — 数组展平 + 过滤 falsy

```typescript
function flattenList(list: ArrayCSSInterpolation, fullList: CSSObject[] = []) {
  list.forEach((item) => {
    if (Array.isArray(item)) {
      flattenList(item, fullList);  // 递归展平嵌套数组：[[a], b] → [a, b]
    } else if (item) {
      fullList.push(item as CSSObject);  // 过滤 null/undefined/boolean/false
    }
  });
  return fullList;
}
```

这就是为什么条件样式能工作：`isPrimary && { background: 'blue' }` 中 `false` 被自动过滤。

##### 阶段2: 遍历主循环 — 3 个顶层分支

```typescript
flattenStyleList.forEach((originStyle) => {
  const style = typeof originStyle === 'string' && !root ? {} : originStyle;

  if (typeof style === 'string') {
    // 【分支A】根层级字符串 → 直接拼入（@import、@font-face）
    styleStr += `${style}\n`;

  } else if ((style as any)._keyframe) {
    // 【分支B】Keyframes 对象 → 提取到 effectStyle，去重
    parseKeyframes(style as unknown as Keyframes);

  } else {
    // 【分支C】CSSObject → 先跑 transformers，再遍历每个 [key, value]
    const mergedStyle = transformers.reduce(
      (prev, trans) => trans?.visit?.(prev) || prev, style,
    );
    // 遍历 key，value 是对象进入 C1，是叶子进入 C2
  }
});
```

**`parseKeyframes` — 提取动画，同名去重**：

```typescript
function parseKeyframes(keyframes: Keyframes) {
  const animationName = keyframes.getName(hashId);  // "css-abc-fadeIn"
  if (!effectStyle[animationName]) {                // 去重：同名只生成一次
    const [parsedStr] = parseStyle(keyframes.style, config, {
      root: false,
      parentSelectors,
    });
    effectStyle[animationName] = `@keyframes ${animationName}${parsedStr}`;
  }
}
```

##### 子分支 C1: value 是对象 → 嵌套选择器

判断条件：value 是对象，且不是 Keyframes、不是 `SKIP_CHECK`/`MULTI_VALUE` 包装。

**注入 hashId** 是样式隔离的核心：

```typescript
if ((root || injectHash) && hashId) {
  if (mergedKey.startsWith('@')) {
    // @media / @supports — 自己不加 hashId，传给子选择器
    subInjectHash = true;
  } else if (mergedKey === '&') {
    // & → 替换为 hashSelector 本身
    mergedKey = injectSelectorHash('', hashId, hashPriority);
  } else {
    // .child → hashSelector .child
    mergedKey = injectSelectorHash(key, hashId, hashPriority);
  }
}
```

`injectSelectorHash` 的规则：
- 选择器第一个词是 HTML 元素（如 `h1`、`div`）→ hashId 插在元素名后面：`'h1.title'` → `'h1:where(.css-abc).title'`
- 选择器第一个词是类/id/属性 → hashId 插在最前面：`'.my-cls'` → `':where(.css-abc).my-cls'`

然后**递归**，子级返回的 `parsedStr` 已被 `{}` 包裹，直接拼在 `mergedKey` 后面即可：

```typescript
const [parsedStr, childEffectStyle] = parseStyle(value, config, {
  root: nextRoot,
  injectHash: subInjectHash,
  parentSelectors: [...parentSelectors, mergedKey],
});
effectStyle = { ...effectStyle, ...childEffectStyle };
styleStr += `${mergedKey}${parsedStr}`;
```

##### 子分支 C2: value 是叶子值 → `appendStyle`

```typescript
function appendStyle(cssKey: string, cssValue: any) {
  // 1. 开发环境 lint 检查
  [contentQuotesLinter, hashedAnimationLinter, ...linters].forEach(
    linter => linter(cssKey, cssValue, { path, hashId, parentSelectors }),
  );

  // 2. camelCase → kebab-case
  const styleName = cssKey.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
  //   backgroundColor → background-color

  // 3. 数字自动加 px（unitless 属性和 0 除外）
  let formatValue = cssValue;
  if (!unitless[cssKey] && typeof formatValue === 'number' && formatValue !== 0) {
    formatValue = `${formatValue}px`;
  }

  // 4. animationName 如果是 Keyframes → 提取并替换为动画名
  if (cssKey === 'animationName' && (cssValue as Keyframes)?._keyframe) {
    parseKeyframes(cssValue as Keyframes);
    formatValue = (cssValue as Keyframes).getName(hashId);
  }

  styleStr += `${styleName}:${formatValue};`;
}
```

`MULTI_VALUE` 在外层处理：一个属性多条声明，遍历值数组逐个 `appendStyle`。

##### 阶段3: 包裹

```typescript
if (!root) {
  styleStr = `{${styleStr}}`;              // 子级递归：花括号包裹
} else if (layer) {
  styleStr = `@layer ${layer.name} {${styleStr}}`;  // 根级+layer
}
```

##### 完整例子走一遍

输入：

```typescript
parseStyle(
  { '.as-btn': { color: 'red', '&:hover': { color: 'blue' } } },
  { hashId: 'css-abc' },
  { root: true, parentSelectors: [] },
)
```

执行过程：

```
阶段1: flattenList([{'.as-btn': {...}}]) → [{'.as-btn': {...}}]

阶段2: 遍历 style={'.as-btn': {color: 'red', '&:hover': {color: 'blue'}}}
  走分支C

  key='.as-btn', value={color: 'red', '&:hover': {color: 'blue'}}
    value 是对象 → C1
    root=true, hashId='css-abc' → injectSelectorHash('.as-btn', 'css-abc')
    mergedKey = ':where(.css-abc).as-btn'
    → 递归 parseStyle(value, config, {root:false})

    递归内部:
      key='color', value='red' → C2 → appendStyle → styleStr='color:red;'
      key='&:hover', value={color: 'blue'}
        C1, root=false, injectHash=false, hashId存在
        → injectSelectorHash → mergedKey=':where(.css-abc):hover'
        → 递归 → styleStr='{color:blue;}'
        → styleStr += ':where(.css-abc):hover{color:blue;}'
      最终 styleStr='color:red;:where(.css-abc):hover{color:blue;}'

    root=false → styleStr='{color:red;:where(.css-abc):hover{color:blue;}}'

  styleStr=':where(.css-abc).as-btn{color:red;:where(.css-abc):hover{color:blue;}}'

阶段3: root=true, 无layer → 不包裹
```

输出：

```
styleStr = ':where(.css-abc).as-btn{color:red;:where(.css-abc):hover{color:blue;}}'
effectStyle = {}
```

然后 `normalizeStyle`（stylis）展平为：

```css
:where(.css-abc).as-btn { color: red; }
:where(.css-abc).as-btn:hover { color: blue; }
```

#### 3b. Normalize & Register: `normalizeStyle()` + `useStyleRegister()`

**核心文件**：`src/hooks/useStyleRegister.ts`（后半部分）

**要搞清楚的概念**：
- stylis 的三步：`compile()` 解析嵌套 → `prefixer()` 浏览器前缀 → `stringify()` 展平
- `uniqueHash()` 生成 styleId（path + 内容 → hash）
- cacheFn 回调的完整流程：styleFn() → parseStyle() → normalizeStyle() → uniqueHash()
- onCacheEffect 回调：updateCSS 注入 DOM
- `effectStyle` 中 `@layer` vs 非 `@layer` 的分开注入逻辑
- SSR 水合：`existPath()` 检查 + 跳过重复解析
- `CSS_FILE_STYLE` 标记：构建工具预生成的样式

---

### 阶段 4: 调度层 — `genStyleUtils.ts`

**解决什么问题**：组件开发者不想直接操作 useStyleRegister，需要一个高层封装来组装 token、prefixCls、calc 等。

**核心文件**：
- `src/cssinjs-utils/util/genStyleUtils.ts`
- `src/cssinjs-utils/hooks/useToken.ts`（类型契约）
- `src/cssinjs-utils/util/statistic.ts`（Proxy 追踪 token 使用情况）
- `src/cssinjs-utils/util/maxmin.ts`（calc 的 max/min 辅助）
- `src/cssinjs-utils/util/getCompVarPrefix.ts`
- `src/cssinjs-utils/util/getDefaultComponentToken.ts`
- `src/cssinjs-utils/util/getComponentToken.ts`

**要搞清楚的概念**：
- `genStyleUtils(config)` 的依赖注入设计（useToken、usePrefix、useCSP 通过 config 传入）
- `genStyleHooks` = `genComponentStyleHook` + `genCSSVarRegister` 的组合
- `mergedToken` 的组装过程：aliasToken → +componentCls/iconCls/asCls → +calc/max/min → +defaultComponentToken
- `getDefaultComponentToken` 的值为什么又被替换为 `var(--as-btn-font-weight)`（先注入 CSS 变量，再从样式里引用）
- `genSubStyleComponent`：子组件样式（如 Button.Group），order = -998，渲染一个空的 `defineComponent`
- Proxy 统计 token 使用情况（构建时优化用）
- `prefixToken()` 的作用：`fontWeight` → `ButtonFontWeight`（不同组件 token 合并到全局时的前缀防冲突）

---

### 阶段 5: 配置传递 — `StyleContext.ts`

**解决什么问题**：全局样式配置（cache、hashPriority、layer、transformers、linters）怎么通过组件树传递。

**核心文件**：
- `src/StyleContext.ts`

**要搞清楚的概念**：
- `createCache()` 做了什么（生成 instanceId + SSR 水合处理）
- `StyleProvider` 的合并策略（父级 context + 当前 props，子优先）
- `hashPriority: 'high' | 'low'` 对生成的选择器的影响
- `autoPrefix` 的自动检测（transformers 中是否包含 `AUTO_PREFIX`）
- `defaultCache` 标记：区分是用户传入的 cache 还是自动创建的

---

### 阶段 6: 扩展系统 — Transformers、Linters、SSR

**解决什么问题**：预处理 CSSObject、开发时检查 CSS 质量、服务端渲染。

**Transformers**：
- `src/transformers/interface.ts` — Transformer 接口（`visit(cssObj) → cssObj`）
- `src/transformers/autoPrefix.ts` — stylis prefixer 标记
- `src/transformers/px2rem.ts` — px → rem 单位转换
- `src/transformers/legacyLogicalProperties.ts` — 逻辑属性降级

**Linters**：
- `src/linters/interface.ts` — Linter 类型
- `src/linters/contentQuotesLinter.ts` — content 缺少引号
- `src/linters/hashedAnimationLinter.ts` — 动画名未使用 Keyframes
- `src/linters/NaNLinter.ts` — 出现 NaN
- `src/linters/parentSelectorLinter.ts` — `&` 使用不当
- `src/linters/legacyNotSelectorLinter.ts` — `:not()` 多选择器
- `src/linters/logicalPropertiesLinter.ts` — 逻辑属性兼容性

**SSR**：
- `src/ssr/styleCollector.ts` — 样式收集器（setStyleCollector + collectStyleText）
- `src/util/cacheMapUtil.ts` — SSR 水合时的样式缓存映射
- useStyleRegister 中的 `extract()` — 序列化单条缓存为 `<style>` HTML

---

## 三条数据流

### Token 流

```
SeedToken → Theme.getDerivativeToken() → AliasToken
  → transformToken() → tokenWithCssVar (值变成 var(--xxx))
                    → cssVarsStr → updateCSS → DOM
```

### Style 流

```
styleFn(mergedToken) → CSSObject
  → parseStyle() → 嵌套 CSS 字符串 + effectStyle
  → normalizeStyle() (stylis) → 扁平 CSS 字符串
  → updateCSS → DOM <style>
```

### CSSVar 流（组件级）

```
getDefaultComponentToken(component, realToken)
  → getComponentToken(overrideToken) → componentToken
  → transformToken() → tokenWithCssVar + cssVarsStr
  → useCSSVarRegister → updateCSS → DOM
```

---

## 附录：CSSObject 完整写法参考

`CSSObject` 由 3 个类型交叉而成：

```
CSSObject = CSSPropertiesWithMultiValues   ← 标准 CSS 属性 key（color、fontSize...）
          + CSSPseudos                     ← 伪类/伪元素 key（:hover、::after...）
          + CSSOthersObject                ← 任意 string key 兜底（.child、@media、&.variant...）
```

值的类型是 `CSSInterpolation`，它是一个递归类型：

```
CSSInterpolation = CSSObject | string | number | boolean | null | undefined
                 | Keyframes | CSSInterpolation[]
```

### 完整示例

以下是一个 `CSSObject` 的所有合法写法：

```typescript
import { Keyframes } from '@arvin-studio/cssinjs';

// 假设定义了动画
const fadeIn = new Keyframes('fadeIn', {
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const cssobj: CSSObject = {

  // ───── 1. 标准 CSS 属性（CSSPropertiesWithMultiValues）─────
  color: 'red',
  fontSize: 14,          // 数字 → 自动 "14px"
  opacity: 0.5,          // unitless → 保持 0.5
  fontWeight: 400,       // unitless → 保持 400
  zIndex: 10,            // unitless → 保持 10
  margin: 0,             // 0 不加 px
  display: 'flex',

  // 数组写法（csstype 定义为 string 的属性可用）
  border: ['1px', 'solid', 'red'],
  padding: [4, 8],       // → padding:4px 8px;

  // ───── 2. SKIP_CHECK 标记 — 跳过 linter 检查 ─────
  content: {
    [SKIP_CHECK]: true,
    value: '"→"' as any,
  },

  // ───── 3. MULTI_VALUE 标记 — 一个属性多条声明 ─────
  background: {
    [MULTI_VALUE]: true,
    value: ['url(a.png)', 'url(b.png)'],
  },
  // → background:url(a.png);background:url(b.png);

  // ───── 4. animationName 用 Keyframes 对象 ─────
  animationName: fadeIn,           // 自动提取 @keyframes，这里替换为动画名
  animationDuration: '0.3s',

  // ───── 5. 伪类（CSSPseudos）— key 是纯伪类 ─────
  ':hover': { color: 'blue' },
  ':focus': { outline: 'none' },
  ':first-child': { marginTop: 0 },
  '::after': { content: '""', display: 'block' },
  '::placeholder': { color: '#999' },

  // ───── 6. & 组合选择器（CSSOthersObject 兜底）─────
  '&:hover': { color: 'blue' },
  '&.active': { fontWeight: 700 },
  '&.as-btn-primary': { background: 'blue' },

  // ───── 7. 嵌套子选择器（CSSOthersObject 兜底）─────
  '.as-btn-icon': { marginRight: 8 },
  '.as-btn-icon + span': { marginLeft: 8 },
  '> .as-btn-loading': { position: 'absolute' },

  // ───── 8. 媒体查询（CSSOthersObject 兜底）─────
  '@media (max-width: 768px)': {
    fontSize: 12,
    '.as-btn-icon': { display: 'none' },
  },

  // ───── 9. CSS 自定义属性（CSSOthersObject 兜底）─────
  '--custom-gap': '8px',
};
```

### styleFn 返回的数组（CSSInterpolation[]）

```typescript
const styleFn = (token) => [
  // 条件样式：false/null/undefined 被自动过滤
  { '.as-btn': { color: 'red' } },
  isPrimary && { '.as-btn': { background: 'blue' } },
  isDisabled && { '.as-btn': { opacity: 0.5 } },

  // 嵌套数组会被 flattenList 展平
  [{ '.as-btn-group': { display: 'flex' } }],

  // 根级别字符串 — 直接拼到 CSS 最前面
  `@import url('https://fonts.googleapis.com/css2?family=Roboto');`,

  // 根级别 Keyframes — 作为数组元素直接提取
  fadeIn,
];
```

### 最终 CSS 产物示意

```css
@import url('https://fonts.googleapis.com/css2?family=Roboto');

@keyframes css-abc-fadeIn { from{opacity:0;}to{opacity:1;} }

:where(.css-abc).as-btn {
  color: red;
  font-size: 14px;
  opacity: 0.5;
  font-weight: 400;
  z-index: 10;
  margin: 0;
  display: flex;
  border: 1px solid red;
  padding: 4px 8px;
  content: "→";
  background: url(a.png);
  background: url(b.png);
  animation-name: css-abc-fadeIn;
  animation-duration: 0.3s;
  --custom-gap: 8px;
}
:where(.css-abc).as-btn:hover { color: blue; }
:where(.css-abc).as-btn:focus { outline: none; }
:where(.css-abc).as-btn:first-child { margin-top: 0; }
:where(.css-abc).as-btn::after { content: ""; display: block; }
:where(.css-abc).as-btn::placeholder { color: #999; }
:where(.css-abc).as-btn.as-btn-primary { background: blue; }
:where(.css-abc).as-btn .as-btn-icon { margin-right: 8px; }
:where(.css-abc).as-btn .as-btn-icon + span { margin-left: 8px; }
:where(.css-abc).as-btn > .as-btn-loading { position: absolute; }
@media (max-width: 768px) {
  :where(.css-abc).as-btn { font-size: 12px; }
  :where(.css-abc).as-btn .as-btn-icon { display: none; }
}
```

---

## 拆解顺序

| 顺序 | 阶段 | 难度 | 文件数 |
|------|------|------|--------|
| 1 | 缓存底座 | 中 | 2 |
| 2 | Token 系统 | 中 | 5+ |
| 3 | 样式流水线 | 高 | 1大 |
| 4 | 调度层 | 高 | 6+ |
| 5 | 配置传递 | 低 | 1 |
| 6 | 扩展系统 | 低 | 10+ |
