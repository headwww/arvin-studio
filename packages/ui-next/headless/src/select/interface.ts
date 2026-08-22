import type { Key, VueNode } from '../util';

export type RawValueType = number | string;

export interface FlattenOptionData<OptionType = any> {
  data: OptionType;
  group?: boolean;
  groupOption?: boolean;
  key: Key;
  label?: VueNode;
  value?: RawValueType;
}

export interface DisplayValueType {
  disabled?: boolean;
  index?: number;
  key?: Key;
  label?: VueNode;
  title?: VueNode;
  value?: RawValueType;
}
export type RenderNode = ((props: any) => VueNode) | VueNode;

export type RenderDOMFunc = (props: any) => HTMLElement;

export type Mode = 'combobox' | 'multiple' | 'tags';

export type Placement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

export type DisplayInfoType = 'add' | 'clear' | 'remove';
