import type { CSSMotionProps } from '../util';
import type { ListRef, ScrollTo } from '../virtual-list';
import type {
  DataEntity,
  DataNode,
  FlattenNode,
  Key,
  KeyEntities,
} from './interface';

import { computed, defineComponent, ref, shallowRef, watch } from 'vue';

import { toPropsRefs } from '../util';
import useId, { getId } from '../util/hooks/useId';
import { VirtualList } from '../virtual-list';
import MotionTreeNode from './MotionTreeNode';
import { findExpandedKeys, getExpandRange } from './utils/diffUtil';
import { getKey, getTreeNodeProps } from './utils/treeUtil';

function itemKey(item: FlattenNode) {
  const { key, pos } = item;
  return String(getKey(key, pos));
}

export interface NodeListRef {
  getIndentWidth: () => number;
  scrollTo: ScrollTo;
}

export const MOTION_KEY = `VC_TREE_MOTION_${Math.random()}`;

const MotionNode: DataNode = {
  key: MOTION_KEY,
};

export const MotionEntity: DataEntity = {
  key: MOTION_KEY,
  level: 0,
  index: 0,
  pos: '0',
  node: MotionNode,
  nodes: [MotionNode],
};

const MotionFlattenData: FlattenNode = {
  parent: null,
  children: [],
  pos: MotionEntity.pos,
  data: MotionNode,
  title: null,
  key: MOTION_KEY,
  isStart: [],
  isEnd: [],
};

function getMinimumRangeTransitionRange(
  list: FlattenNode[],
  virtual: boolean | undefined,
  height: number | undefined,
  itemHeight: number | undefined,
) {
  if (virtual === false || !height || !itemHeight) {
    return list;
  }

  return list.slice(0, Math.ceil(height / itemHeight) + 1);
}

export interface NodeListProps {
  activeItem?: FlattenNode | null;
  checkable?: boolean;
  checkedKeys: Key[];
  data?: FlattenNode[];
  disabled?: boolean;
  dragging?: boolean;
  dragOverNodeKey: Key | null;
  dropPosition: null | number;

  expandedKeys: Key[];
  focusable?: boolean;
  halfCheckedKeys: Key[];
  // Virtual list
  height?: number;
  itemHeight?: number;
  keyEntities: KeyEntities;
  loadedKeys: Key[];

  loadingKeys: Key[];
  motion?: CSSMotionProps;
  onActiveChange?: (key: Key | null) => void;
  onBlur?: (e: FocusEvent) => void;

