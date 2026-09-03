import type { CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit, VueNode } from '../../_util';

import {
  computed,
  defineComponent,
  nextTick,
  shallowRef,
  watch,
  watchEffect,
} from 'vue';

import { filterEmpty } from '@arvin-studio/headless';

import toList from '../../_util/toList';
import { getSlotPropsFnRun } from '../../_util/tools';
import { getTextNodeArr } from '../../_util/vueNode';
import { isValidText } from './util';

/** 隐藏测量节点 props（仅样式扩展） */
interface MeasureTextProps {
  style?: CSSProperties;
}

/** 测量节点暴露的方法 */
interface MeasureTextExpose {
  /** 当前渲染高度 */
  getHeight: () => number;
  /** 是否溢出（scrollHeight > clientHeight） */
  isExceed: () => boolean;
}

/**
 * MeasureText：隐藏测量节点
 * fixed 定位在左上角、不拦截事件；content 用真实内容渲染以测量真实尺寸。
 */
const MeasureText = defineComponent<
  MeasureTextProps,
  EmptyEmit,
  string,
  SlotsType<{ default?: () => any }>
>(
  (props, { slots, expose }) => {
    const spanRef = shallowRef<HTMLSpanElement>();
    expose({
      isExceed: () => {
        const span = spanRef.value!;
        return span.scrollHeight > span.clientHeight;
      },
      getHeight: () => spanRef.value?.clientHeight || 0,
    });

    return () => {
      return (
        <span
          aria-hidden
          ref={spanRef}
          style={{
            position: 'fixed',
            display: 'block',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            backgroundColor: 'rgba(255, 0, 0, 0.65)',
            ...props.style,
          }}
        >
          {slots.default?.()}
        </span>
      );
    };
  },
  {
    name: 'TypographyMeasureText',
    inheritAttrs: false,
  },
);

/** 计算节点列表的总长度（文本节点按字符数，其他节点按 1 个单位） */
function getNodesLen(nodeList: any[]) {
  return nodeList.reduce(
    (totalLen, node) =>
      totalLen + (isValidText(node) ? String(node).length : 1),
    0,
  );
}

/**
 * 按长度截断节点列表：从前往后累加，超过 len 的文本节点切掉尾部
 * 返回截断后的节点列表（可能含被切成一半的字符串）
 */
function sliceNodes(nodeList: any[], len: number) {
  let currLen = 0;
  const currentNodeList: any[] = [];

  for (const node of nodeList) {
    if (currLen === len) {
      return currentNodeList;
    }

    const canCut = isValidText(node);
    const nodeLen = canCut ? String(node).length : 1;
    const nextLen = currLen + nodeLen;

    // 超出目标长度：截断当前文本节点
    if (nextLen > len) {
      const restLen = len - currLen;
      currentNodeList.push(String(node).slice(0, restLen));
      return currentNodeList;
    }

    currentNodeList.push(node);
    currLen = nextLen;
  }

  return nodeList;
}

export interface EllipsisProps {
  /** 是否启用测量（false 时原样渲染） */
  enableMeasure?: boolean;
  /** 是否展开（展开时显示全文） */
  expanded: boolean;
  /**
   * Mark for misc update. Which will not affect ellipsis content length.
   * e.g. tooltip content update.
   */
  /**
   * 杂项依赖标记：内容长度不变但需要重新渲染的依赖
   * （如 tooltip 内容变化、复制态切换），变化时触发测量重新执行
   */
  miscDeps: any[];
  /** 省略态变化回调 */
  onEllipsis: (isEllipsis: boolean) => void;
  /** 最大行数 */
  rows: number;
  /** 待省略的内容 */
  text?: VueNode;
  /** 容器宽度（测量基准） */
  width: number;
}

// Measure for the `text` is exceed the `rows` or not
// 测量状态机
const STATUS_MEASURE_NONE = 0; // 未启用/无测量条件
const STATUS_MEASURE_PREPARE = 1; // 准备：记录父级 white-space
const STATUS_MEASURE_START = 2; // 开始：渲染 3 个测量节点判断溢出
const STATUS_MEASURE_NEED_ELLIPSIS = 3; // 需要省略：进入二分查找截断点
const STATUS_MEASURE_NO_NEED_ELLIPSIS = 4; // 无需省略：完整展示

/** 多行截断的 CSS 基础样式（-webkit-box 两行布局） */
const lineClipStyle: CSSProperties = {
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
};

const Ellipsis = defineComponent<
  EllipsisProps,
  EmptyEmit,
  string,
  SlotsType<{
    default?: (nodeList: any[], canEllipsis: boolean) => any;
  }>
