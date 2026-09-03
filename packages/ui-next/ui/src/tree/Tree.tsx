import type { CSSProperties, SlotsType } from 'vue';

import type {
  BasicDataNode,
  DataNode,
  Key,
  TreeRef,
  TreeProps as VcTreeProps,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';

import { computed, defineComponent, shallowRef } from 'vue';

import {
  getAttrStyleAndClass,
  ExportTree as VcTree,
} from '@arvin-studio/headless';
import { HolderOutlined } from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import {
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import initCollapseMotion from '../_util/motion';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import { useToken } from '../theme/internal';
import useStyle from './style';
import dropIndicatorRender from './utils/dropIndicator';
import SwitcherIconCom from './utils/iconUtil';

export type SwitcherIcon = ((props: AsTreeNodeProps) => any) | any;
export type TreeLeafIcon = ((props: AsTreeNodeProps) => any) | any;
type TreeIcon = ((props: AsdTreeNodeAttribute) => any) | any;

export type { TreeRef };
export interface AsdTreeNodeAttribute {
  checked: boolean;
  children: VueNode;
  className: string;
  disableCheckbox: boolean;
  disabled: boolean;
  dragOver: boolean;
  dragOverGapBottom: boolean;
  dragOverGapTop: boolean;
  eventKey: string;
  expanded: boolean;
  halfChecked: boolean;
  isLeaf: boolean;
  pos: string;
  prefixCls: string;
  selectable: boolean;
  selected: boolean;
  title: VueNode;
}

export interface AsTreeNodeProps {
  [customProp: string]: any;
  checkable?: boolean;
  checked?: boolean;
  children?: VueNode;
  className?: string;
  disableCheckbox?: boolean;
  disabled?: boolean;
  eventKey?: Key;
  expanded?: boolean;
  icon?: TreeIcon;
  isLeaf?: boolean;
  key?: Key;
  loading?: boolean;
  selectable?: boolean;
  selected?: boolean;
  title?: ((data: DataNode) => any) | any;
}

export type AsTreeNode = AsTreeNodeProps;

export interface AsTreeNodeBaseEvent {
  nativeEvent: MouseEvent;
  node: any;
}

export interface AsTreeNodeCheckedEvent extends AsTreeNodeBaseEvent {
  checked?: boolean;
  checkedNodes?: AsTreeNode[];
  event: 'check';
}

export interface AsTreeNodeSelectedEvent extends AsTreeNodeBaseEvent {
  event: 'select';
  selected?: boolean;
  selectedNodes?: DataNode[];
}

export interface AsTreeNodeExpandedEvent extends AsTreeNodeBaseEvent {
  expanded?: boolean;
}

export interface AsTreeNodeMouseEvent {
  event: (e: DragEvent) => void;
  node: AsTreeNode;
}

export interface AsTreeNodeDragEnterEvent extends AsTreeNodeMouseEvent {
  expandedKeys: Key[];
}

export interface AsTreeNodeDropEvent {
  dragNode: AsTreeNode;
  dragNodesKeys: Key[];
  dropPosition: number;
  dropToGap?: boolean;
  event: (e: MouseEvent) => void;
  node: AsTreeNode;
}

// [Legacy] Compatible for v3
export type TreeNodeNormal = DataNode;
type DraggableFn = (node: DataNode) => boolean;

interface DraggableConfig {
  icon?: VueNode;
  nodeDraggable?: DraggableFn;
}

export type TreeSemanticName = keyof TreeSemanticClassNames &
  keyof TreeSemanticStyles;

export interface TreeSemanticClassNames {
  item?: string;
  itemIcon?: string;
  itemSwitcher?: string;
  itemTitle?: string;
  root?: string;
}

export interface TreeSemanticStyles {
  item?: CSSProperties;
  itemIcon?: CSSProperties;
  itemSwitcher?: CSSProperties;
  itemTitle?: CSSProperties;
  root?: CSSProperties;
}

export type TreeClassNamesType = SemanticClassNamesType<
  TreeProps,
  TreeSemanticClassNames
>;

export type TreeStylesType = SemanticStylesType<TreeProps, TreeSemanticStyles>;

export interface TreeProps<T extends BasicDataNode = DataNode>
  extends
    Omit<
      VcTreeProps<T>,
      | 'className'
      | 'classNames'
      | 'direction'
      | 'draggable'
      | 'icon'
      | 'onActiveChange'
      | 'onBlur'
      | 'onCheck'
      | 'onClick'
      | 'onContextMenu'
      | 'onDoubleClick'
      | 'onDragEnd'
      | 'onDragEnter'
      | 'onDragLeave'
      | 'onDragOver'
      | 'onDragStart'
      | 'onDrop'
      | 'onExpand'
      | 'onFocus'
      | 'onKeyDown'
      | 'onLoad'
      | 'onMouseEnter'
      | 'onMouseLeave'
      | 'onRightClick'
      | 'onScroll'
      | 'onSelect'
      | 'prefixCls'
      | 'rootClassName'
      | 'rootStyle'
      | 'showLine'
      | 'style'
      | 'styles'
      | 'switcherIcon'
      | 'tabIndex'
    >,
    /* @vue-ignore */
    TreeEmitsProps {
  /** Whether to automatically expand the parent node */
  autoExpandParent?: boolean;
  blockNode?: boolean;
  /** Whether to support selection */
  checkable?: boolean;
  /** (Controlled) Tree node with checked checkbox */
  checkedKeys?: Key[] | { checked: Key[]; halfChecked: Key[] };
  /** Node selection in Checkable state is fully controlled (the selected state of parent and child nodes is no longer associated) */
  checkStrictly?: boolean;

  classes?: TreeClassNamesType;
  /** Tree node with checkbox checked by default */
  defaultCheckedKeys?: Key[];
  /** Expand all tree nodes by default */
  defaultExpandAll?: boolean;
  /** Expand the specified tree node by default */
  defaultExpandedKeys?: Key[];
  /** Expand the corresponding tree node by default */
  defaultExpandParent?: boolean;
  /** Tree node selected by default */
  defaultSelectedKeys?: Key[];
  /** whether to disable the tree */
  disabled?: boolean;
  /** Set the node to be draggable (IE>8) */
  draggable?: boolean | DraggableConfig | DraggableFn;
  /** (Controlled) Expand the specified tree node */
  expandedKeys?: Key[];
  /** Click on the tree node to trigger */
  filterAsTreeNode?: (node: AsTreeNode) => boolean;
  icon?: TreeIcon;
  loadedKeys?: Key[];
  /** Whether to support multiple selection */
  multiple?: boolean;
  prefixCls?: string;
  rootClass?: string;
  /** @deprecated Please use `styles.root` instead */
  rootStyle?: CSSProperties;
  selectable?: boolean;

  /** (Controlled) Set the selected tree node */
  selectedKeys?: Key[];
  showIcon?: boolean;
  showLine?: boolean | { showLeafIcon: boolean | TreeLeafIcon };
  styles?: TreeStylesType;
  switcherIcon?: SwitcherIcon;
  switcherLoadingIcon?: VueNode;
  tabindex?: number;
}

export interface TreeEmits {
  activeChange: NonNullable<VcTreeProps['onActiveChange']>;
  blur: NonNullable<VcTreeProps['onBlur']>;
  check: NonNullable<VcTreeProps['onCheck']>;
  click: NonNullable<VcTreeProps['onClick']>;
  contextmenu: NonNullable<VcTreeProps['onContextMenu']>;
  dblclick: NonNullable<VcTreeProps['onDoubleClick']>;
  doubleClick: NonNullable<VcTreeProps['onDoubleClick']>;
  dragend: NonNullable<VcTreeProps['onDragEnd']>;
  dragenter: NonNullable<VcTreeProps['onDragEnter']>;
  dragleave: NonNullable<VcTreeProps['onDragLeave']>;
  dragover: NonNullable<VcTreeProps['onDragOver']>;
  dragstart: NonNullable<VcTreeProps['onDragStart']>;
  drop: NonNullable<VcTreeProps['onDrop']>;
  expand: NonNullable<VcTreeProps['onExpand']>;
  focus: NonNullable<VcTreeProps['onFocus']>;
  keydown: NonNullable<VcTreeProps['onKeyDown']>;
  load: NonNullable<VcTreeProps['onLoad']>;
  mouseenter: NonNullable<VcTreeProps['onMouseEnter']>;
  mouseleave: NonNullable<VcTreeProps['onMouseLeave']>;
  rightClick: NonNullable<VcTreeProps['onRightClick']>;
  scroll: NonNullable<VcTreeProps['onScroll']>;
  select: NonNullable<VcTreeProps['onSelect']>;
  'update:activeKey': (key: Key) => void;
  'update:checkedKeys': (keys: Key[]) => void;
  'update:expandedKeys': (keys: Key[]) => void;
  'update:selectedKeys': (keys: Key[]) => void;
}
export interface TreeEmitsProps {
  onActiveChange?: TreeEmits['activeChange'];
  onBlur?: TreeEmits['blur'];
  onCheck?: TreeEmits['check'];
  onClick?: TreeEmits['click'];
  onContextmenu?: TreeEmits['contextmenu'];
  onDblclick?: TreeEmits['dblclick'];
  onDoubleClick?: TreeEmits['doubleClick'];
  onDragend?: TreeEmits['dragend'];
  onDragenter?: TreeEmits['dragenter'];
  onDragleave?: TreeEmits['dragleave'];
  onDragover?: TreeEmits['dragover'];
  onDragstart?: TreeEmits['dragstart'];
  onDrop?: TreeEmits['drop'];
  onExpand?: TreeEmits['expand'];
  onFocus?: TreeEmits['focus'];
  onKeydown?: TreeEmits['keydown'];
  onLoad?: TreeEmits['load'];
  onMouseenter?: TreeEmits['mouseenter'];
  onMouseleave?: TreeEmits['mouseleave'];
  onRightClick?: TreeEmits['rightClick'];
  onScroll?: TreeEmits['scroll'];
  onSelect?: TreeEmits['select'];
  'onUpdate:activeKey'?: TreeEmits['update:activeKey'];
  'onUpdate:checkedKeys'?: TreeEmits['update:checkedKeys'];
  'onUpdate:expandedKeys'?: TreeEmits['update:expandedKeys'];
  'onUpdate:selectedKeys'?: TreeEmits['update:selectedKeys'];
}

export interface TreeSlots {
  default: () => any;
  draggableIcon: () => any;
  icon: (props: AsdTreeNodeAttribute) => any;
  switcherIcon: (props: AsTreeNodeProps) => any;
  switcherLoadingIcon: () => any;
  titleRender: VcTreeProps['titleRender'];
}

const defaults = {
  showIcon: false,
  blockNode: false,
  checkable: false,
  selectable: true,
} as any;

const Tree = defineComponent<
  TreeProps<BasicDataNode>,
  TreeEmits,
  string,
  SlotsType<TreeSlots>
>(
  (props = defaults, { slots, emit, expose, attrs }) => {
    const {
      virtual,
      prefixCls,
      rootPrefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('tree', props);
    const treeRef = shallowRef();
    const {
      classes,
      styles,
      motion: customMotion,
      rootStyle,
    } = toPropsRefs(props, 'classes', 'styles', 'motion', 'rootStyle');

    // =================Warning===================
    if (isDev) {
      const warning = devUseWarning('Tree');
      warning.deprecated(!rootStyle.value, 'rootStyle', 'styles.root');
    }

    const contextDisabled = useDisabledContext();
    const mergedDisabled = computed(
      () => props?.disabled ?? contextDisabled.value,
    );
    const motion = computed(
      () =>
        customMotion.value ?? {
          ...initCollapseMotion(rootPrefixCls.value),
          appear: false,
        },
    );

    // =========== Merged Props for Semantic ==========
    const mergedProps = computed(() => {
      return {
        ...props,
        disabled: mergedDisabled.value,
        motion: motion.value,
      } as TreeProps;
    });

    const rootStyleRoot = useSemanticRootStyle(rootStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TreeClassNamesType,
      TreeStylesType,
      TreeProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, rootStyleRoot as any, styles),
      useToProps(mergedProps),
    );
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const [, token] = useToken();

    const itemHeight = computed(
      () =>
        token.value.paddingXS / 2 +
        (token.value.Tree?.titleHeight || token.value.controlHeightSM),
    );
    expose({
      scrollTo(...args: any[]) {
        treeRef.value?.scrollTo?.(...args);
      },
    });
    return () => {
      const {
        draggable,
        showLine,
        selectable,
        blockNode,
        showIcon,
        checkable,
        rootClass,
        tabindex,
      } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const draggableIcon = getSlotPropsFnRun(slots, props, 'draggableIcon');
      const draggableConfigFn = () => {
        if (!draggable) {
          return false;
        }

        let mergedDraggable: DraggableConfig = {};
        switch (typeof draggable) {
          case 'function': {
            mergedDraggable.nodeDraggable = draggable;
            break;
          }
          case 'object': {
            mergedDraggable = { ...draggable };
            break;
          }
          default: {
            break;
          }
          // Do nothing
        }

        if (mergedDraggable.icon !== false) {
          mergedDraggable.icon = draggableIcon || mergedDraggable.icon || (
            <HolderOutlined />
          );
        }

        return mergedDraggable;
      };
      const draggableConfig = draggableConfigFn();
      const switcherIcon = slots?.switcherIcon ?? props?.switcherIcon;
      const switcherLoadingIcon = getSlotPropsFnRun(
        slots,
        props,
        'switcherLoadingIcon',
      );
      const renderSwitcherIcon = (nodeProps: AsTreeNodeProps) => (
        <SwitcherIconCom
          prefixCls={prefixCls.value}
          showLine={showLine}
          switcherIcon={switcherIcon}
          switcherLoadingIcon={switcherLoadingIcon}
          treeNodeProps={nodeProps}
        />
      );
      const newProps = {
        ...omit(props, ['icon']),
        disabled: mergedDisabled.value,
        showLine: Boolean(showLine),
        dropIndicatorRender,
      };
      const onAttrs: Partial<VcTreeProps> = {
        onCheck(checked, info) {
          emit('check', checked, info);
          if (Array.isArray(checked)) {
            emit('update:checkedKeys', checked);
          } else {
            emit('update:checkedKeys', checked?.checked ?? []);
          }
        },
        onClick(...args) {
          emit('click', ...args);
        },
        onExpand(expandKeys, info) {
          emit('expand', expandKeys, info);
          emit('update:expandedKeys', expandKeys);
        },
        onBlur(e) {
          emit('blur', e);
        },
        onLoad(loadKeys, info) {
          emit('load', loadKeys, info);
        },
        onFocus(e) {
          emit('focus', e);
        },
        onActiveChange(key) {
          emit('activeChange', key);
          emit('update:activeKey', key!);
        },
        onDrop(info) {
          emit('drop', info);
        },
        onDragEnd(info) {
          emit('dragend', info);
        },
        onDragEnter(info) {
          emit('dragenter', info);
        },
        onDragLeave(info) {
          emit('dragleave', info);
        },
        onDragOver(info) {
          emit('dragover', info);
        },
        onDoubleClick(...args) {
          emit('doubleClick', ...args);
          emit('dblclick', ...args);
        },
        onContextMenu(e) {
          emit('contextmenu', e);
        },
        onKeyDown(e) {
          emit('keydown', e);
        },
        onScroll(e) {
          emit('scroll', e);
        },
        onRightClick(info) {
          emit('rightClick', info);
        },
        onSelect(keys, info) {
          emit('select', keys, info);
          emit('update:selectedKeys', keys);
        },
        onDragStart(info) {
          emit('dragstart', info);
        },
        onMouseEnter(e) {
          emit('mouseenter', e);
        },
        onMouseLeave(e) {
          emit('mouseleave', e);
        },
      };

      const icon = slots?.icon ?? props?.icon;
      const titleRender = slots?.titleRender ?? props?.titleRender;
      return (
        <VcTree
          {...restAttrs}
          ref={treeRef}
          {...(newProps as any)}
          itemHeight={props?.itemHeight ?? itemHeight.value}
          virtual={props?.virtual ?? virtual.value}
          {...onAttrs}
          checkable={
            checkable ? (
              <span class={`${prefixCls.value}-checkbox-inner`} />
            ) : (
              checkable
            )
          }
          className={clsx(
            {
              [`${prefixCls.value}-icon-hide`]: !showIcon,
              [`${prefixCls.value}-block-node`]: blockNode,
              [`${prefixCls.value}-unselectable`]: !selectable,
              [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
              [`${prefixCls.value}-disabled`]: mergedDisabled.value,
            },
            contextClassName.value,
            className,
            hashId.value,
            cssVarCls.value,
          )}
          classNames={mergedClassNames.value}
          direction={direction.value}
          draggable={draggableConfig}
          icon={icon}
          motion={motion.value}
          prefixCls={prefixCls.value}
          rootClassName={clsx(mergedClassNames.value?.root, rootClass)}
          rootStyle={mergedStyles.value?.root}
          selectable={selectable}
          style={{ ...contextStyle.value, ...style }}
          styles={mergedStyles.value}
          switcherIcon={renderSwitcherIcon}
          tabIndex={tabindex}
          titleRender={titleRender}
          v-slots={{
            default: slots?.default,
          }}
        />
      );
    };
  },
  {
    name: 'AsTree',
    inheritAttrs: false,
  },
);

export default Tree;
