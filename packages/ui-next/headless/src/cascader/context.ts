import type { Ref } from 'vue';

import type {
  CascaderProps,
  DefaultOptionType,
  InternalFieldNames,
  SingleValueType,
} from './Cascader';

import { inject, provide, ref } from 'vue';

export interface CascaderContextProps {
  changeOnSelect?: boolean;
  checkable?: any | boolean;
  classNames?: CascaderProps['classNames'];
  expandIcon?: any;
  expandTrigger?: 'click' | 'hover';
  fieldNames: InternalFieldNames;
  halfValues: SingleValueType[];
  loadData?: (selectOptions: DefaultOptionType[]) => void;
  loadingIcon?: any;
  onSelect: (valuePath: SingleValueType) => void;
  optionRender?: CascaderProps['optionRender'];
  options: NonNullable<CascaderProps['options']>;
  popupMenuColumnStyle?: CascaderProps['popupMenuColumnStyle'];
  popupPrefixCls?: string;
  searchOptions: DefaultOptionType[];
  styles?: CascaderProps['styles'];
  values: SingleValueType[];
}

const CascaderContextKey = Symbol('CascaderContext');

export function useCascaderProvider(value: Ref<CascaderContextProps>) {
  provide(CascaderContextKey, value);
}

export function useCascaderContext() {
  return inject(
    CascaderContextKey,
    ref(null) as any,
  ) as Ref<CascaderContextProps | null>;
}