>(
  (props, { slots }) => {
    // 把 text 归一化为节点数组（过滤空节点、提取文本节点）
    const nodeList = computed(() =>
      getTextNodeArr(
        // eslint-disable-next-line unicorn/max-nested-calls
        filterEmpty(toList(getSlotPropsFnRun({}, props, 'text'), true)),
      ),
    );

    // 内容总长度（字符数）
    const nodeLen = computed(() => getNodesLen(nodeList.value));

    // 当前截断点区间 [min, max]（二分查找目标）
    const ellipsisCutIndex = shallowRef<[number, number] | null>(null);
    const cutMidRef = shallowRef<MeasureTextExpose>();

    // 各测量节点引用
    const measureWhiteSpaceRef = shallowRef<HTMLElement>();
    const needEllipsisRef = shallowRef<MeasureTextExpose>();
    const descRowsEllipsisRef = shallowRef<MeasureTextExpose>();
    const symbolRowEllipsisRef = shallowRef<MeasureTextExpose>();

    const canEllipsis = shallowRef(false);
    const needEllipsis = shallowRef(STATUS_MEASURE_NONE);
    const ellipsisHeight = shallowRef(0);
    const parentWhiteSpace = shallowRef<CSSProperties['whiteSpace'] | null>(
      null,
    );

    // 测量条件齐备（启用 + 有宽度 + 有内容 + 有行数）→ 进入 PREPARE
    watch(
      [() => props.enableMeasure, () => props.width, nodeLen, () => props.rows],
      ([enableMeasure, width, len, rows]) => {
        needEllipsis.value =
          enableMeasure && width && len && rows
            ? STATUS_MEASURE_PREPARE
            : STATUS_MEASURE_NONE;
      },
      { immediate: true },
    );

    // 状态机推进：PREPARE → START → NEED / NO_NEED
    watch(
      needEllipsis,
      async (status) => {
        await nextTick();
        if (status === STATUS_MEASURE_PREPARE) {
          // 记录父级 white-space（测量时需按父级实际换行行为渲染）
          needEllipsis.value = STATUS_MEASURE_START;
          const nextWhiteSpace = measureWhiteSpaceRef.value
            ? getComputedStyle(measureWhiteSpaceRef.value).whiteSpace
            : null;
          parentWhiteSpace.value = nextWhiteSpace;
        } else if (status === STATUS_MEASURE_START) {
          // 用 rows 行的测量节点判断是否溢出
          const isOverflow = !!needEllipsisRef.value?.isExceed();
          needEllipsis.value = isOverflow
            ? STATUS_MEASURE_NEED_ELLIPSIS
            : STATUS_MEASURE_NO_NEED_ELLIPSIS;
          ellipsisCutIndex.value = isOverflow ? [0, nodeLen.value] : null;
          canEllipsis.value = isOverflow;

          // 计算"省略后仍放得下"的目标高度：
          // rows 行真实高度 vs （rows-1 行 + 省略号行）高度，取较大者
          const baseRowsEllipsisHeight =
            needEllipsisRef.value?.getHeight?.() || 0;
          const descRowsEllipsisHeight =
            props.rows === 1
              ? 0
              : descRowsEllipsisRef.value?.getHeight?.() || 0;
          const symbolRowEllipsisHeight =
            symbolRowEllipsisRef.value?.getHeight?.() || 0;
          const maxRowsHeight = Math.max(
            baseRowsEllipsisHeight,
            descRowsEllipsisHeight + symbolRowEllipsisHeight,
          );

          // +1 容忍浮点误差
          ellipsisHeight.value = maxRowsHeight + 1;

          props.onEllipsis?.(isOverflow);
        }
      },
      { flush: 'post', immediate: true },
    );

    // ========================= Cut Measure =========================
    // 二分查找的中位索引
    const cutMidIndex = shallowRef(0);
    watchEffect(() => {
      const range = ellipsisCutIndex.value;
      if (range) {
        cutMidIndex.value = Math.ceil((range[0] + range[1]) / 2);
      }
    });

    // 二分推进：每次截取中位长度测量高度，向"恰好放得下"收敛
    watch(
      ellipsisCutIndex,
      async () => {
        await nextTick();
        const [minIndex, maxIndex] = ellipsisCutIndex.value || [0, 0];
        if (minIndex !== maxIndex) {
          const midHeight = cutMidRef.value?.getHeight() || 0;
          const isOverflow = midHeight > ellipsisHeight.value;
          let targetMidIndex = cutMidIndex.value;
          // 区间收敛到相邻时：溢出取 min，否则取 max（精确截断点）
          if (maxIndex - minIndex === 1) {
            targetMidIndex = isOverflow ? minIndex : maxIndex;
          }
          ellipsisCutIndex.value = isOverflow
            ? [minIndex, targetMidIndex]
            : [targetMidIndex, maxIndex];
        }
      },
      { flush: 'post', immediate: true },
    );

    return () => {
      const fullContent = slots?.default?.(nodeList.value, false);
      // ========================= Text Content =========================
      // 最终内容渲染函数
      const finalContentFn = () => {
        // 未启用测量：原样渲染
        if (!props.enableMeasure) {
          return slots?.default?.(nodeList.value, false);
        }
        // 非"需要省略"态（测量中 / 无需省略）：渲染完整内容
        if (
          needEllipsis.value !== STATUS_MEASURE_NEED_ELLIPSIS ||
          !ellipsisCutIndex.value ||
          ellipsisCutIndex.value[0] !== ellipsisCutIndex.value[1]
        ) {
          const content = slots?.default?.(nodeList.value, false);
          // Limit the max line count to avoid scrollbar blink unless no need ellipsis
          // https://github.com/ant-design/ant-design/issues/42958
          // 测量中限制最大行数，避免滚动条闪烁（无需省略时不受限）
          if (
            [STATUS_MEASURE_NO_NEED_ELLIPSIS, STATUS_MEASURE_NONE].includes(
              needEllipsis.value,
            )
          ) {
            return content;
          }
          return (
            <span
              style={{
                ...lineClipStyle,
                WebkitLineClamp: props.rows,
              }}
            >
              {content}
            </span>
          );
        }

        // 真正需要省略：截断内容交给 Base 渲染（展开态显示全文）
        return slots?.default?.(
          props.expanded
            ? nodeList.value
            : sliceNodes(nodeList.value, ellipsisCutIndex.value[0]),
          canEllipsis.value,
        );
      };
      const finalContent = finalContentFn();

      // ============================ Render ============================
      // 测量节点统一样式：固定宽度、无内外边距、跟随父级换行行为
      const measureStyle = {
        width: `${props.width}px`,
        margin: 0,
        padding: 0,
        whiteSpace: parentWhiteSpace.value === 'nowrap' ? 'normal' : 'inherit',
      };
      return (
        <>
          {/* Final show content */}
          {/* 最终展示内容 */}
          {finalContent}

          {/* Measure if current content is exceed the rows */}
          {/* START 阶段：渲染 3 个测量节点（rows / rows-1 / 1 行）判断溢出并计算目标高度 */}
          {needEllipsis.value === STATUS_MEASURE_START && (
            <>
              {/** With `rows` */}
              {/* rows 行：判断是否溢出 */}
              <MeasureText
                ref={needEllipsisRef as any}
                style={{
                  ...measureStyle,
                  ...lineClipStyle,
                  WebkitLineClamp: props.rows,
                }}
              >
                {fullContent}
              </MeasureText>

              {/** With `rows - 1` */}
              {/* rows-1 行：配合省略号行的目标高度 */}
              <MeasureText
                ref={descRowsEllipsisRef as any}
                style={{
                  ...measureStyle,
                  ...lineClipStyle,
                  WebkitLineClamp: props.rows - 1,
                }}
              >
                {fullContent}
              </MeasureText>

              {/** With `rows - 1` */}
              {/* 1 行：省略号占位高度 */}
              <MeasureText
                ref={symbolRowEllipsisRef as any}
                style={{
                  ...measureStyle,
                  ...lineClipStyle,
                  WebkitLineClamp: 1,
                }}
              >
                {slots?.default?.([], true)}
              </MeasureText>
            </>
          )}

          {/* Real size overflow measure */}
          {/* 二分查找阶段：测量中位截断高度的节点（fixed 在下方避免遮挡） */}
          {needEllipsis.value === STATUS_MEASURE_NEED_ELLIPSIS &&
            ellipsisCutIndex.value &&
            ellipsisCutIndex.value[0] !== ellipsisCutIndex.value[1] && (
              <MeasureText
                ref={cutMidRef as any}
                style={{
                  ...measureStyle,
                  top: `400px`,
                }}
              >
                {slots?.default?.(
                  sliceNodes(nodeList.value, cutMidIndex.value),
                  true,
                )}
              </MeasureText>
            )}

          {/* Measure white-space */}
          {/* PREPARE 阶段：读取父级 white-space 的占位节点 */}
          {needEllipsis.value === STATUS_MEASURE_PREPARE && (
            <span
              ref={measureWhiteSpaceRef as any}
              style={{ whiteSpace: 'inherit' }}
            />
          )}
        </>
      );
    };
  },
  {
    name: 'TypographyEllipsis',
    inheritAttrs: false,
  },
);

export default Ellipsis;
