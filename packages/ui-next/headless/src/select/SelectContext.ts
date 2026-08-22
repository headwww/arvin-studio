import type { CSSProperties, Ref } from 'vue';

import type { FlattenOptionData, RawValueType, RenderNode } from './interface';
import type {
  BaseOptionType,
  FieldNames,
  OnActiveValue,
  OnInternalSelect,
  PopupSemantic,
  SelectProps,
  SemanticName,
} from './Select';

import { inject, provide, ref } from 'vue';

/**
 * SelectContext is only used for Select. BaseSelect should not consume this context.
 */
export interface SelectContextProps {
  childrenAsData?: boolean;
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>;
  };
  defaultActiveFirstOption?: boolean;
  direction?: 'ltr' | 'rtl';
  fieldNames?: FieldNames;
  flattenOptions: FlattenOptionData[];
  listHeight?: number;
  listItemHeight?: number;
  maxCount?: number;
  menuItemSelectedIcon?: RenderNode;
  onActiveValue: OnActiveValue;
  onSelect: OnInternalSelect;
  optionRender?: SelectProps['optionRender'];
  options: BaseOptionType[];
  rawValues: Set<RawValueType>;
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>;
  };
  virtual?: boolean;
}

const SelectContextKey = Symbol('SelectContext');

function useSelectProvider(value: Ref<SelectContextProps>) {
  provide(SelectContextKey, value);
}

function useSelectContext() {
  return inject(SelectContextKey, ref(null)) as Ref<null | SelectContextProps>;
}

export { useSelectContext, useSelectProvider };