  onContextmenu?: (e: MouseEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onListChangeEnd?: () => void;

  onListChangeStart?: () => void;

  onMouseDown?: (e: MouseEvent) => void;
  onScroll?: (e: Event) => void;
  prefixCls: string;
  scrollWidth?: number;
  selectable?: boolean;

  selectedKeys: Key[];
  style?: any;

  tabIndex?: number;
  virtual?: boolean;
}

const NodeList = defineComponent<NodeListProps>(
  (props, { attrs, expose }) => {
    const treeId = useId();
    const listRef = ref<ListRef>();
    const indentMeasurerRef = ref<HTMLDivElement>();
    const { expandedKeys, data } = toPropsRefs(props, 'expandedKeys', 'data');

    const treeNodeRequiredProps = computed(() => ({
      expandedKeys: expandedKeys.value || [],
      selectedKeys: props.selectedKeys || [],
      loadedKeys: props.loadedKeys || [],
      loadingKeys: props.loadingKeys || [],
      checkedKeys: props.checkedKeys || [],
      halfCheckedKeys: props.halfCheckedKeys || [],
      dragOverNodeKey: props.dragOverNodeKey,
      dropPosition: props.dropPosition,
      keyEntities: props.keyEntities,
    }));

    expose<NodeListRef>({
      scrollTo: (scroll) => {
        listRef.value?.scrollTo(scroll);
      },
      getIndentWidth: () => indentMeasurerRef.value?.offsetWidth || 0,
    });

    const VirtualListAny = VirtualList as any;

    // ============================== Motion ==============================
    const prevExpandedKeys = shallowRef<Key[]>(props.expandedKeys);
    const prevData = shallowRef<FlattenNode[]>(props.data || []);
    const transitionData = shallowRef<FlattenNode[]>(props.data || []);
    const transitionRange = shallowRef<FlattenNode[]>([]);
    const motionType = ref<'hide' | 'show' | null>(null);

    const dataRef = shallowRef<FlattenNode[]>(props.data || []);
    watch(
      data,
      (newData) => {
        dataRef.value = (newData || []) as any;
      },
      { immediate: true },
    );

    function onMotionEnd() {
      const latestData = dataRef.value;
      prevData.value = latestData;
      transitionData.value = latestData;
      transitionRange.value = [];
      motionType.value = null;

      props.onListChangeEnd?.();
    }

    watch(
      () => props.dragging,
      (dragging) => {
        if (!dragging) {
          onMotionEnd();
        }
      },
      { immediate: true },
    );

    watch(
      [expandedKeys, data],
      () => {
        const diffExpanded = findExpandedKeys(
          prevExpandedKeys.value,
          expandedKeys.value,
        );
        if (diffExpanded.key !== null) {
          if (diffExpanded.add) {
            const keyIndex = prevData.value?.findIndex?.(
              ({ key }) => key === diffExpanded.key,
            );
            const rangeNodes = getMinimumRangeTransitionRange(
              getExpandRange(prevData.value!, data.value!, diffExpanded.key!),
              props.virtual,
              props.height,
              props.itemHeight,
            );

            const newTransitionData: FlattenNode[] =
              prevData.value?.slice?.() ?? [];
            newTransitionData.splice(keyIndex! + 1, 0, MotionFlattenData);
            transitionData.value = newTransitionData;
            transitionRange.value = rangeNodes;
            motionType.value = 'show';
          } else {
            const keyIndex = data.value?.findIndex?.(
              ({ key }) => key === diffExpanded.key,
            );
            const rangeNodes = getMinimumRangeTransitionRange(
              getExpandRange(data.value!, prevData.value!, diffExpanded.key!),
              props.virtual,
              props.height,
              props.itemHeight,
            );

            const newTransitionData: FlattenNode[] =
              data.value?.slice?.() ?? [];
            newTransitionData.splice(keyIndex! + 1, 0, MotionFlattenData);
            transitionData.value = newTransitionData;
            transitionRange.value = rangeNodes;
            motionType.value = 'hide';
          }
        } else if (prevData.value !== data.value) {
          // If whole data changed, we just refresh the list
          prevData.value = data.value || [];
          transitionData.value = data.value || [];
        }
        prevExpandedKeys.value = expandedKeys.value || [];
      },
      {
        immediate: true,
        flush: 'post',
      },
    );

    const mergedData = computed(() =>
      props.motion ? transitionData.value : props.data || [],
    );

    return () => {
      const {
        motion,
        activeItem,
        focusable,
        disabled,
        tabIndex,
        prefixCls,
        virtual,
        itemHeight,
        height,
        scrollWidth,
        onScroll,
        onContextmenu,
        onKeyDown,
        onFocus,
        onBlur,
        onMouseDown,
        onListChangeStart,
        onActiveChange,
      } = props;
      return (
        <>
          <div
            aria-hidden
            class={`${prefixCls}-treenode`}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              visibility: 'hidden',
              height: 0,
              overflow: 'hidden',
              border: 0,
              padding: 0,
            }}
          >
            <div class={`${prefixCls}-indent`}>
              <div class={`${prefixCls}-indent-unit`} ref={indentMeasurerRef} />
            </div>
          </div>

          <VirtualListAny
            {...attrs}
            aria-activedescendant={
              activeItem ? getId(treeId, activeItem.key) : undefined
            }
            data={mergedData.value}
            fullHeight={false}
            height={height}
            itemHeight={itemHeight}
            itemKey={itemKey}
            onBlur={onBlur}
            onContextmenu={onContextmenu}
            onFocus={onFocus}
            onKeydown={onKeyDown}
            onMousedown={onMouseDown}
            onScroll={onScroll}
            onVisibleChange={(originList: FlattenNode[]) => {
              // The best match is using `fullList` - `originList` = `restList`
              // and check the `restList` to see if has the MOTION_KEY node
              // but this will cause performance issue for long list compare
              // we just check `originList` and repeat trigger `onMotionEnd`
              if (
                motionType.value &&
                originList.every((item) => itemKey(item) !== MOTION_KEY)
              ) {
                onMotionEnd();
              }
            }}
            prefixCls={`${prefixCls}-list`}
            ref={listRef}
            role="tree"
            scrollWidth={scrollWidth}
            style={props.style}
            tabindex={focusable !== false && !disabled ? tabIndex : undefined}
            virtual={virtual}
          >
            {({ item: treeNode }: any) => {
              const {
                pos,
                data: nodeData,
                title,
                key,
                isStart,
                isEnd,
              } = treeNode;
              const mergedKey = getKey(key, pos);
              const treeNodeProps = getTreeNodeProps(
                mergedKey,
                treeNodeRequiredProps.value,
              );
              const active =
                !!props.activeItem && mergedKey === props.activeItem.key;

              const restProps = { ...nodeData };
              delete restProps.key;
              delete restProps.children;
              return (
                <MotionTreeNode
                  {...restProps}
                  {...treeNodeProps}
                  active={active}
                  data={nodeData}
                  isEnd={isEnd}
                  isStart={isStart}
                  motion={motion}
                  motionNodes={
                    key === MOTION_KEY ? transitionRange.value : null
                  }
                  motionType={motionType.value}
                  onMotionEnd={onMotionEnd}
                  onMotionStart={onListChangeStart}
                  onMouseMove={() => onActiveChange?.(null)}
                  pos={pos}
                  title={title}
                  treeId={treeId}
                  treeNodeRequiredProps={treeNodeRequiredProps.value}
                />
              );
            }}
          </VirtualListAny>
        </>
      );
    };
  },
  {
    name: 'NodeList',
    inheritAttrs: false,
  },
);

export default NodeList;
