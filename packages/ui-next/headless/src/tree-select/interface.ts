import type { Key, DataNode as TreeDataNode } from '../tree';

export type { Key };

export type SafeKey = Key;

export interface DataNode
  extends Omit<TreeDataNode, 'children' | 'key'>, Record<string, any> {
  children?: DataNode[];
  key?: Key;
  value?: Key;
}

export type SelectSource = 'clear' | 'input' | 'option' | 'selection';

export interface LabeledValueType {
  /** Only works on `treeCheckStrictly` */
  halfChecked?: boolean;
  key?: Key;
  label?: any;
  value?: Key;
}

export type DefaultValueType =
  | (Key | LabeledValueType)[]
  | Key
  | LabeledValueType;

export interface LegacyDataNode extends DataNode {
  props: any;
}

export interface FlattenDataNode {
  data: DataNode;
  key: Key;
  level: number;
  parent?: FlattenDataNode;
  value: Key;
}

export interface SimpleModeConfig {
  id?: string;
  pId?: string;
  rootPId?: null | SafeKey;
}

/** @deprecated This is only used for legacy compatible. Not works on new code. */
export interface LegacyCheckedNode {
  children?: LegacyCheckedNode[];
  node: any;
  pos: string;
}

export interface ChangeEventExtra {
  /** @deprecated This prop not work as react node anymore. */
  allCheckedNodes: LegacyCheckedNode[];
  /** @deprecated Use `onSelect` or `onDeselect` instead. */
  checked?: boolean;
  /** @deprecated Please save prev value by control logic instead */
  preValue: LabeledValueType[];
  /** @deprecated Use `onSelect` or `onDeselect` instead. */
  selected?: boolean;

  // Not sure if exist user still use this. We have to keep but not recommend user to use
  /** @deprecated This prop not work as react node anymore. */
  triggerNode: any;
  triggerValue: Key;
}

export interface FieldNames {
  _title?: string[];
  children?: string;
  label?: string;
  value?: string;
}
