# @arvin-studio/icons 打包流程

> 本文档说明 `@arvin-studio/icons`（图标组件库）从**数据源生成**到**产物打包**的完整流程。

## 模块定位与依赖

```
@arvin-studio/icons-svg（底层数据包：原始 SVG + 图标定义）
        │  提供 allIconDefs / es/asn/*.js / inline-namespaced-svg
        ▼
@arvin-studio/icons（本模块：Vue 3 图标组件库）
        │  运行时依赖 vue、@arvin-studio/headless、@arvin-studio/kit
        ▼
        消费者（应用 / 组件库）
```

- **数据源**：`@arvin-studio/icons-svg`，其 `prepare` 钩子会在安装时自动执行
  `generate`（gulp 读 SVG 生成图标定义）→ `build`（tsc 产出 `es/` ESM 与 `lib/` CJS）
- **本模块**：负责把数据源里的图标定义，生成一个个 Vue 3 TSX 组件并打包发布

## 整体流程：先"生成"再"打包"

```
pnpm gen   （生成源代码：src/icons、src/extra-icons）
    │
    ▼
pnpm build （打包发布产物：dist/）
```

---

## 一、生成阶段（pnpm gen）

```jsonc
// package.json scripts（生成部分）
"gen": "run-s gen:icons gen:custom-icons",      // 串行执行下面两个
"gen:icons": "esno ./scripts/gen-icons.ts",     // 生成常规图标组件
"gen:custom-icons": "esno ./scripts/gen-custom-icons.ts", // 生成自定义图标组件
```

| 命令 | 脚本 | 做什么 | 产物 |
|---|---|---|---|
| `pnpm gen` | — | 串行跑 `gen:icons` + `gen:custom-icons` | — |
| `gen:icons` | `scripts/gen-icons.ts` | 从 `@arvin-studio/icons-svg` 读取全部图标定义，为每个图标生成一个独立 TSX 组件；同时生成统一入口 `index.tsx`（按标识符排序，保证导出顺序稳定） | `src/icons/*.tsx`、`src/icons/index.tsx` |
| `gen:custom-icons` | `scripts/gen-custom-icons.ts` | 规划中：生成 `src/extra-icons/` 下的自定义图标组件 | `src/extra-icons/*` |

> ⚠️ 生成产物（`src/icons/*`）已纳入版本管理，文件头标注「自动生成，请勿手动编辑」。

---

## 二、打包阶段（pnpm build）

```jsonc
// package.json scripts（打包部分）
"build": "run-s build:icons build:parallel",     // 先 tsdown 多入口，再并行 vite 单文件
"build:icons": "tsdown",                         // ① 多入口 ESM + d.ts
"build:es": "vite build --config ./vite.esm.config.ts",   // ② ESM 单文件
"build:umd": "vite build --config ./vite.umd.config.ts",  // ③ UMD 单文件
"build:parallel": "run-p build:es build:umd",    // ②③ 并行执行
"prepublish": "pnpm build"                       // 发布前自动触发打包
```

### 步骤 ①：build:icons —— tsdown 多入口构建

配置见 `tsdown.config.ts`：

| 配置项 | 值 | 说明 |
|---|---|---|
| `entry` | `src/index.ts`、`src/all.ts`、`src/icons/index.tsx`、`src/extra-icons/index.tsx` | 四个入口各产出一个模块 |
| `format` | `es` | 仅 ESM 格式 |
| `dts` | `true` | 同时生成 `.d.ts` 类型声明 |
| `external` | `['vue']` | vue 不打进产物，由消费者提供 |
| `unbundle` | `true` | 不做打包合并，按模块原样输出 |

- `src/index.ts`：完整入口（Icon / Context / IconFont / twoTonePrimaryColor + 全部图标）
- `src/all.ts`：纯图标桶文件（不含运行时辅助组件）

产物：`dist/index.js` + `dist/index.d.ts`、`dist/all.js` + `dist/all.d.ts`、`dist/icons/*`、`dist/extra-icons/*`。

### 步骤 ②③：build:es / build:umd —— vite 单文件构建

| | `build:es` | `build:umd` |
|---|---|---|
| 配置文件 | `vite.esm.config.ts` | `vite.umd.config.ts` |
| 格式 | `es` | `umd` |
| 产物 | `dist/as-icons.esm.js` | `dist/as-icons.js` |
| 全局变量名 | — | `AsIcons` |
| 外部化 | `vue`（ESM 的 import 引用） | `vue`（映射为全局 `vue`） |
| 插件 | `@vitejs/plugin-vue` + `vue-jsx` + `tsxResolveTypes` | 同左 |
| `emptyOutDir` | `false`（不清空 dist，避免与 tsdown 产物互相覆盖） | 同左 |

> 这两个产物用于 CDN / `<script>` 直接引入场景（`unpkg` / `jsdelivr` 字段指向它们）。

### 产物总览（dist/）

```
dist/
├── index.js / index.d.ts            # 完整入口（ESM + 类型）
├── all.js / all.d.ts                # 纯图标入口
├── icons/                           # 每个图标一个模块（按需引入）
├── extra-icons/                     # 自定义图标模块
├── components/ utils.js             # 内部运行时辅助
├── as-icons.js                      # UMD 单文件（浏览器 CDN）
└── as-icons.esm.js                  # ESM 单文件
```

`exports` 字段把上面产物映射为子路径导入，例如：

| 导入路径 | 解析到 |
|---|---|
| `@arvin-studio/icons` | `dist/index.js`（+ d.ts） |
| `@arvin-studio/icons/all` | `dist/all.js` |
| `@arvin-studio/icons/icons/xxx` | `dist/icons/xxx.js` |
| `@arvin-studio/icons/extra-icons/*` | `dist/extra-icons/*` |
| `@arvin-studio/icons/dist/as-icons.js` | UMD 单文件（CDN） |

`sideEffects` 声明了 `as-icons.js` / `as-icons.esm.js` 为副作用模块，防止被摇树优化误删。

---

## 三、常用命令速查

| 命令 | 作用 |
|---|---|
| `pnpm gen` | 重新生成全部图标源代码 |
| `pnpm gen:icons` | 仅重新生成常规图标 |
| `pnpm build` | 完整打包（tsdown 多入口 → vite 单文件） |
| `pnpm build:icons` | 仅 tsdown 多入口构建 |
| `pnpm build:es` / `build:umd` | 仅构建 ESM / UMD 单文件 |
| `pnpm prepublish` | 发布前构建（发布时自动执行） |

## 四、注意事项

1. **先 gen 再 build**：`dist/icons` 等产物依赖 `src/icons`，若图标定义有更新，需先 `pnpm gen` 再 `pnpm build`。
2. **`gen:custom-icons` 尚未实现**：`scripts/gen-custom-icons.ts` 还不存在，`pnpm gen` 当前会在该步骤报错；对应入口 `src/extra-icons/index.tsx` 也尚为空。
3. **`src/extra-icons/index.tsx` 为空**：tsdown 的 entry 引用了它，需要填充内容后 `build:icons` 才能完整产出 `dist/extra-icons`。
4. **运行时依赖**：产物 `external` 掉 `vue`，消费方需自行安装 `vue`；`@arvin-studio/headless`、`@arvin-studio/kit` 为运行时依赖，会打进产物（未被 external）。
