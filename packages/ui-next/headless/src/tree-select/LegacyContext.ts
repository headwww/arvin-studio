import type { Ref } from 'vue';

import type { DataEntity, IconType } from '../tree';
import type { Key, SafeKey } from './interface';
import type { TreeSelectProps } from './TreeSelect';

import { inject, provide, ref } from 'vue';

export interface LegacyContextProps {
  checkable: any | boolean;
  checkedKeys: Key[];
  halfCheckedKeys: Key[];
  keyEntities: Record<string, DataEntity<any>>;
  loadData?: TreeSelectProps['loadData'];
  onTreeExpand?: (keys: Key[]) => void;
  onTreeLoad?: TreeSelectProps['onTreeLoad'];
  showTreeIcon?: boolean;
  switcherIcon?: IconType;
  treeDefaultExpandAll?: boolean;
  treeDefaultExpandedKeys: Key[];
  treeExpandedKeys?: Key[];
  treeIcon?: IconType;
  treeLine?: boolean;
  treeLoadedKeys?: SafeKey[];
  treeMotion?: any;

  treeNodeFilterProp: string;
}

const LegacyContextKey = Symbol('LegacyTreeSelectContext');

export function useLegacyProvider(value: Ref<LegacyContextProps>) {
  provide(LegacyContextKey, value);
}

export function useLegacyContext() {
  return inject(
    LegacyContextKey,
    ref(null) as any,
  ) as Ref<LegacyContextProps | null>;
}
