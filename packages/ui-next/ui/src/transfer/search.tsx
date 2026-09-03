import type { SlotsType } from 'vue';

import type { VueNode } from '../_util';

import { defineComponent } from 'vue';

import { SearchOutlined } from '@arvin-studio/icons';

import Input from '../input/Input';

export interface TransferSearchProps
  /* @vue-ignore */
  extends TransferSearchEmitsProps {
  disabled?: boolean;
  placeholder?: string;
  prefixCls?: string;
  value?: string;
}

export interface TransferSearchEmits {
  change: (e: Event) => void;
  clear: () => void;
}

export interface TransferSearchEmitsProps {
  onChange?: TransferSearchEmits['change'];
  onClear?: TransferSearchEmits['clear'];
}

export interface TransferSearchSlots {
  prefix?: () => VueNode;
}

const Search = defineComponent<
  TransferSearchProps,
  TransferSearchEmits,
  string,
  SlotsType<TransferSearchSlots>
>(
  (props, { emit, slots }) => {
    const handleChange = (e: Event) => {
      emit('change', e);
      const target = e?.target as HTMLInputElement | null;
      if (!target?.value) {
        emit('clear');
      }
    };

    return () => (
      <Input
        allowClear
        class={props.prefixCls}
        disabled={props.disabled}
        onChange={handleChange}
        placeholder={props.placeholder || ''}
        prefix={slots?.prefix?.() ?? <SearchOutlined />}
        value={props.value}
      />
    );
  },
  {
    name: 'ATransferSearch',
    inheritAttrs: false,
  },
);

export default Search;
