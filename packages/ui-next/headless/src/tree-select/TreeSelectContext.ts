import type { Ref } from 'vue';

import type { DataEntity, ExpandAction } from '../tree';
import type { DataNode, FieldNames, Key, SelectSource } from './interface';
import type { TreeSelectProps } from './TreeSelect';

import { inject, provide, ref } from 'vue';

export interface TreeSelectContextProps {
  classNames?: TreeSelectProps['classNames'];
  fieldNames: FieldNames;
  /** When `true`, only take leaf node as count, or take all as count with `maxCount` limitation */
  leafCountOnly: boolean;
  // For `maxCount` usage
  leftMaxCount: null | number;
  listHeight: number;
  listItemHeight: number;
  listItemScrollOffset?: number;
  onPopupScroll?: (event: Event) => void;
  onSelect: (
    value: Key,
    info: { selected: boolean; source?: SelectSource },
  ) => void;
  popupMatchSelectWidth?: boolean | number;
  styles?: TreeSelectProps['styles'];

  treeData: DataNode[];
  treeExpandAction?: ExpandAction;
  treeTitleRender?: (node: any) => any;
  valueEntities: Map<Key, DataEntity>;
  virtual?: boolean;
}

const TreeSelectContextKey = Symbol('TreeSelectContext');

export function useTreeSelectProvider(value: Ref<TreeSelectContextProps>) {
  provide(TreeSelectContextKey, value);
}

export function useTreeSelectContext() {
  return inject(
    TreeSelectContextKey,
    ref(null) as any,
  ) as Ref<null | TreeSelectContextProps>;
}
