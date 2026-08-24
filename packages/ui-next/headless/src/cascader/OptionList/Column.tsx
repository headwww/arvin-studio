import type { CSSProperties } from 'vue';

import type {
  DefaultOptionType,
  LegacyKey,
  SingleValueType,
} from '../Cascader';

import { computed, defineComponent, ref, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { pickAttrs } from '../../util';
import { useCascaderContext } from '../context';
import { SEARCH_MARK } from '../hooks/useSearchOptions';
import { isLeaf, scrollIntoParentView, toPathKey } from '../utils/commonUtil';
import Checkbox from './Checkbox';

export const FIX_LABEL = '__cascader_fix_label__';

export interface ColumnProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
> {
  /** Current Column opened item key */
  activeValue?: LegacyKey;
  checkedSet: Set<LegacyKey>;
  disabled?: boolean;
  halfCheckedSet: Set<LegacyKey>;
  isSelectable: (option: DefaultOptionType) => boolean;
  loadingKeys: LegacyKey[];
  multiple?: boolean;
  onActive: (valuePath: SingleValueType) => void;
  onSelect: (valuePath: SingleValueType, leaf: boolean) => void;
  onToggleOpen: (open: boolean) => void;
  options: OptionType[];
  prefixCls: string;
  /** The value path before current column */
  prevValuePath: LegacyKey[];
  style?: CSSProperties;
}

const columnDefaults: ColumnProps = {
  prefixCls: '',
  options: [],
  prevValuePath: [],
  onToggleOpen: () => {},
  onSelect: () => {},
  onActive: () => {},
  checkedSet: new Set(),
  halfCheckedSet: new Set(),
  loadingKeys: [],
  isSelectable: () => false,
};

const Column = defineComponent<ColumnProps>(
  (props = columnDefaults) => {
    const menuRef = ref<HTMLUListElement | null>(null);
    const context = useCascaderContext();

    const menuPrefixCls = computed(() => `${props.prefixCls}-menu`);
    const menuItemPrefixCls = computed(() => `${props.prefixCls}-menu-item`);

    const hoverOpen = computed(() => context.value?.expandTrigger === 'hover');

    const isOptionDisabled = (disabled?: boolean) => props.disabled || disabled;

    // ============================ Option ============================
    const optionInfoList = computed(() => {
      const fieldNames = context.value?.fieldNames;
      if (!fieldNames) {
        return [];
      }

      return props.options.map((option) => {
        const { disabled, disableCheckbox } = option;
        const searchOptions: Record<string, any>[] = option[SEARCH_MARK];
        const label = option[FIX_LABEL] ?? option[fieldNames.label];
        const value = option[fieldNames.value];

        const isMergedLeaf = isLeaf(option, fieldNames);

        // Get real value of option. Search option is different way.
        const fullPath = searchOptions
          ? searchOptions.map((opt) => opt[fieldNames.value])
          : [...props.prevValuePath, value];
        const fullPathKey = toPathKey(fullPath);

        const isLoading = props.loadingKeys.includes(fullPathKey);

        // >>>>> checked
        const checked = props.checkedSet.has(fullPathKey);

        // >>>>> halfChecked
        const halfChecked = props.halfCheckedSet.has(fullPathKey);

        return {
          disabled,
          label,
          value,
          isLeaf: isMergedLeaf,
          isLoading,
          checked,
          halfChecked,
          option,
          disableCheckbox,
          fullPath,
          fullPathKey,
        };
      });
    });

    watch(
      () => props.activeValue,
      async () => {
        if (!menuRef.value) {
          return;
        }

        const selector = `.${menuItemPrefixCls.value}-active`;
        const activeElement =
          menuRef.value.querySelector<HTMLElement>(selector);

        if (activeElement) {
          scrollIntoParentView(activeElement);
        }
      },
      { immediate: true, flush: 'post' },
    );

    // ============================ Render ============================
    return () => {
      const fieldNames = context.value?.fieldNames;
      const changeOnSelect = context.value?.changeOnSelect;
      const expandIcon = context.value?.expandIcon;
      const loadingIcon = context.value?.loadingIcon;
      const popupMenuColumnStyle = context.value?.popupMenuColumnStyle;
      const optionRender = context.value?.optionRender;
      const classNames = context.value?.classNames;
      const styles = context.value?.styles;

      if (!fieldNames) {
        return null;
      }

      return (
        <ul
          class={clsx(menuPrefixCls.value, classNames?.popup?.list)}
          ref={menuRef}
          role="menu"
          style={styles?.popup?.list}
        >
          {optionInfoList.value.map(
            ({
              disabled,
              label,
              value,
              isLeaf: isMergedLeaf,
              isLoading,
              checked,
              halfChecked,
              option,
              fullPath,
              fullPathKey,
              disableCheckbox,
            }) => {
              const ariaProps = pickAttrs(option, { aria: true, data: true });
              // >>>>> Open
              const triggerOpenPath = () => {
                if (isOptionDisabled(disabled)) {
                  return;
                }
                const nextValueCells = [...fullPath];
                if (hoverOpen.value && isMergedLeaf) {
                  nextValueCells.pop();
                }
                props.onActive(nextValueCells);
              };

              // >>>>> Selection
              const triggerSelect = () => {
                if (props.isSelectable(option) && !isOptionDisabled(disabled)) {
                  props.onSelect(fullPath, isMergedLeaf);
                }
              };

              // >>>>> Title
              let title: string | undefined;
              if (typeof option.title === 'string') {
                title = option.title;
              } else if (typeof label === 'string') {
                title = label;
              }

              return (
                <li
                  key={fullPathKey}
                  {...ariaProps}
                  aria-checked={checked}
                  class={clsx(
                    menuItemPrefixCls.value,
                    classNames?.popup?.listItem,
                    {
                      [`${menuItemPrefixCls.value}-expand`]: !isMergedLeaf,
                      [`${menuItemPrefixCls.value}-active`]:
                        props.activeValue === value ||
                        props.activeValue === fullPathKey,
                      [`${menuItemPrefixCls.value}-disabled`]:
                        isOptionDisabled(disabled),
                      [`${menuItemPrefixCls.value}-loading`]: isLoading,
                    },
                  )}
                  data-path-key={fullPathKey}
                  onClick={() => {
                    triggerOpenPath();
                    if (disableCheckbox) {
                      return;
                    }
                    if (!props.multiple || isMergedLeaf) {
                      triggerSelect();
                    }
                  }}
                  onDblclick={() => {
                    if (changeOnSelect) {
                      props.onToggleOpen(false);
                    }
                  }}
                  onMousedown={(e) => {
                    // Prevent selector from blurring
                    e.preventDefault();
                  }}
                  onMouseenter={() => {
                    if (hoverOpen.value) {
                      triggerOpenPath();
                    }
                  }}
                  role="menuitemcheckbox"
                  style={{
                    ...popupMenuColumnStyle,
                    ...styles?.popup?.listItem,
                  }}
                  title={title}
                >
                  {props.multiple && (
                    <Checkbox
                      checked={checked}
                      disableCheckbox={disableCheckbox}
                      disabled={isOptionDisabled(disabled) || disableCheckbox}
                      halfChecked={halfChecked}
                      onClick={(e: MouseEvent) => {
                        if (disableCheckbox) {
                          return;
                        }
                        e.stopPropagation();
                        triggerSelect();
                      }}
                      prefixCls={`${props.prefixCls}-checkbox`}
                    />
                  )}
                  <div class={`${menuItemPrefixCls.value}-content`}>
                    {optionRender && value !== '__EMPTY__'
                      ? optionRender(option)
                      : label}
                  </div>
                  {!isLoading && expandIcon && !isMergedLeaf && (
                    <div class={`${menuItemPrefixCls.value}-expand-icon`}>
                      {expandIcon}
                    </div>
                  )}
                  {isLoading && loadingIcon && (
                    <div class={`${menuItemPrefixCls.value}-loading-icon`}>
                      {loadingIcon}
                    </div>
                  )}
                </li>
              );
            },
          )}
        </ul>
      );
    };
  },
  {
    name: 'Column',
    inheritAttrs: false,
  },
);

export default Column;
