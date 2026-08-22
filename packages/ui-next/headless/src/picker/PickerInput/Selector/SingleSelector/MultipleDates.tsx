import type { VueNode } from '../../../../util';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { Overflow } from '../../../../overflow';

export interface MultipleDatesProps<DateType extends object = any> {
  disabled?: boolean;
  formatDate: (date: DateType) => string;
  maxTagCount?: 'responsive' | number;
  onRemove: (value: DateType) => void;
  placeholder?: VueNode;
  prefixCls: string;
  removeIcon?: VueNode;
  tagRender?: (props: {
    closable: boolean;
    disabled: boolean;
    label: VueNode;
    onClose: (event?: MouseEvent) => void;
    value: DateType;
  }) => VueNode;
  value: DateType[];
}

const MultipleDates = defineComponent<MultipleDatesProps>(
  (props) => {
    return () => {
      const {
        prefixCls,
        value,
        onRemove,
        removeIcon = '×',
        formatDate,
        disabled,
        maxTagCount,
        placeholder,
        tagRender,
      } = props;

      const selectorCls = `${prefixCls}-selector`;
      const selectionCls = `${prefixCls}-selection`;
      const overflowCls = `${selectionCls}-overflow`;

      // ========================= Item =========================
      function renderSelector(
        content: VueNode,
        onClose?: (e: MouseEvent) => void,
      ) {
        return (
          <span
            class={clsx(`${selectionCls}-item`)}
            title={typeof content === 'string' ? content : undefined}
          >
            <span class={`${selectionCls}-item-content`}>{content}</span>
            {!disabled && onClose && (
              <span
                class={`${selectionCls}-item-remove`}
                onClick={onClose}
                onMousedown={(e) => {
                  e.preventDefault();
                }}
              >
                {removeIcon}
              </span>
            )}
          </span>
        );
      }

      function renderItem(date: any) {
        const displayLabel = formatDate(date);

        const onClose = (event?: MouseEvent) => {
          if (event) event.stopPropagation();
          if (!disabled) onRemove(date);
        };

        if (tagRender) {
          return tagRender({
            label: displayLabel,
            value: date,
            disabled: !!disabled,
            onClose,
            closable: !disabled,
          });
        }

        return renderSelector(displayLabel, onClose);
      }

      // ========================= Rest =========================
      function renderRest(omittedValues: any[]) {
        const content = `+ ${omittedValues.length} ...`;

        return renderSelector(content);
      }

      // ======================== Render ========================

      return (
        <div class={selectorCls}>
          <Overflow
            data={value}
            // suffix={inputNode}
            itemKey={(date: any) => formatDate(date)}
            maxCount={maxTagCount}
            prefixCls={overflowCls}
            renderItem={renderItem}
            renderRest={renderRest}
          />
          {value.length === 0 && (
            <span class={`${prefixCls}-selection-placeholder`}>
              {placeholder}
            </span>
          )}
        </div>
      );
    };
  },
  {
    name: 'MultipleDates',
  },
);

export default MultipleDates;
