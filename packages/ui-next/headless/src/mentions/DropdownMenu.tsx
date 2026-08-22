import type { MenuRef } from '../menu';
import type { DataDrivenOptionProps } from './Mentions';

import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  shallowRef,
  watch,
} from 'vue';

import Menu, { Item as MenuItem } from '../menu';
import { getDOM } from '../util';
import { useMentionsContext } from './MentionsContext';

export interface DropdownMenuProps {
  opened: boolean;
  options: DataDrivenOptionProps[];
  prefixCls?: string;
}

/**
 * We only use Menu to display the candidate.
 * The focus is controlled by textarea to make accessibility easy.
 */

const DropdownMenu = defineComponent<DropdownMenuProps>(
  (props) => {
    const mentionsContext = useMentionsContext();
    const menuRef = shallowRef<MenuRef>();

    const activeIndex = computed(() => mentionsContext.value.activeIndex);
    const activeOption = computed(() => props.options[activeIndex.value] || {});
    const activeOptionKey = computed(() => activeOption.value?.key);

    let removeListListeners: undefined | VoidFunction;
    const bindListEvents = (list?: HTMLUListElement | null) => {
      if (removeListListeners) {
        removeListListeners();
        removeListListeners = undefined;
      }
      if (!list) {
        return;
      }
      const handleFocus = (event: FocusEvent) => {
        mentionsContext.value.onFocus?.(event);
      };
      const handleBlur = (event: FocusEvent) => {
        mentionsContext.value.onBlur?.(event);
      };
      const handleScroll = (event: Event) => {
        mentionsContext.value.onScroll?.(event as UIEvent);
      };

      list.addEventListener('focusin', handleFocus);
      list.addEventListener('focusout', handleBlur);
      list.addEventListener('scroll', handleScroll);

      removeListListeners = () => {
        list.removeEventListener('focusin', handleFocus);
        list.removeEventListener('focusout', handleBlur);
        list.removeEventListener('scroll', handleScroll);
      };
    };

    watch(
      () => menuRef.value?.list,
      (list, _, onCleanup) => {
        if (list) {
          list = getDOM(list) as any;
        }
        bindListEvents(list || null);
        onCleanup(() => {
          removeListListeners?.();
          removeListListeners = undefined;
        });
      },
      {
        immediate: true,
        flush: 'post',
      },
    );

    watch([activeIndex, activeOptionKey, () => props.opened], () => {
      if (!props.opened || activeIndex.value === -1) {
        return;
      }
      nextTick(() => {
        const key = activeOptionKey.value;
        if (!key) {
          return;
        }
        const activeItem = menuRef.value?.findItem?.({ key });
        activeItem?.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        });
      });
    });

    onBeforeUnmount(() => {
      removeListListeners?.();
      removeListListeners = undefined;
    });
    return () => {
      const { notFoundContent, setActiveIndex, selectOption } =
        mentionsContext.value;
      const { prefixCls, options } = props;
      const activeKey = activeOptionKey.value;

      return (
        <Menu
          activeKey={activeKey}
          onSelect={({ key }: any) => {
            const option = options.find(
              ({ key: optionKey }) => optionKey === key,
            );
            if (option) {
              selectOption(option);
            }
          }}
          prefixCls={`${prefixCls}-menu`}
          ref={menuRef as any}
        >
          {options.map((option, index) => {
            const { key, disabled, class: className, style, label } = option;
            return (
              <MenuItem
                class={className}
                disabled={disabled}
                key={key}
                style={style}
                {...({
                  onMouseenter: () => {
                    if (!disabled) {
                      setActiveIndex(index);
                    }
                  },
                } as any)}
              >
                {label}
              </MenuItem>
            );
          })}
          {options.length === 0 && (
            <MenuItem disabled key="notFound">
              {notFoundContent}
            </MenuItem>
          )}
        </Menu>
      );
    };
  },
  {
    name: 'DropdownMenu',
    inheritAttrs: false,
  },
);

export default DropdownMenu;
