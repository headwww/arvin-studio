import type { VueNode } from '../_util';
import type {
  KeyWiseTransferItem,
  TransferSemanticClassNames,
  TransferSemanticStyles,
} from './interface';

import { defineComponent } from 'vue';

import { DeleteOutlined } from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import Checkbox from '../checkbox';
import defaultLocale from '../locale/en_US';
import useLocale from '../locale/useLocale';

interface ListItemProps<RecordType> {
  checked?: boolean;
  classes: TransferSemanticClassNames;
  disabled?: boolean;
  item: RecordType;
  onClick: (item: RecordType, e: MouseEvent) => void;
  onRemove?: (item: RecordType) => void;
  prefixCls: string;
  renderedEl: VueNode;
  renderedText?: number | string;
  showRemove?: boolean;
  styles: TransferSemanticStyles;
}

const ListItem = defineComponent<ListItemProps<KeyWiseTransferItem>>(
  (props) => {
    const [contextLocale] = useLocale('Transfer', defaultLocale.Transfer);
    return () => {
      const {
        prefixCls,
        classes: classNames,
        styles,
        renderedText,
        renderedEl,
        item,
        checked,
        disabled,
        onClick,
        onRemove,
        showRemove,
      } = props;
      const mergedDisabled = disabled || item?.disabled;
      const classes = clsx(`${prefixCls}-content-item`, classNames.item, {
        [`${prefixCls}-content-item-disabled`]: mergedDisabled,
        [`${prefixCls}-content-item-checked`]: checked && !mergedDisabled,
      });

      let title: string | undefined;
      if (
        typeof renderedText === 'string' ||
        typeof renderedText === 'number'
      ) {
        title = String(renderedText);
      }

      const labelNode = (
        <span
          class={clsx(`${prefixCls}-content-item-text`, classNames.itemContent)}
          style={styles.itemContent}
        >
          {renderedEl}
        </span>
      );

      if (showRemove) {
        return (
          <li class={classes} style={styles.item} title={title}>
            {labelNode}
            <button
              aria-label={contextLocale?.value?.remove}
              class={`${prefixCls}-content-item-remove`}
              disabled={mergedDisabled}
              onClick={() => onRemove?.(item)}
              type="button"
            >
              <DeleteOutlined />
            </button>
          </li>
        );
      }

      return (
        <li
          class={classes}
          onClick={
            mergedDisabled
              ? undefined
              : (event: MouseEvent) => onClick(item, event)
          }
          style={styles.item}
          title={title}
        >
          <Checkbox
            checked={checked}
            class={clsx(`${prefixCls}-checkbox`, classNames.itemIcon)}
            disabled={mergedDisabled}
            style={styles.itemIcon}
          />
          {labelNode}
        </li>
      );
    };
  },
  {
    name: 'ATransferListItem',
    inheritAttrs: false,
  },
);

export default ListItem;
