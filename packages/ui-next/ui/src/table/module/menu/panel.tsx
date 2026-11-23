import type {
  AsTableConstructor,
  AsTableDefines,
  AsTableMethods,
  AsTablePrivateMethods,
} from '../../types/table';

import {
  computed,
  createCommentVNode,
  defineComponent,
  inject,
  ref,
  Teleport,
  Transition,
} from 'vue';

import { LoadingOutlined, RightOutlined } from '@arvin-studio/icons';

import { getSlotVNs } from '../../../_util/vn';
import enUS from '../../../locale/en_US';
import useLocale from '../../../locale/useLocale';
import { useToken } from '../../../theme/internal';
import { getFuncText } from '../../util';

export default defineComponent({
  name: 'AsTableMenuPanel',
  setup(_, context) {
    const $asTable = inject(
      '$asTable',
      {} as AsTableConstructor & AsTableMethods & AsTablePrivateMethods,
    );
    const { xID, props, reactData, getComputeMaps, prefixCls } = $asTable;
    const { ctxMenuStore } = reactData;
    const { computeMenuOpts } = getComputeMaps();
    const [locale] = useLocale('Table', enUS.Table);

    const cssVar = useToken()[4];
    const refElem = ref<HTMLDivElement>();

    const refMaps = {
      refElem,
    };

    // 弹层可能会被 Teleport 到 body，脱离表格的 CSS 变量作用域，这里补上作用域类
    const themeCls = computed(() => {
      const cssVarKey = cssVar.value?.key;
      return cssVarKey ? [cssVarKey] : [];
    });

    const $asMenuPanel: any = {
      xID,
      props,
      context,
      getRefMaps: () => refMaps,
    };

    const renderMenuItem = (
      item: AsTableDefines.MenuChildOption | AsTableDefines.MenuFirstOption,
      key: number | string,
      child?: AsTableDefines.MenuChildOption,
    ) => {
      const el = child || item;
      const prefixOpts = el.prefixConfig || {};
      const suffixOpts = el.suffixConfig || {};
      const hasChildMenus =
        !child &&
        !!el.children &&
        el.children.some(
          (childItem: AsTableDefines.MenuChildOption) =>
            childItem.visible !== false,
        );
      const isActive = child
        ? ctxMenuStore.selectChild === child
        : ctxMenuStore.selected === item;
      const { loading, disabled } = el;
      const prefixIcon = prefixOpts.icon || el.prefixIcon;
      const suffixIcon = suffixOpts.icon || el.suffixIcon;

      return (
        <li
          class={[
            `${prefixCls.value}--context-menu--option`,
            el.className,
            {
              'link--loading': !!loading,
              'link--disabled': !!disabled,
              'link--active': isActive,
            },
          ]}
          key={key}
        >
          <div
            class={`${prefixCls.value}-context-menu--link`}
            onClick={(evnt: Event) => $asTable.ctxMenuLinkEvent(evnt, el)}
            onMouseout={(evnt: Event) =>
              $asTable.ctxMenuMouseoutEvent(evnt, item)
            }
            onMouseover={(evnt: Event) =>
              $asTable.ctxMenuMouseoverEvent(evnt, item, child)
            }
          >
            {loading || prefixIcon || prefixOpts.content ? (
              <div
                class={[
                  `${prefixCls.value}-context-menu--link-prefix`,
                  prefixOpts.className || '',
                ]}
              >
                {loading ? (
                  <LoadingOutlined />
                ) : prefixIcon ? (
                  typeof prefixIcon === 'function' ? (
                    getSlotVNs((prefixIcon as any)({}))
                  ) : (
                    <i class={prefixIcon} />
                  )
                ) : null}
                {prefixOpts.content ? <span>{prefixOpts.content}</span> : null}
              </div>
            ) : null}
            <div
              class={`${prefixCls.value}-context-menu--link-content`}
              title={String(getFuncText(el.name))}
            >
              {loading ? locale?.value?.menuLoading : getFuncText(el.name)}
            </div>
            {suffixIcon || suffixOpts.content || hasChildMenus ? (
              <div
                class={[
                  `${prefixCls.value}-context-menu--link-suffix`,
                  suffixOpts.className || '',
                ]}
              >
                {suffixIcon ? (
                  typeof suffixIcon === 'function' ? (
                    getSlotVNs((suffixIcon as any)({}))
                  ) : (
                    <i class={suffixIcon} />
                  )
                ) : hasChildMenus ? (
                  <RightOutlined />
                ) : null}
                {suffixOpts.content ? <span>{suffixOpts.content}</span> : null}
              </div>
            ) : null}
          </div>
          {hasChildMenus && item.children ? (
            <ul
              class={[
                `${prefixCls.value}--context-menu-child-wrapper`,
                {
                  'is--show':
                    ctxMenuStore.selected === item && ctxMenuStore.showChild,
                },
              ]}
            >
              {(item.children as AsTableDefines.MenuChildOption[]).map(
                (
                  childItem: AsTableDefines.MenuChildOption,
                  childIndex: number,
                ) =>
                childItem.visible === false
                  ? createCommentVNode()
                  : renderMenuItem(
                      item,
                      `${key}-${childIndex}`,
                      childItem,
                    ),
              )}
            </ul>
          ) : null}
        </li>
      );
    };

    const renderMenuList = () => {
      return (ctxMenuStore.list || []).map((group, groupIndex) => {
        if (
          !group ||
          group.every((item: AsTableDefines.MenuFirstOption) => {
            return item.visible === false;
          })
        ) {
          return createCommentVNode();
        }
        return (
          <ul
            class={`${prefixCls.value}--context-menu-group-wrapper`}
            key={groupIndex}
          >
            {group.map((item, index) =>
              item.visible === false
                ? createCommentVNode()
                : renderMenuItem(item, `${groupIndex}-${index}`),
            )}
          </ul>
        );
      });
    };

    const renderVN = () => {
      const menuOpts = computeMenuOpts.value;
      const { className, transfer } = menuOpts;
      const { visible } = ctxMenuStore;

      return (
        <Teleport disabled={!transfer} to="body">
          <Transition name={`${prefixCls.value}-menu-popup`}>
            {visible ? (
              <div
                class={[
                  ...themeCls.value,
                  `${prefixCls.value}--context-menu-wrapper`,
                  className,
                ]}
                ref={refElem}
                style={ctxMenuStore.style}
              >
                {ctxMenuStore.list && ctxMenuStore.list.length > 0
                  ? renderMenuList()
                  : []}
              </div>
            ) : null}
          </Transition>
        </Teleport>
      );
    };

    Object.assign($asMenuPanel, {
      renderVN,
    });

    context.expose({
      getRefMaps: () => refMaps,
    });

    return renderVN;
  },
});
