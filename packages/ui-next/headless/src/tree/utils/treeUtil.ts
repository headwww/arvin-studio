import type {
  BasicDataNode,
  DataEntity,
  DataNode,
  EventDataNode,
  FieldNames,
  FlattenNode,
  GetKey,
  Key,
  KeyEntities,
  NodeElement,
  TreeNodeProps,
} from '../interface';

import { omit } from '@arvin-studio/kit';

import { toArray, warning } from '../../util';
import getEntity from './keyUtil';

export function getPosition(level: number | string, index: number) {
  return `${level}-${index}`;
}

export function isTreeNode(node: NodeElement) {
  return !!(node && node.type && (node.type as any).isTreeNode);
}

export function getKey(key: Key, pos: string) {
  if (key !== null && key !== undefined) {
    return key;
  }
  return pos;
}

export function fillFieldNames(fieldNames?: FieldNames): Required<FieldNames> {
  const { title, _title, key, children } = fieldNames || {};
  const mergedTitle = title || 'title';

  return {
    title: mergedTitle,
    _title: _title || [mergedTitle],
    key: key || 'key',
    children: children || 'children',
  };
}

export function warningWithoutKey(
  treeData: DataNode[],
  fieldNames: FieldNames,
) {
  const keys: Map<string, boolean> = new Map();
  const mergedFieldNames = fillFieldNames(fieldNames);

  function dig(list: DataNode[], path: string = '') {
    (list || []).forEach((treeNode) => {
      const key = (treeNode as any)[mergedFieldNames.key];
      const children = (treeNode as any)[mergedFieldNames.children];
      warning(
        key !== null && key !== undefined,
        `Tree node must have a certain key: [${path}${key}]`,
      );

      const recordKey = String(key);
      warning(
        !keys.has(recordKey) || key === null || key === undefined,
        `Same 'key' exist in the Tree: ${recordKey}`,
      );
      keys.set(recordKey, true);

      dig(children, `${path}${recordKey} > `);
    });
  }

  dig(treeData);
}

export function convertTreeToData(rootNodes: any): DataNode[] {
  function dig(node: any): DataNode[] {
    const treeNodes = toArray(node) as NodeElement[];
    return treeNodes
      .map((treeNode) => {
        if (!isTreeNode(treeNode)) {
          warning(
            !treeNode,
            'Tree/TreeNode can only accept TreeNode as children.',
          );
          return null;
        }

        const key = treeNode.key as any as Key;
        const props = (treeNode.props || {}) as any;
        const dataNode: DataNode = {
          key,
          ...props,
        };

        let childrenNodes: any[] = [];
        if (treeNode.children) {
          const children = treeNode.children as any;
          childrenNodes =
            typeof children === 'object' && children.default
              ? children.default()
              : (children as any);
        }

        const parsedChildren = dig(childrenNodes);
        if (parsedChildren.length > 0) {
          (dataNode as any).children = parsedChildren;
        }

        return dataNode;
      })
      .filter((dataNode: DataNode | null): dataNode is DataNode => !!dataNode);
  }

  return dig(rootNodes);
}

export function flattenTreeData<TreeDataType extends BasicDataNode = DataNode>(
  treeNodeList: TreeDataType[],
  expandedKeys: Key[] | true,
  fieldNames: FieldNames,
): FlattenNode<TreeDataType>[] {
  const {
    _title: fieldTitles,
    key: fieldKey,
    children: fieldChildren,
  } = fillFieldNames(fieldNames);

  const expandedKeySet = new Set(expandedKeys === true ? [] : expandedKeys);
  const flattenList: FlattenNode<TreeDataType>[] = [];

  function dig(
    list: TreeDataType[],
    parent: FlattenNode<TreeDataType> | null = null,
  ): FlattenNode<TreeDataType>[] {
    return (list || []).map((treeNode, index) => {
      const pos: string = getPosition(parent ? parent.pos : '0', index);
      const mergedKey = getKey((treeNode as any)[fieldKey], pos);

      let mergedTitle: any;
      for (const fieldTitle of fieldTitles) {
        if ((treeNode as any)[fieldTitle] !== undefined) {
          mergedTitle = (treeNode as any)[fieldTitle];
          break;
        }
      }

      const flattenNode: FlattenNode<TreeDataType> = Object.assign(
        omit(treeNode as any, [...fieldTitles, fieldKey, fieldChildren] as any),
        {
          title: mergedTitle,
          key: mergedKey,
          parent,
          pos,
          children: [],
          data: treeNode,
          isStart: [...(parent ? parent.isStart : []), index === 0],
          isEnd: [...(parent ? parent.isEnd : []), index === list.length - 1],
        },
      );
      flattenList.push(flattenNode);

      flattenNode.children =
        expandedKeys === true || expandedKeySet.has(mergedKey)
          ? dig((treeNode as any)[fieldChildren] || [], flattenNode)
          : [];

      return flattenNode;
    });
  }

  dig(treeNodeList || []);
  return flattenList;
}

