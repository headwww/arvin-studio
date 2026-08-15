import type { App, CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit, VueNode } from '../_util';
import type {
  Orientation,
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent, shallowRef } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import {
  getSlotPropFn,
  isPresetSize,
  isValidGapNumber,
  toPropsRefs,
} from '../_util';
import {
  pureAttrs,
  useMergeSemantic,
  useOrientation,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { useComponentBaseConfig } from '../config-provider/context';
import Addon from './Addon'; // Space.Addon：装饰格（variant/status/disabled）
import Compact from './Compact';
import { useSpaceContextProvider } from './context';
import Item from './Item'; // 子项包装：容器 + 条件分隔符
import useStyle from './style';

export type SpaceSize = number | SizeType;

/** 语义化类名：供 classes 属性按部件名追加自定义类 */
export interface SpaceSemanticClassNames {
  item?: string;
  root?: string;
  separator?: string;
}

/** 语义化样式：供 styles 属性按部件名追加自定义样式 */
export interface SpaceSemanticStyles {
  item?: CSSProperties;
  root?: CSSProperties;
  separator?: CSSProperties;
}

/** 合并 ConfigProvider 全局 classes 后的完整语义化类名类型 */
export type SpaceClassNamesType = SemanticClassNamesType<
  SpaceProps,
  SpaceSemanticClassNames
>;

/** 合并 ConfigProvider 全局 styles 后的完整语义化样式类型 */
export type SpaceStylesType = SemanticStylesType<
  SpaceProps,
  SpaceSemanticStyles
>;

export interface SpaceProps extends ComponentBaseProps {
  // 故意不提供 `stretch`：很多子组件（如 Button）不支持 stretch 拉伸。
  /** 横向排列时的交叉轴对齐；未指定且横向时默认 'center' */
  align?: 'baseline' | 'center' | 'end' | 'start';
  /** 语义化类名覆盖：{ root?, item?, separator? } */
  classes?: SpaceClassNamesType;
  /** 排列方向：horizontal（默认）| vertical */
  orientation?: Orientation;
  /** 子项之间的分隔符节点（非最后一个子项之后渲染） */
  separator?: VueNode;
  /** 间距尺寸：单个值（横竖相同）或 [水平, 垂直] 数组；缺省时取 ConfigProvider 全局 space size，再缺省为 'small' */
  size?: [SpaceSize, SpaceSize] | SpaceSize;
  /** 语义化样式覆盖：{ root?, item?, separator? } */
  styles?: SpaceStylesType;
  /** 垂直排列的布尔写法（等价 orientation="vertical"） */
  vertical?: boolean;
  /** 是否允许换行（flexWrap: wrap），配合自定义数值间距使用 */
  wrap?: boolean;
}

export interface SpaceSlots {
  default?: () => any;
  separator?: () => any;
}

const defaultSizeProps = {
  size: undefined,
} as any;

const AsSpace = defineComponent<
  SpaceProps,
  EmptyEmit,
  string,
  SlotsType<SpaceSlots>
>(
  (props = defaultSizeProps, { attrs, slots }) => {
    const {
      prefixCls,
      direction: directionConfig,
      size: contextSize,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('space', props, ['size']);

    // 将响应式 props 转为 ref（props 本身可能是非响应式解构，这里统一成 ref 供 computed 使用）
    const { orientation, vertical, size, align, classes, styles } = toPropsRefs(
      props,
      'orientation',
      'vertical',
      'size',
      'align',
      'classes',
      'styles',
    );
    // 方向归一化：orientation（新）> vertical（布尔），输出 [方向, 是否垂直]
    const [mergedOrientation, mergedVertical] = useOrientation(
      orientation,
      vertical,
    );

    // 合并最终间距：局部 size > 全局 contextSize > 默认 'small'；
    // 数组直接透传（[水平, 垂直]），标量展开成 [x, x]
    const sizes = computed(() => {
      const _size = size.value ?? contextSize.value ?? 'small';
      return Array.isArray(_size) ? _size : ([_size, _size] as const);
    });

    // 判定横/纵间距是否为「预设尺寸」（small/middle/medium/large）：
    // 预设 → 拼 CSS 类名（-gap-col-* / -gap-row-*）走 token；否则走内联 gap
    const isPresetVerticalSize = computed(() => isPresetSize(sizes.value?.[1]));
    const isPresetHorizontalSize = computed(() =>
      isPresetSize(sizes.value?.[0]),
    );
    // 判定横/纵间距是否为「有效数值」（排除 0、NaN）：
    // 有效 → 写内联 rowGap/columnGap
    const isValidVerticalSize = computed(() =>
      isValidGapNumber(sizes.value?.[1]),
    );
    const isValidHorizontalSize = computed(() =>
      isValidGapNumber(sizes.value?.[0]),
    );
    // 横向时若未指定 align，默认居中（与 antd 行为一致）；纵向不设默认（保持 stretch）
    const mergedAlign = computed(() =>
      align.value === undefined && !mergedVertical.value
        ? 'center'
        : align.value,
    );
    // 注册 Space 样式，返回 hashId（CSS-in-JS 作用域类）与 cssVarCls（CSS 变量类）
    const [hashId, cssVarCls] = useStyle(prefixCls);

    // =========== Merged Props for Semantic ==========
    // 供语义化类名/样式函数使用的"合并后 props"：
    // 把归一化后的 orientation / align 覆盖进去，保证自定义样式能拿到最终值
    const mergedProps = computed(() => {
      return {
        ...props,
        orientation: mergedOrientation.value,
        align: mergedAlign.value,
      };
    });

    // 合并语义化类名/样式：全局（context）与局部（props）数组合并，
    // 经 useToProps 转为可被函数式语义化类名消费的 props 形态
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      SpaceClassNamesType,
      SpaceStylesType,
      SpaceProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    // 最后一个有效子项的索引：渲染期在 map 中副作用赋值，
    // 通过 SpaceContext 下发给每个 Item，Item 据此决定是否渲染分隔符
    const latestIndex = shallowRef(0);
    useSpaceContextProvider(
      computed(() => {
        return {
          latestIndex: latestIndex.value,
        };
      }),
    );

    return () => {
      const verticalSize = sizes.value?.[1];
      const horizontalSize = sizes.value?.[0];
      // 根节点类名：基础类 + 全局类 + hashId + 方向类 + rtl/对齐/间距类 + 用户 attrs/rootClass + 语义化 root 类
      const cls = clsx(
        prefixCls.value,
        contextClassName.value,
        hashId.value,
        `${prefixCls.value}-${mergedOrientation.value}`,
        {
          [`${prefixCls.value}-rtl`]: directionConfig.value === 'rtl',
          [`${prefixCls.value}-align-${mergedAlign.value}`]: mergedAlign.value,
          // 预设尺寸 → 类名（如 -gap-col-small / -gap-row-large）
          [`${prefixCls.value}-gap-row-${verticalSize}`]:
            isPresetVerticalSize.value,
          [`${prefixCls.value}-gap-col-${horizontalSize}`]:
            isPresetHorizontalSize.value,
        },
        (attrs as any).class, // 用户 attrs.class 最后合并，保证覆盖优先
        props.rootClass,
        cssVarCls.value,
        mergedClassNames.value.root,
      );
      // 剔除空 vnode / 空片段后的有效子项
      const childNodes = filterEmpty(slots?.default?.());
      // 子项统一类名：ant-space-item + 语义化 item 类
      const itemClassName = clsx(
        `${prefixCls.value}-item`,
        mergedClassNames.value.item,
      );
      // Calculate latest one
      const nodes = childNodes.map((child, i) => {
        // 副作用：记录最后一个非空子项的索引（供 Item 判断分隔符）
        if (child !== null && child !== undefined) {
          latestIndex.value = i;
        }
        // 优先用用户 key，无 key 时用类名+索引兜底
        const key = child?.key || `${itemClassName}-${i}`;
        return (
          <Item
            classes={mergedClassNames.value}
            className={itemClassName}
            index={i}
            key={key}
            style={mergedStyles.value.item}
            styles={mergedStyles.value}
            v-slots={{
              default: () => child,
              // 分隔符：插槽优先，prop 兜底（getSlotPropFn 统一处理）
              separator: getSlotPropFn(slots, props, 'separator'),
            }}
          />
        );
      });

      // =========================== Render ===========================
      // 无子项 → 不渲染（避免产生空容器占位）
      if (childNodes.length === 0) {
        return null;
      }
      // 自定义数值间距 → 内联 gap 样式（预设尺寸走类名，不进这里）
      const gapStyle: CSSProperties = {};
      if (props.wrap) {
        gapStyle.flexWrap = 'wrap';
      }
      if (!isPresetHorizontalSize.value && isValidHorizontalSize.value) {
        gapStyle.columnGap =
          typeof horizontalSize === 'number'
            ? `${horizontalSize}px`
            : horizontalSize;
      }
      if (!isPresetVerticalSize.value && isValidVerticalSize.value) {
        gapStyle.rowGap =
          typeof verticalSize === 'number' ? `${verticalSize}px` : verticalSize;
      }
      return (
        <div
          class={cls}
          // 样式合并顺序：gap 计算值 → 语义化 root → 全局 style → 用户 attrs.style（最后覆盖）
          style={[
            gapStyle,
            mergedStyles.value.root,
            contextStyle.value,
            (attrs as any).style,
          ]}
          // 透传其余 attrs（class/style 已单独处理，避免重复）
          {...pureAttrs(attrs)}
        >
          {nodes}
        </div>
      );
    };
  },
  {
    name: 'AsSpace',
    inheritAttrs: false,
  },
);

const Space = AsSpace;

(Space as any).install = (app: App) => {
  app.component(AsSpace.name, Space);
  app.component(Compact.name, Compact);
  app.component(Addon.name, Addon);
};

export default Space;
export const SpaceCompact = Compact;
export const SpaceAddon = Addon;
