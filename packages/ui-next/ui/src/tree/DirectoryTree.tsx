import type { SlotsType } from 'vue';

import type {
  BasicDataNode,
  DataNode,
  EventDataNode,
  Key,
} from '@arvin-studio/headless';

import type {
  AsdTreeNodeAttribute,
  TreeEmits,
  TreeProps,
  TreeSlots,
} from './Tree.tsx';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import {
  conductExpandParent,
  convertDataToEntities,
  convertTreeToData,
  filterEmpty,
  getAttrStyleAndClass,
} from '@arvin-studio/headless';
import {
  FileOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import { useComponentBaseConfig } from '../config-provider/context';
import Tree from './Tree';
import { calcRangeKeys, convertDirectoryKeysToNodes } from './utils/dictUtil';

export type ExpandAction = 'click' | 'doubleClick' | false;

export interface DirectoryTreeProps<
  T extends BasicDataNode = DataNode,
> /* @vue-ignore */
  extends DirectoryTreeEmitsProps, TreeProps<T> {
  expandAction?: ExpandAction;
}

export interface DirectoryTreeEmits extends TreeEmits {}
export type DirectoryTreeEmitsProps = {
  [K in keyof DirectoryTreeEmits as `on${Capitalize<K & string>}`]?: DirectoryTreeEmits[K];
};
export type DirectoryTreeEmitsType = DirectoryTreeEmitsProps;
export interface DirectoryTreeSlots extends TreeSlots {}

function getIcon(props: AsdTreeNodeAttribute) {
  const { isLeaf, expanded } = props;
  if (isLeaf) {
    return <FileOutlined />;
  }
  return expanded ? <FolderOpenOutlined /> : <FolderOutlined />;
}

function getTreeData({
  treeData,
  children,
}: {
  children: any[];
  treeData?: DirectoryTreeProps<BasicDataNode>['treeData'];
}): DataNode[] {
  return (treeData as DataNode[] | undefined) || convertTreeToData(children);
}

const DirectoryTree = defineComponent<
  DirectoryTreeProps<BasicDataNode>,
  DirectoryTreeEmits,
  string,
  SlotsType<DirectoryTreeSlots>
>(
  (props, { slots, emit, expose, attrs }) => {
    // Shift click usage
    const lastSelectedKey = shallowRef<Key>();
    const cachedSelectedKeys = shallowRef<Key[]>();

    const children = computed(() => filterEmpty(slots?.default?.()));

    const getInitExpandedKeys = () => {
      const { defaultExpandAll, defaultExpandParent = true } = props;
      let _children: any = children.value;
      if (_children.length === 0) {
        _children = undefined;
      }
      const { keyEntities } = convertDataToEntities(
        getTreeData({ ...props, children: _children }),
        {
          fieldNames: props.fieldNames,
        },
      );

      let initExpandedKeys: Key[];
      if (defaultExpandAll) {
        initExpandedKeys = Object.keys(keyEntities);
      } else if (defaultExpandParent) {
        initExpandedKeys = conductExpandParent(
          // eslint-disable-next-line unicorn/consistent-optional-chaining
          props.expandedKeys || props?.defaultExpandedKeys || [],
          keyEntities,
        );
      } else {
        initExpandedKeys =
          props?.expandedKeys || props?.defaultExpandedKeys || [];
      }
      return initExpandedKeys;
    };

    const selectedKeys = shallowRef<Key[]>(
      props?.selectedKeys || props?.defaultSelectedKeys || [],
    );

    const expandedKeys = shallowRef<Key[]>(getInitExpandedKeys());

    watch(
      () => props.selectedKeys,
      () => {
        if (props.selectedKeys !== selectedKeys.value) {
          selectedKeys.value = props?.selectedKeys || [];
        }
      },
    );

    watch(
      () => props.expandedKeys,
      () => {
        if (props.expandedKeys !== expandedKeys.value) {
          expandedKeys.value = props?.expandedKeys || [];
        }
      },
    );

    const onExpand = (
      keys: Key[],
      info: {
        expanded: boolean;
        nativeEvent: MouseEvent;
        node: EventDataNode<any>;
      },
    ) => {
      emit('update:expandedKeys', keys);
      emit('expand', keys, info);
    };

    const onSelect = (
      keys: Key[],
      event: {
        event: 'select';
        nativeEvent: MouseEvent;
        node: any;
        selected: boolean;
        selectedNodes: DataNode[];
      },
    ) => {
      const { multiple, fieldNames } = props;
      const { node, nativeEvent } = event;
      const { key = '' } = node;
      let _children: any = children.value;
      if (_children.length === 0) {
        _children = undefined;
      }
      const treeData = getTreeData({ ...props, children: _children });
      // const newState: DirectoryTreeState = {};

      // We need wrap this event since some value is not same
      const newEvent = {
        ...event,
        selected: true, // Directory selected always true
      };
      // Windows / Mac single pick
      const ctrlPick: boolean = nativeEvent?.ctrlKey || nativeEvent?.metaKey;
      const shiftPick: boolean = nativeEvent?.shiftKey;

      // Generate new selected keys
      let newSelectedKeys: Key[];
      if (multiple && ctrlPick) {
        // Control click
        newSelectedKeys = keys;
        lastSelectedKey.value = key;
        cachedSelectedKeys.value = newSelectedKeys;
      } else if (multiple && shiftPick) {
        // Shift click
        newSelectedKeys = Array.from(
          new Set([
            ...(cachedSelectedKeys.value || []),
            ...calcRangeKeys({
              treeData,
              expandedKeys: expandedKeys.value,
              startKey: key,
              endKey: lastSelectedKey.value!,
              fieldNames,
            }),
          ]),
        );
      } else {
        // Single click
        newSelectedKeys = [key];
        lastSelectedKey.value = key;
        cachedSelectedKeys.value = newSelectedKeys;
      }
      newEvent.selectedNodes = convertDirectoryKeysToNodes(
        treeData,
        newSelectedKeys,
        fieldNames,
      );
      selectedKeys.value = newSelectedKeys;
      emit('update:selectedKeys', newSelectedKeys);
      emit('select', newSelectedKeys, newEvent);
    };
    const { prefixCls, direction } = useComponentBaseConfig('tree', props);
    const treeRef = shallowRef();

    expose({
      scrollTo(...args: any[]) {
        return treeRef.value?.scrollTo?.(...args);
      },
    });
    return () => {
      const { showIcon = true, expandAction = 'click', ...otherProps } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);

      const connectClassName = clsx(
        `${prefixCls.value}-directory`,
        {
          [`${prefixCls.value}-directory-rtl`]: direction.value === 'rtl',
        },
        className,
      );
      const onAttrs: Partial<DirectoryTreeEmitsType> = {
        onCheck(checked: any, info: any) {
          emit('check', checked, info);
          emit(
            'update:checkedKeys',
            Array.isArray(checked) ? checked : (checked?.checked ?? []),
          );
        },
        onClick(...args: any[]) {
          // oxlint-disable-next-line typescript/ban-ts-comment
          // @ts-expect-error
          emit('click', ...args);
        },
        onBlur(e: any) {
          emit('blur', e);
        },
        onLoad(loadKeys: any, info: any) {
          emit('load', loadKeys, info);
        },
        onFocus(e: any) {
          emit('focus', e);
        },
        onActiveChange(key: any) {
          emit('activeChange', key);
          emit('update:activeKey', key!);
        },
        onDrop(info: any) {
          emit('drop', info);
        },
        onDragend(info: any) {
          emit('dragend', info);
        },
        onDragenter(info: any) {
          emit('dragenter', info);
        },
        onDragleave(info: any) {
          emit('dragleave', info);
        },
        onDragover(info: any) {
          emit('dragover', info);
        },
        onDoubleClick(...args: any[]) {
          // oxlint-disable-next-line typescript/ban-ts-comment
          // @ts-expect-error
          emit('doubleClick', ...args);
          // oxlint-disable-next-line typescript/ban-ts-comment
          // @ts-expect-error
          emit('dblclick', ...args);
        },
        onContextmenu(e: any) {
          emit('contextmenu', e);
        },
        onKeydown(e: any) {
          emit('keydown', e);
        },
        onScroll(e: any) {
          emit('scroll', e);
        },
        onRightClick(info: any) {
          emit('rightClick', info);
        },
        onDragstart(info: any) {
          emit('dragstart', info);
        },
        onMouseenter(e: any) {
          emit('mouseenter', e);
        },
        onMouseleave(e: any) {
          emit('mouseleave', e);
        },
      };

      return (
        <Tree
          ref={treeRef}
          {...restAttrs}
          {...omit(otherProps, ['prefixCls'])}
          {...(onAttrs as any)}
          blockNode={props?.blockNode ?? true}
          class={connectClassName}
          expandAction={expandAction}
          expandedKeys={expandedKeys.value}
          icon={props?.icon ?? getIcon}
          onExpand={onExpand}
          onSelect={onSelect}
          prefixCls={prefixCls.value}
          selectedKeys={selectedKeys.value}
          showIcon={showIcon}
          style={style}
          v-slots={slots}
        />
      );
    };
  },
  {
    name: 'AsDirectoryTree',
    inheritAttrs: false,
  },
);

export default DirectoryTree;