type ExternalGetKey = GetKey<DataNode> | string;

interface TraverseDataNodesConfig {
  childrenPropName?: string;
  externalGetKey?: ExternalGetKey;
  fieldNames?: FieldNames;
}

export function traverseDataNodes(
  dataNodes: DataNode[],
  callback: (data: {
    index: number;
    key: Key;
    level: number;
    node: DataNode;
    nodes: DataNode[];
    parentPos: null | number | string;
    pos: string;
  }) => void,
  config?: string | TraverseDataNodesConfig,
) {
  // eslint-disable-next-line no-useless-assignment
  let mergedConfig: TraverseDataNodesConfig = {};
  mergedConfig =
    typeof config === 'object' ? config : { externalGetKey: config };
  mergedConfig ||= {};

  const { childrenPropName, externalGetKey, fieldNames } = mergedConfig;
  const { key: fieldKey, children: fieldChildren } = fillFieldNames(fieldNames);
  const mergeChildrenPropName = childrenPropName || fieldChildren;

  let syntheticGetKey: (node: DataNode, pos?: string) => Key;
  if (externalGetKey) {
    syntheticGetKey =
      typeof externalGetKey === 'string'
        ? (node: DataNode) => (node as any)[externalGetKey]
        : (node: DataNode) => (externalGetKey as GetKey<DataNode>)(node);
  } else {
    syntheticGetKey = (node, pos) => getKey((node as any)[fieldKey], pos!);
  }

  function processNode(
    node: DataNode | null,
    index?: number,
    parent?: { level: number; node: DataNode | null; pos: string },
    pathNodes?: DataNode[],
  ) {
    const children = node ? (node as any)[mergeChildrenPropName] : dataNodes;
    const pos = node ? getPosition(parent!.pos, index!) : '0';
    const connectNodes = node ? [...(pathNodes || []), node] : [];
    if (node) {
      const key: Key = syntheticGetKey(node, pos);
      callback({
        node,
        index: index!,
        pos,
        key,
        parentPos: parent!.node ? parent!.pos : null,
        level: parent!.level + 1,
        nodes: connectNodes,
      });
    }

    if (children) {
      children.forEach((subNode: DataNode, subIndex: number) => {
        processNode(
          subNode,
          subIndex,
          {
            node,
            pos,
            level: parent ? parent.level + 1 : -1,
          },
          connectNodes,
        );
      });
    }
  }

  processNode(null);
}

interface Wrapper {
  keyEntities: KeyEntities;
  posEntities: Record<string, DataEntity>;
}

