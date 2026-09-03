/**
 * OperationNode（TSX 版，对应 TabNavList/OperationNode.vue）
 *
 * 溢出标签的"更多"操作节点：
 * - 隐藏的标签（hiddenTabs）收纳进 Dropdown 菜单（@v-c/dropdown）；
 * - 支持键盘操作（上/下选择、Esc 关闭、Enter/Space 确认）；
 * - more.popupRender 可自定义菜单内容（含 restTabs 与 onClose 句柄）；
 * - 移动端（mobile）不渲染 Dropdown，直接渲染 AddButton。
 */
import type { CSSProperties, VNodeChild } from 'vue';

import type { MoreProps, OperationNodeProps } from '../interface';

import { computed, defineComponent, h, shallowRef, toRefs, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { Dropdown } from '../../dropdown';
import { ExportMenu } from '../../menu';
import { KeyCode } from '../../util';
import { RenderComponent } from '../../util/RenderComponent';
import { getRemovable } from '../utils';
import AddButton from './AddButton';

const MenuItem = ExportMenu.Item;

const OperationNode = defineComponent<OperationNodeProps>(
  (props, { expose }) => {
    // withDefaults(more, () => ({})) 的等价实现
    const moreProps = computed<MoreProps>(
      () => props.more ?? ({} as MoreProps),
    );

    const {
      tabBarGutter,
      getPopupContainer,
      popupStyle,
      popupClassName,
      rtl,
      removeAriaLabel,
      onTabClick,
      locale,
      mobile,
      id,
      prefixCls,
      editable,
      style,
      className,
    } = toRefs(props) as any;

    const open = shallowRef(false);
    const selectedKey = shallowRef<null | string>(null);
    const operationNodeRef = shallowRef<HTMLDivElement>();

    const popupId = computed(() => `${id.value}-more-popup`);
    const dropdownPrefix = computed(() => `${prefixCls.value}-dropdown`);
    const selectedItemId = computed(() =>
      selectedKey.value === null
        ? null
        : `${popupId.value}-${selectedKey.value}`,
    );
    const dropdownAriaLabel = computed(() => locale.value?.dropdownAriaLabel);

    function onRemoveTab(event: KeyboardEvent | MouseEvent, key: string) {
      event.preventDefault();
      event.stopPropagation();

      editable.value && editable.value.onEdit('remove', { key, event });
    }

    const menuNode = computed(() => {
      return h(
        ExportMenu,
        {
          prefixCls: `${dropdownPrefix.value}-menu`,
          id: popupId.value,
          tabIndex: -1,
          role: 'listbox',
          'aria-activedescendant': selectedItemId.value,
          selectedKeys: selectedKey.value ? [selectedKey.value] : undefined,
          'aria-label':
            dropdownAriaLabel.value === undefined
              ? 'expanded dropdown'
              : dropdownAriaLabel.value,
          onClick: ({
            key,
            domEvent,
          }: {
            domEvent: KeyboardEvent | MouseEvent;
            key: string;
          }) => {
            onTabClick.value?.(key, domEvent);
            open.value = false;
          },
        },
        {
          default: () =>
            props.tabs.map((tab) => {
              const { closable, closeIcon, disabled, key, label } = tab;
              const removable = getRemovable(
                closable,
                closeIcon,
                editable.value,
                disabled,
              );
              return h(
                MenuItem,
                {
                  key,
                  id: `${popupId.value}-${key}`,
                  role: 'option',
                  'aria-controls': id.value && `${id.value}-panel-${key}`,
                  disabled,
                },
                {
                  default: () => [
                    h('span', {}, [label as VNodeChild]),
                    removable
                      ? h(
                          'button',
                          {
                            type: 'button',
                            'aria-label': removeAriaLabel.value || 'remove',
                            tabindex: 0,
                            class: clsx(
                              `${dropdownPrefix.value}-menu-item-remove`,
                              props.classNames?.remove,
                            ),
                            style: props.styles?.remove,
                            onClick: (e: KeyboardEvent | MouseEvent) => {
                              e.stopPropagation();
                              onRemoveTab(e, key);
                            },
                          },
                          [
                            (closeIcon ||
                              editable.value?.removeIcon ||
                              '×') as VNodeChild,
                          ],
                        )
                      : null,
                  ],
                },
              );
            }),
        },
      );
    });

    const overlayClassName = computed(() => {
      return clsx({
        [popupClassName.value!]: popupClassName.value,
        [`${dropdownPrefix.value}-rtl`]: rtl.value,
      });
    });

    const moreIconNode = computed(() => moreProps.value?.icon || 'More');

    // `popupRender` lets consumers wrap or replace the generated menu (e.g. to add a
    // header or footer) while still receiving the overflowed tabs and a close handle.
    const overlayNode = computed(() => {
      const popupRender = moreProps.value?.popupRender;
      if (!popupRender) {
        return menuNode.value;
      }
      return popupRender(menuNode.value, {
        restTabs: props.tabs,
        onClose: () => {
          open.value = false;
        },
      });
    });

    const moreStyle = computed(() => {
      const style: CSSProperties = {
        marginInlineStart: tabBarGutter.value
          ? `${tabBarGutter.value}px`
          : '0px',
      };
      if (props.tabs.length === 0) {
        style.visibility = 'hidden';
        style.order = 1;
      }

      return style;
    });

    function selectOffset(offset: -1 | 1) {
      const enabledTabs = props.tabs.filter((tab) => !tab.disabled);
      let selectedIndex =
        enabledTabs.findIndex((tab) => tab.key === selectedKey.value) || 0;
      const len = enabledTabs.length;

      for (let i = 0; i < len; i += 1) {
        selectedIndex = (selectedIndex + offset + len) % len;
        const tab = enabledTabs[selectedIndex] as any;
        if (!tab.disabled) {
          selectedKey.value = tab.key;
          return;
        }
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      // eslint-disable-next-line unicorn/prefer-keyboard-event-key
      const { which } = e;

      if (!open.value) {
        if ([KeyCode.DOWN, KeyCode.ENTER, KeyCode.SPACE].includes(which)) {
          open.value = true;
          e.preventDefault();
        }
        return;
      }

      switch (which) {
        case KeyCode.DOWN: {
          selectOffset(1);
          e.preventDefault();
          break;
        }
        case KeyCode.ENTER:
        case KeyCode.SPACE: {
          if (selectedKey.value !== null) {
            onTabClick.value?.(selectedKey.value, e);
          }
          break;
        }
        case KeyCode.ESC: {
          open.value = false;

          break;
        }
        case KeyCode.UP: {
          selectOffset(-1);
          e.preventDefault();
          break;
        }
      }
    }

    watch(
      () => open.value,
      (visible) => {
        if (!visible) {
          selectedKey.value = null;
        }
      },
    );

    watch([() => selectedItemId.value, () => selectedKey.value], () => {
      if (!selectedItemId.value) {
        return;
      }

      // eslint-disable-next-line unicorn/prefer-query-selector
      const ele = document.getElementById(selectedItemId.value);
      if (ele?.scrollIntoView) {
        ele.scrollIntoView(false);
      }
    });

    expose({
      operationNodeRef,
    });

    return () => (
      <div
        class={[`${prefixCls.value}-nav-operations`, className.value]}
        ref={operationNodeRef}
        style={style.value}
      >
        {!mobile.value && (
          <Dropdown
            getPopupContainer={getPopupContainer.value}
            mouseEnterDelay={0.1}
            mouseLeaveDelay={0.1}
            overlay={overlayNode.value}
            overlayClassName={overlayClassName.value}
            overlayStyle={popupStyle.value}
            prefixCls={dropdownPrefix.value}
            visible={props.tabs.length > 0 ? open.value : false}
            {...moreProps.value}
            onVisibleChange={(v: boolean) => {
              open.value = v;
            }}
          >
            <button
              aria-controls={popupId.value}
              aria-expanded={open.value}
              aria-haspopup="listbox"
              class={`${prefixCls.value}-nav-more`}
              id={`${id.value}-more`}
              onKeydown={onKeyDown}
              style={moreStyle.value}
              type="button"
            >
              <RenderComponent render={moreIconNode.value} />
            </button>
          </Dropdown>
        )}
        <AddButton
          editable={editable.value}
          locale={locale.value}
          prefixCls={prefixCls.value}
        />
      </div>
    );
  },
  {
    name: 'OperationNode',
    inheritAttrs: false,
  },
);

export default OperationNode;
