import type { CSSProperties } from 'vue';

import type { VueNode } from '../../util';
import type { MenuInfo, SubMenuType } from '../interface';

import { computed, defineComponent, ref, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { Overflow } from '../../overflow';
import { warning } from '../../util';
import { useMenuId } from '../context/IdContext';
import MenuContextProvider, { useMenuContext } from '../context/MenuContext';
import {
  PathTrackerContext,
  useFullPath,
  useMeasure,
  usePathUserContext,
} from '../context/PathContext';
import { usePrivateContext } from '../context/PrivateContext';
import useActive from '../hooks/useActive';
import useDirectionStyle from '../hooks/useDirectionStyle';
import useMemoCallback from '../hooks/useMemoCallback';
import Icon from '../Icon';
import { parseChildren } from '../utils/commonUtil';
import { warnItemProp } from '../utils/warnUtil';
import InlineSubMenuList from './InlineSubMenuList';
import PopupTrigger from './PopupTrigger';
import SubMenuList from './SubMenuList';

export type SemanticName = 'list' | 'listTitle';
export interface SubMenuProps extends Omit<
  SubMenuType,
  'children' | 'key' | 'label' | 'title'
> {
  classes?: Partial<Record<SemanticName, string>>;
  /** @private Internal filled key. Do not set it directly */
  eventKey?: string;
  /** @private Used for rest popup. Do not use in your prod */
  internalPopupClose?: boolean;
  /** Native `title` attribute for the submenu title element. */
  itemTitle?: string;

  styles?: Partial<Record<SemanticName, CSSProperties>>;

  title?: VueNode;

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean;
}

const InternalSubMenu = defineComponent<SubMenuProps>(
  (props, { slots, attrs }) => {
    const eventKeyRef = computed(() => props?.eventKey || '');
    const domDataId = useMenuId(eventKeyRef);

    const menuContext = useMenuContext();
    const { _internalRenderSubMenuItem } = usePrivateContext();
    const pathUserContext = usePathUserContext();
    const connectedPath = useFullPath();

    // Filter out undefined values from path
    const validConnectedPath = computed(() =>
      connectedPath.value.filter((k): k is string => k !== undefined),
    );

    // ================================ Context Values ================================
    const prefixCls = computed(
      () => menuContext?.value?.prefixCls || 'headless-menu',
    );
    const mode = computed(() => menuContext?.value?.mode || 'vertical');
    const openKeys = computed(() => menuContext?.value?.openKeys || []);
    const contextDisabled = computed(() => menuContext?.value?.disabled);
    const overflowDisabled = computed(
      () => menuContext?.value?.overflowDisabled,
    );
    const activeKey = computed(() => menuContext?.value?.activeKey);
    const selectedKeys = computed(() => menuContext?.value?.selectedKeys || []);
    const contextExpandIcon = computed(() => menuContext?.value?.expandIcon);
    const contextPopupRender = computed(() => menuContext?.value?.popupRender);

    const onOpenChange = (key: string, open: boolean) => {
      menuContext?.value?.onOpenChange?.(key, open);
    };
    const onActive = (key: string) => {
      menuContext?.value?.onActive?.(key);
    };

    const subMenuPrefixCls = computed(() => `${prefixCls.value}-submenu`);
    const mergedDisabled = computed(
      () => !!(contextDisabled.value || props?.disabled),
    );

    // ================================ Warn ================================
    // @ts-expect-error this is a global variable which injected by babel plugin
    // eslint-disable-next-line n/prefer-global/process
    if (process.env.NODE_ENV !== 'production' && props?.warnKey) {
      warning(false, 'SubMenu should not leave undefined `key`.');
    }

    // ================================ Icon ================================
    const mergedItemIcon = computed(
      () => props?.itemIcon ?? menuContext?.value?.itemIcon,
    );
    const mergedExpandIcon = computed(
      () => props?.expandIcon ?? contextExpandIcon.value,
    );

    // ================================ Open ================================
    const originOpen = computed(() => {
      const key = props?.eventKey;
      return key ? openKeys.value.includes(key) : false;
    });
    const open = computed(() => !overflowDisabled.value && originOpen.value);

    // =============================== Select ===============================
    const childrenSelected = computed(() => {
      const key = props?.eventKey;
      return key
        ? pathUserContext.isSubPathKey(selectedKeys.value, key)
        : false;
    });

    // =============================== Active ===============================
    const eventKeyForActive = computed(() => props?.eventKey || '');
    const { active, ...activeProps } = useActive(
      eventKeyForActive,
      mergedDisabled,
      (e: any) => props?.onTitleMouseEnter?.(e),
      (e: any) => props?.onTitleMouseLeave?.(e),
    );

    const childrenActive = ref(false);

    const triggerChildrenActive = (newActive: boolean) => {
      if (!mergedDisabled.value) {
        childrenActive.value = newActive;
      }
    };

    const onInternalMouseEnter = (domEvent: MouseEvent) => {
      triggerChildrenActive(true);
      props?.onMouseEnter?.({
        key: props.eventKey!,
        domEvent,
      });
    };

    const onInternalMouseLeave = (domEvent: MouseEvent) => {
      triggerChildrenActive(false);
      props?.onMouseLeave?.({
        key: props.eventKey!,
        domEvent,
      });
    };

    const mergedActive = computed(() => {
      if (active.value) {
        return active.value;
      }
      if (mode.value !== 'inline') {
        const key = props?.eventKey;
        const currentActiveKey = activeKey.value;
        return (
          childrenActive.value ||
          (key && currentActiveKey
            ? pathUserContext.isSubPathKey([currentActiveKey], key)
            : false)
        );
      }
      return false;
    });

    // ========================== DirectionStyle ==========================
    const pathLength = computed(() => connectedPath.value.length);
    const directionStyle = useDirectionStyle(pathLength);

    // =============================== Events ===============================
    const onInternalTitleClick = (e: MouseEvent) => {
      if (mergedDisabled.value) {
        return;
      }
      const key = props?.eventKey;
      props?.onTitleClick?.({
        key: key!,
        domEvent: e,
      });
      if (mode.value === 'inline' && key) {
        onOpenChange(key, !originOpen.value);
      }
    };

    // >>>> Context for children click
    const onMergedItemClick = useMemoCallback((info: MenuInfo) => {
      props?.onClick?.(warnItemProp(info));
      menuContext?.value?.onItemClick?.(info);
    });

    const onPopupVisibleChange = (newVisible: boolean) => {
      const key = props?.eventKey;
      if (mode.value !== 'inline' && key) {
        onOpenChange(key, newVisible);
      }
    };

    const onInternalFocus = () => {
      const key = props?.eventKey;
      if (key) {
        onActive(key);
      }
    };

    // Cache mode
    const triggerModeRef = ref(mode.value);
    watch(
      mode,
      () => {
        triggerModeRef.value =
          mode.value !== 'inline' && validConnectedPath.value.length > 1
            ? 'vertical'
            : mode.value;
      },
      { immediate: true },
    );
    return () => {
      // Mirror rc-menu's destructure: keep internally handled props (the
      // handlers are re-dispatched with info objects) and private props out of
      // the DOM spread, otherwise Vue `mergeProps` stacks same-name listeners
      // and user callbacks fire twice.
      const {
        style,
        title,
        itemTitle,
        class: className,
        popupClassName,
        popupOffset,
        popupStyle,
        classes,
        styles,
        ...restProps
      } = props;

      const children = slots.default?.();
      const popupId = domDataId.value && `${domDataId.value}-popup`;
      // >>>>> Expand Icon
      const expandIconProps = {
        isOpen: open.value,
        isSelected: childrenSelected.value,
        isSubMenu: true,
        disabled: mergedDisabled.value,
      };

      const expandIconNode = (
        <Icon
          icon={
            mode.value === 'horizontal' ? undefined : mergedExpandIcon.value
          }
          props={{
            ...props,
            ...expandIconProps,
          }}
        >
          <i class={`${subMenuPrefixCls.value}-arrow`} />
        </Icon>
      );

      // >>>>> Title
      let titleNode = (
        <div
          aria-controls={popupId}
          aria-disabled={mergedDisabled.value}
          aria-expanded={open.value}
          aria-haspopup
          class={`${subMenuPrefixCls.value}-title`}
          data-menu-id={
            overflowDisabled.value && domDataId.value
              ? undefined
              : domDataId.value
          }
          onClick={onInternalTitleClick}
          onFocus={onInternalFocus}
          role="menuitem"
          style={directionStyle.value}
          tabindex={mergedDisabled.value ? undefined : -1}
          title={itemTitle ?? (typeof title === 'string' ? title : undefined)}
          {...activeProps}
        >
          {title}
          {expandIconNode}
        </div>
      );

      const popupContentTriggerMode = triggerModeRef.value;
      // >>>>> Popup Content
      const renderPopupContent = () => {
        const originNode = (
          <MenuContextProvider
            classes={classes}
            mode={
              popupContentTriggerMode === 'horizontal'
                ? 'vertical'
                : popupContentTriggerMode
            }
            styles={styles}
          >
            <SubMenuList id={popupId}>{children}</SubMenuList>
          </MenuContextProvider>
        );

        const mergedPopupRender =
          props?.popupRender || contextPopupRender.value;
        if (mergedPopupRender) {
          return mergedPopupRender(originNode, {
            item: props,
            keys: validConnectedPath.value,
          });
        }
        return originNode;
      };

      if (!overflowDisabled.value) {
        const triggerMode = triggerModeRef.value;
        titleNode = (
          <PopupTrigger
            disabled={mergedDisabled.value}
            mode={triggerMode}
            onVisibleChange={onPopupVisibleChange}
            popup={renderPopupContent()}
            popupClassName={popupClassName}
            popupOffset={popupOffset}
            popupStyle={popupStyle}
            prefixCls={subMenuPrefixCls.value}
            visible={
              !props?.internalPopupClose &&
              open.value &&
              mode.value !== 'inline'
            }
          >
            {titleNode}
          </PopupTrigger>
        );
      }

      // >>>>> List Node
      let listNode = (
        <Overflow.Item
          role="none"
          {...(attrs as any)}
          {...restProps}
          class={clsx(
            subMenuPrefixCls.value,
            `${subMenuPrefixCls.value}-${mode.value}`,
            className,
            {
              [`${subMenuPrefixCls.value}-open`]: open.value,
              [`${subMenuPrefixCls.value}-active`]: mergedActive.value,
              [`${subMenuPrefixCls.value}-selected`]: childrenSelected.value,
              [`${subMenuPrefixCls.value}-disabled`]: mergedDisabled.value,
            },
          )}
          component="li"
          onMouseenter={onInternalMouseEnter}
          onMouseleave={onInternalMouseLeave}
          style={style}
        >
          {titleNode}

          {!overflowDisabled.value && (
            <InlineSubMenuList
              id={popupId}
              keyPath={validConnectedPath.value}
              open={open.value}
            >
              {children}
            </InlineSubMenuList>
          )}
        </Overflow.Item>
      );

      if (_internalRenderSubMenuItem) {
        listNode = _internalRenderSubMenuItem(listNode, props, {
          selected: childrenSelected.value,
          active: mergedActive.value,
          open: open.value,
          disabled: mergedDisabled.value,
        });
      }

      // >>>>> Render
      return (
        <MenuContextProvider
          classes={classes}
          expandIcon={mergedExpandIcon.value}
          itemIcon={mergedItemIcon.value}
          mode={mode.value === 'horizontal' ? 'vertical' : mode.value}
          onItemClick={onMergedItemClick}
          styles={styles}
        >
          {listNode}
        </MenuContextProvider>
      );
    };
  },
  {
    name: 'InternalSubMenu',
    inheritAttrs: false,
  },
);

const SubMenu = defineComponent<SubMenuProps>(
  (props, { slots }) => {
    const eventKey = computed(() => props?.eventKey);
    const connectedKeyPath = useFullPath(eventKey);

    // ==================== Record KeyPath ====================
    const measure = useMeasure();

    // Filter out undefined values
    const validKeyPath = computed(() =>
      connectedKeyPath.value.filter((k): k is string => k !== undefined),
    );

    watch(
      [connectedKeyPath],
      (_n, _o, onCleanup) => {
        if (measure) {
          measure.registerPath(eventKey.value!, connectedKeyPath.value as any);
        }
        onCleanup(() => {
          measure?.unregisterPath(
            eventKey.value!,
            connectedKeyPath.value as any,
          );
        });
      },
      {
        immediate: true,
      },
    );
    return () => {
      const children = slots.default?.();
      const childList = parseChildren(children, validKeyPath.value);

      let renderNode: VueNode;

      renderNode = measure ? (
        childList
      ) : (
        <InternalSubMenu {...props}>{childList}</InternalSubMenu>
      );

      return (
        <PathTrackerContext.Provider value={connectedKeyPath.value as any}>
          {renderNode}
        </PathTrackerContext.Provider>
      );
    };
  },
  {
    name: 'SubMenu',
    inheritAttrs: false,
  },
);

export default SubMenu;
