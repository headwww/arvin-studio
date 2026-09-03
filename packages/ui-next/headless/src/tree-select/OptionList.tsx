import type { RefOptionListProps } from '../select';
import type { DataEntity, TreeRef } from '../tree';
import type { Key } from '../util';
import type { DataNode } from './interface';

import {
  computed,
  defineComponent,
  provide,
  ref,
  shallowRef,
  watch,
} from 'vue';

import { useBaseProps } from '../select';
import Tree, { UnstableTreeContextKey } from '../tree';
import KeyCode from '../util/KeyCode';
import { useLegacyContext } from './LegacyContext';
import { useTreeSelectContext } from './TreeSelectContext';
import { getAllKeys, isCheckDisabled } from './utils/valueUtil';

const HIDDEN_STYLE = {
  width: 0,
  height: 0,
  display: 'flex',
  overflow: 'hidden',
  opacity: 0,
  border: 0,
  padding: 0,
  margin: 0,
};

interface TreeEventInfo {
  checked?: boolean;
  node: { key: Key };
  selected?: boolean;
}

const OptionList = defineComponent({
  name: 'OptionList',
  inheritAttrs: false,
  setup(_, { expose }) {
    const baseProps = useBaseProps();
    const context = useTreeSelectContext();
    const legacyContext = useLegacyContext();

    const treeRef = ref<null | TreeRef>(null);

    const memoTreeData = computed(() => context.value?.treeData || []);

    const mergedCheckedKeys = computed(() => {
      if (!legacyContext.value?.checkable) {
        return null;
      }

      return {
        checked: legacyContext.value.checkedKeys,
        halfChecked: legacyContext.value.halfCheckedKeys,
      };
    });

    // ========================== Scroll ==========================
    watch(
      () => baseProps.value?.open,
      (open) => {
        if (
          open &&
          !baseProps.value?.multiple &&
          legacyContext.value?.checkedKeys?.length
        ) {
          treeRef.value?.scrollTo({ key: legacyContext.value.checkedKeys[0] });
        }
      },
      { immediate: true },
    );

    // ========================== Events ==========================
    const onListMouseDown = (event: MouseEvent) => {
      event.preventDefault();
    };

    const onInternalSelect = (_: Key[], info: TreeEventInfo) => {
      const { node } = info as any;

      if (legacyContext.value?.checkable && isCheckDisabled(node as any)) {
        return;
      }

      const checkedKeys = legacyContext.value?.checkedKeys || [];

      context.value?.onSelect(node.key, {
        selected: !checkedKeys.includes(node.key),
        source: 'option',
      });

      if (!baseProps.value?.multiple) {
        baseProps.value?.toggleOpen(false);
      }
    };

    // =========================== Keys ===========================
    const expandedKeys = ref<Key[]>(
      legacyContext.value?.treeDefaultExpandedKeys || [],
    );
    const searchExpandedKeys = ref<Key[] | null>(null);

    const mergedExpandedKeys = computed<Key[] | undefined>(() => {
      if (legacyContext.value?.treeExpandedKeys) {
        return [...legacyContext.value.treeExpandedKeys];
      }

      if (baseProps.value?.searchValue) {
        return searchExpandedKeys.value || expandedKeys.value || [];
      }

      return expandedKeys.value;
    });

    const onInternalExpand = (keys: Key[]) => {
      expandedKeys.value = keys;
      searchExpandedKeys.value = keys;

      legacyContext.value?.onTreeExpand?.(keys);
    };

    // ========================== Search ==========================
    const filterTreeNode = (treeNode: any) => {
      const searchValue = String(baseProps.value?.searchValue || '');
      if (!searchValue) {
        return false;
      }

      const lowerSearchValue = searchValue.toLowerCase();
      const treeNodeFilterProp =
        legacyContext.value?.treeNodeFilterProp || 'value';

      return String(treeNode?.[treeNodeFilterProp])
        .toLowerCase()
        .includes(lowerSearchValue);
    };

    watch(
      () => baseProps.value?.searchValue,
      (val) => {
        if (val) {
          searchExpandedKeys.value = getAllKeys(
            memoTreeData.value,
            context.value?.fieldNames || {},
          );
        }
      },
      { immediate: true },
    );

    // ========================= Disabled =========================
    const disabledCache = shallowRef<Map<Key, boolean>>(new Map());

    watch(
      () => context.value?.leftMaxCount,
      (val) => {
        if (val) {
          disabledCache.value = new Map();
        }
      },
      { immediate: true },
    );

    function getDisabledWithCache(node: DataNode) {
      const value = (node as any)[
        context.value!.fieldNames.value as any
      ] as Key;
      if (!disabledCache.value.has(value)) {
        const entity = context.value?.valueEntities.get(value);
        const isLeaf = ((entity?.children || []) as DataEntity[]).length === 0;

        if (isLeaf) {
          disabledCache.value.set(value, false);
        } else {
          const checkedKeys = legacyContext.value?.checkedKeys || [];
          const checkableChildren = (entity?.children || []).filter(
            (child: { node: { disabled: any } }) =>
              !child.node.disabled &&
              !(child.node as any).disableCheckbox &&
              !checkedKeys.includes(
                (child.node as any)[context.value!.fieldNames.value as any],
              ),
          );

          disabledCache.value.set(
            value,
            checkableChildren.length > (context.value?.leftMaxCount || 0),
          );
        }
      }
      return disabledCache.value.get(value);
    }

    const nodeDisabled = (node: DataNode) => {
      const checkedKeys = legacyContext.value?.checkedKeys || [];
      const nodeValue = (node as any)[
        context.value!.fieldNames.value as any
      ] as Key;

      if (checkedKeys.includes(nodeValue)) {
        return false;
      }

      const leftMaxCount = context.value?.leftMaxCount ?? null;
      if (leftMaxCount === null) {
        return false;
      }

      if (leftMaxCount <= 0) {
        return true;
      }

      // This is a low performance calculation
      if (context.value?.leafCountOnly && leftMaxCount) {
        return getDisabledWithCache(node) || false;
      }

      return false;
    };

    provide(UnstableTreeContextKey, { nodeDisabled });

    // ========================== Get First Selectable Node ==========================
    const getFirstMatchingNode = (nodes: DataNode[]): DataNode | null => {
      for (const node of nodes) {
        if ((node as any).disabled || (node as any).selectable === false) {
          continue;
        }

        if (baseProps.value?.searchValue) {
          if (filterTreeNode(node)) {
            return node;
          }
        } else {
          return node;
        }

        const children = (node as any)[
          context.value!.fieldNames.children as any
        ] as DataNode[] | undefined;
        if (children) {
          const matchInChildren = getFirstMatchingNode(children);
          if (matchInChildren) {
            return matchInChildren;
          }
        }
      }
      return null;
    };

    // ========================== Active ==========================
    const activeKey = ref<Key | null>(null);
    const activeEntity = computed(
      () =>
        legacyContext.value?.keyEntities?.[String(activeKey.value)] as
          | DataEntity
          | undefined,
    );

    watch(
      [() => baseProps.value?.open, () => baseProps.value?.searchValue],
      ([open]) => {
        if (!open) {
          return;
        }

        const fieldNames = context.value?.fieldNames;

        const getFirstNode = () => {
          const firstNode = getFirstMatchingNode(memoTreeData.value);
          return firstNode
            ? (firstNode as any)[fieldNames?.value as any]
            : null;
        };

        // eslint-disable-next-line no-useless-assignment
        let nextActiveKey: Key | null = null;

        // single mode active first checked node
        nextActiveKey =
          !baseProps.value?.multiple &&
          legacyContext.value?.checkedKeys?.length &&
          !baseProps.value?.searchValue
            ? legacyContext.value.checkedKeys[0]
            : getFirstNode();

        activeKey.value = nextActiveKey;
      },
      { immediate: true },
    );

    // ========================= Keyboard =========================
    const onKeyDown = (event: KeyboardEvent) => {
      const which = (event as any).which || (event as any).keyCode;
      switch (which) {
        case KeyCode.DOWN:
        case KeyCode.LEFT:
        case KeyCode.RIGHT:
        case KeyCode.UP: {
          treeRef.value?.onKeyDown(event);
          break;
        }
        case KeyCode.ENTER: {
          if (activeEntity.value) {
            const isNodeDisabled = nodeDisabled(activeEntity.value.node as any);
            const { selectable, value, disabled } = activeEntity.value
              .node as any;
            if (selectable !== false && !disabled && !isNodeDisabled) {
              onInternalSelect([] as any, {
                node: { key: activeKey.value! },
                selected: !(legacyContext.value?.checkedKeys || []).includes(
                  value,
                ),
              });
            }
          }
          return;
        }
        case KeyCode.ESC: {
          baseProps.value?.toggleOpen(false);
        }
      }
    };

    const onKeyUp = () => {};
    expose<RefOptionListProps>({
      scrollTo: (scroll) => {
        treeRef.value?.scrollTo(scroll);
      },
      onKeyDown,
      onKeyUp,
    });

    // ========================== Render ==========================
    return () => {
      const prefixCls = baseProps.value?.prefixCls;
      const open = baseProps.value?.open;
      const notFoundContent = baseProps.value?.notFoundContent;

      const checkable = legacyContext.value?.checkable;
      const checkedKeys = legacyContext.value?.checkedKeys || [];
      const treeLoadedKeys = legacyContext.value?.treeLoadedKeys;
      const treeDefaultExpandAll = legacyContext.value?.treeDefaultExpandAll;
      const treeIcon = legacyContext.value?.treeIcon;
      const showTreeIcon = legacyContext.value?.showTreeIcon;
      const switcherIcon = legacyContext.value?.switcherIcon;
      const treeLine = legacyContext.value?.treeLine;
      const treeMotion = legacyContext.value?.treeMotion;
      const loadData = legacyContext.value?.loadData;
      const onTreeLoad = legacyContext.value?.onTreeLoad;

      const {
        fieldNames,
        virtual,
        listHeight,
        listItemHeight,
        listItemScrollOffset,
        popupMatchSelectWidth,
        treeExpandAction,
        treeTitleRender,
        onPopupScroll,
        classNames,
        styles,
      } = context.value || ({} as any);

      if (memoTreeData.value.length === 0) {
        return (
          <div
            class={`${prefixCls}-empty`}
            onMousedown={onListMouseDown}
            role="listbox"
          >
            {notFoundContent}
          </div>
        );
      }

      const syncLoadData = baseProps.value?.searchValue ? undefined : loadData;
      return (
        <div onMousedown={onListMouseDown}>
          {activeEntity.value && open && (
            <span aria-live="assertive" style={HIDDEN_STYLE}>
              {(activeEntity.value.node as any).value}
            </span>
          )}
          <Tree
            activeKey={activeKey.value as any}
            // We handle keys by out instead tree self
            checkable={checkable}
            checkedKeys={mergedCheckedKeys.value as any}
            checkStrictly
            classNames={(classNames as any)?.popup}
            defaultExpandAll={treeDefaultExpandAll}
            expandAction={treeExpandAction}
            expandedKeys={mergedExpandedKeys.value as any}
            fieldNames={fieldNames as any}
            filterTreeNode={filterTreeNode as any}
            focusable={false}
            height={listHeight}
            icon={treeIcon}
            itemHeight={listItemHeight}
            itemScrollOffset={listItemScrollOffset}
            loadData={syncLoadData as any}
            loadedKeys={treeLoadedKeys as any}
            motion={treeMotion}
            multiple={baseProps.value?.multiple}
            // Proxy event out
            onActiveChange={(key) => {
              activeKey.value = key;
            }}
            onCheck={onInternalSelect as any}
            onExpand={onInternalExpand as any}
            onLoad={onTreeLoad as any}
            onScroll={onPopupScroll}
            onSelect={onInternalSelect as any}
            prefixCls={`${prefixCls}-tree`}
            ref={(el: any) => {
              treeRef.value = el;
            }}
            selectedKeys={checkable ? [] : checkedKeys}
            showIcon={showTreeIcon}
            showLine={treeLine}
            styles={(styles as any)?.popup}
            switcherIcon={switcherIcon}
            titleRender={treeTitleRender}
            treeData={memoTreeData.value as any}
            virtual={virtual !== false && popupMatchSelectWidth !== false}
          />
        </div>
      );
    };
  },
});

export default OptionList;