export function convertDataToEntities(
  dataNodes: DataNode[],
  {
    initWrapper,
    processEntity,
    onProcessFinished,
    externalGetKey,
    childrenPropName,
    fieldNames,
  }: {
    childrenPropName?: string;
    externalGetKey?: ExternalGetKey;
    fieldNames?: FieldNames;
    initWrapper?: (wrapper: Wrapper) => Wrapper;
    onProcessFinished?: (wrapper: Wrapper) => void;
    processEntity?: (entity: DataEntity, wrapper: Wrapper) => void;
  } = {},
  /** @deprecated Use `config.externalGetKey` instead */
  legacyExternalGetKey?: ExternalGetKey,
) {
  const mergedExternalGetKey = externalGetKey || legacyExternalGetKey;

  const posEntities: Record<string, DataEntity> = {};
  const keyEntities: KeyEntities = {};
  let wrapper: Wrapper = {
    posEntities,
    keyEntities,
  };

  if (initWrapper) {
    wrapper = initWrapper(wrapper) || wrapper;
  }

  traverseDataNodes(
    dataNodes,
    (item) => {
      const { node, index, pos, key, parentPos, level, nodes } = item;
      const entity: DataEntity = { node, nodes, index, key, pos, level };

      const mergedKey = getKey(key, pos);

      posEntities[pos] = entity;
      keyEntities[String(mergedKey)] = entity;

      entity.parent = posEntities[String(parentPos)];
      if (entity.parent) {
        entity.parent.children ||= [];
        entity.parent.children.push(entity);
      }

      processEntity?.(entity, wrapper);
    },
    { externalGetKey: mergedExternalGetKey, childrenPropName, fieldNames },
  );

  onProcessFinished?.(wrapper);

  return wrapper;
}

export interface TreeNodeRequiredProps<
  TreeDataType extends BasicDataNode = DataNode,
> {
  checkedKeys: Key[];
  dragOverNodeKey: Key | null;
  dropPosition: null | number;
  expandedKeys: Key[];
  halfCheckedKeys: Key[];
  keyEntities: KeyEntities<TreeDataType>;
  loadedKeys: Key[];
  loadingKeys: Key[];
  selectedKeys: Key[];
}

export function getTreeNodeProps<TreeDataType extends BasicDataNode = DataNode>(
  key: Key,
  {
    expandedKeys,
    selectedKeys,
    loadedKeys,
    loadingKeys,
    checkedKeys,
    halfCheckedKeys,
    dragOverNodeKey,
    dropPosition,
    keyEntities,
  }: TreeNodeRequiredProps<TreeDataType>,
) {
  const entity = getEntity(keyEntities, key);

  return {
    eventKey: key,
    expanded: expandedKeys.includes(key),
    selected: selectedKeys.includes(key),
    loaded: loadedKeys.includes(key),
    loading: loadingKeys.includes(key),
    checked: checkedKeys.includes(key),
    halfChecked: halfCheckedKeys.includes(key),
    pos: String(entity ? entity.pos : ''),
    dragOver: dragOverNodeKey === key && dropPosition === 0,
    dragOverGapTop: dragOverNodeKey === key && dropPosition === -1,
    dragOverGapBottom: dragOverNodeKey === key && dropPosition === 1,
  };
}

export function convertNodePropsToEventData<
  TreeDataType extends BasicDataNode = DataNode,
>(props: TreeNodeProps<TreeDataType>): EventDataNode<TreeDataType> {
  const {
    data,
    expanded,
    selected,
    checked,
    loaded,
    loading,
    halfChecked,
    dragOver,
    dragOverGapTop,
    dragOverGapBottom,
    pos,
    active,
    eventKey,
  } = props;

  const eventData: any = {
    ...(data as any),
    expanded,
    selected,
    checked,
    loaded,
    loading,
    halfChecked,
    dragOver,
    dragOverGapTop,
    dragOverGapBottom,
    pos,
    active,
    key: eventKey,
  };

  if (!('props' in eventData)) {
    Object.defineProperty(eventData, 'props', {
      get() {
        warning(
          false,
          'Second param return from event is node data instead of TreeNode instance. Please read value directly instead of reading from `props`.',
        );
        return props;
      },
    });
  }

  return eventData as EventDataNode<TreeDataType>;
}

export function isLeafNode<TreeDataType extends BasicDataNode = DataNode>(
  isLeaf: boolean | undefined,
  loadData: ((node: EventDataNode<TreeDataType>) => Promise<any>) | undefined,
  hasChildren: boolean,
  loaded: boolean | undefined,
): boolean {
  if (isLeaf === false) {
    return false;
  }
  return (
    !!isLeaf ||
    (!loadData && !hasChildren) ||
    !!(loadData && loaded && !hasChildren)
  );
}
