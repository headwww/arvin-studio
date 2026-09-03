import type { SlotsType } from 'vue';

import type {
  BlockProps,
  CopyConfig,
  EditConfig,
  EllipsisConfig,
  TypographyBaseEmits,
  TypographyClassNamesType,
  TypographySlots,
  TypographyStylesType,
} from '../interface';

import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
  watchEffect,
} from 'vue';

import { filterEmpty, ResizeObserver } from '@arvin-studio/headless';
import { EditOutlined } from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../../_util/hooks';
import { isStyleSupport } from '../../_util/styleChecker';
import { toPropsRefs } from '../../_util/tools';
import { useComponentBaseConfig } from '../../config-provider/context';
import useLocale from '../../locale/useLocale';
import Tooltip from '../../tooltip';
import Editable from '../Editable';
import useCopyClick from '../hooks/useCopyClick';
import useMergedConfig from '../hooks/useMergedConfig';
import usePrevious from '../hooks/usePrevious';
import useTooltipProps from '../hooks/useTooltipProps';
import Typography from '../Typography';
import CopyBtn from './CopyBtn';
import Ellipsis from './Ellipsis';
import EllipsisTooltip from './EllipsisTooltip';
import { isEleEllipsis, isValidText, toList } from './util';

/** 省略号显示文本 */
const ELLIPSIS_STR = '...';

/** 装饰类 props（通过嵌套标签实现视觉样式） */
const DECORATION_PROPS: (keyof BlockProps)[] = [
  'delete',
  'mark',
  'code',
  'underline',
  'strong',
  'keyboard',
  'italic',
];

/**
 * 按装饰 props 逐层包裹内容（从内到外）
 * strong → u → del → code → mark → kbd → i
 * 例：strong + code → <strong><code>content</code></strong>
 */
function wrapperDecorations(props: BlockProps, content: any) {
  let currentContent = content;

  function wrap(tag: string, needed?: boolean) {
    if (!needed) return;

    currentContent = h(tag, null, currentContent);
  }

  wrap('strong', props.strong);
  wrap('u', props.underline);
  wrap('del', (props as any).delete);
  wrap('code', props.code);
  wrap('mark', props.mark);
  wrap('kbd', props.keyboard);
  wrap('i', props.italic);

  return currentContent;
}

/** 将 emits 映射为 onXxx 监听器 prop 类型 */
export type TypographyBaseEmitsProps = {
  [K in keyof TypographyBaseEmits as `on${Capitalize<K & string>}`]?: TypographyBaseEmits[K];
};

interface InternalBlockProps
  extends
    BlockProps,
    /* @vue-ignore */
    TypographyBaseEmitsProps {}

const Base = defineComponent<
  InternalBlockProps,
  TypographyBaseEmits,
  string,
  SlotsType<TypographySlots>
>(
  (props, { slots, attrs, emit }) => {
    // 语义化标签容器（Typography）的 ref；组件实例或原生元素（兼容 expose 形态）
    const typographyRef = shallowRef<HTMLElement | { el?: HTMLElement }>();
    const typographyDom = computed(() => {
      const val = typographyRef.value as any;
      if (val && typeof val === 'object' && 'el' in val)
        return val.el as HTMLElement;
      return val as HTMLElement;
    });
    const editIconRef = shallowRef<HTMLButtonElement>();

    // ============ 全局配置与语义化合并 ============
    const {
      prefixCls,
      direction: contextDirection,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('typography', props);

    const mergedDirection = computed(
      () => props.direction ?? contextDirection.value,
    );

    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');

    // 语义化类名/样式合并（全局 + 局部，函数式值按 props 解析）
    const mergedProps = computed(() => {
      return {
        ...props,
        direction: mergedDirection.value,
      };
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TypographyClassNamesType,
      TypographyStylesType,
      BlockProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    // 本地化文案（expand/collapse/edit/copied 等）
    const [textLocale] = useLocale('Text');

    // ========================== Editable ==========================
    // enableEdit：editable 是否为真；editConfig：合并后的编辑配置对象
    const [enableEdit, editConfig] = useMergedConfig<EditConfig>(
      computed(() => props.editable),
    );
    const editing = shallowRef(editConfig.value.editing ?? false);
    watch(
      () => editConfig.value.editing,
      (val) => (editing.value = !!val),
    );
    // 触发方式：默认仅图标；可配置为 'text'（点击文本）
    const triggerType = computed(
      () => editConfig.value.triggerType ?? ['icon'],
    );

    /** 切换编辑态（受控同步 + emit） */
    const triggerEdit = (edit: boolean) => {
      if (edit) editConfig.value.onStart?.();

      editing.value = edit;
      emit('update:editing', edit);
      if (edit) emit('edit:start');
    };

    // 编辑结束（取消）后：把焦点还回编辑按钮（无障碍）
    const prevEditing = usePrevious(() => editing.value);
    watch(
      () => editing.value,
      (val) => {
        if (!val && prevEditing.value) {
          nextTick(() => {
            editIconRef.value?.focus();
          });
        }
      },
      { flush: 'post' },
    );

    const onEditClick = (e?: MouseEvent) => {
      e?.preventDefault();
      triggerEdit(true);
    };

    /** 编辑确认：透传内容并退出编辑态 */
    const onEditChange = (value: string) => {
      editConfig.value.onChange?.(value);
      emit('edit:change', value);
      triggerEdit(false);
    };

    /** 编辑取消 */
    const onEditCancel = () => {
      editConfig.value.onCancel?.();
      emit('edit:cancel');
      triggerEdit(false);
    };

    // ========================== Copyable ==========================
    const [enableCopy, copyConfig] = useMergedConfig<CopyConfig>(
      computed(() => props.copyable),
    );

    // 当前渲染的子节点（供"未显式指定复制文本时取内容文本"使用）
    const childrenNodes = shallowRef<any[]>([]);

    // 复制逻辑：copied（已复制态）/ copyLoading（复制中）/ onClick
    const {
      copied,
      copyLoading,
      onClick: onCopyClick,
    } = useCopyClick({
      copyConfig,
      getText: () => childrenNodes.value,
    });

    const handleCopyClick = async (e?: MouseEvent) => {
      await onCopyClick(e);
      emit('copy', e as any);
    };

    // ========================== Ellipsis ==========================
    // 浏览器能力检测结果（挂载后计算）
    const isLineClampSupport = shallowRef(false);
    const isTextOverflowSupport = shallowRef(false);
    const supportCheckMounted = shallowRef(false);

    // JS 省略相关状态
    const isJsEllipsis = shallowRef(false); // JS 测量是否处于省略态
    const isNativeEllipsis = shallowRef(false); // CSS 省略是否实际发生（tooltip 需要）
    const isNativeVisible = shallowRef(true); // 元素是否可见（IntersectionObserver 维护）
    const [enableEllipsis, rawEllipsisConfig] = useMergedConfig<EllipsisConfig>(
      computed(() => props.ellipsis),
    );

    // 省略配置：默认值（不可展开 + 本地化展开/收起符号）
    const ellipsisConfig = computed<EllipsisConfig>(() => ({
      expandable: false,
      symbol: (isExpanded: boolean) =>
        isExpanded ? textLocale?.value?.collapse : textLocale?.value?.expand,
      ...(rawEllipsisConfig.value as EllipsisConfig),
    }));

    // 展开态（受控：监听 expanded prop）
    const expanded = shallowRef(ellipsisConfig.value.defaultExpanded || false);
    watch(
      () => ellipsisConfig.value.expanded,
      (val) => {
        expanded.value = !!val;
      },
    );

    // 最终启用省略：enableEllipsis 且（未展开 或 支持 collapsible 收起）
    const mergedEnableEllipsis = computed(
      () =>
        enableEllipsis.value &&
        (!expanded.value || ellipsisConfig.value.expandable === 'collapsible'),
    );

    const rows = computed(() => ellipsisConfig.value.rows ?? 1);

    // 是否需要 JS 测量（而非纯 CSS 省略）：
    // 有后缀 / onEllipsis 回调 / 可展开 / 编辑 / 复制 时，CSS 省略无法满足
    const needMeasureEllipsis = computed(() => {
      return (
        mergedEnableEllipsis.value &&
        (ellipsisConfig.value.suffix !== undefined ||
          ellipsisConfig.value.onEllipsis ||
          ellipsisConfig.value.expandable ||
          enableEdit.value ||
          enableCopy.value)
      );
    });

    onMounted(() => {
      supportCheckMounted.value = true;
    });

    // 挂载后检测 CSS 能力（仅无需 JS 测量时）
    watchEffect(() => {
      if (!supportCheckMounted.value) return;

      if (enableEllipsis.value && !needMeasureEllipsis.value) {
        isLineClampSupport.value = isStyleSupport('webkitLineClamp');
        isTextOverflowSupport.value = isStyleSupport('textOverflow');
      }
    });

    // 是否可用纯 CSS 省略
    const cssEllipsis = shallowRef(mergedEnableEllipsis.value);

    const canUseCssEllipsis = computed(() => {
      if (needMeasureEllipsis.value) {
        return false;
      }

      // 单行 → text-overflow；多行 → -webkit-line-clamp
      if (rows.value === 1) return isTextOverflowSupport.value;

      return isLineClampSupport.value;
    });

    watch(
      [canUseCssEllipsis, mergedEnableEllipsis],
      () => {
        cssEllipsis.value =
          canUseCssEllipsis.value && mergedEnableEllipsis.value;
      },
      {
        immediate: true,
      },
    );

    // 省略 tooltip 配置（tooltip === true 时显示完整内容/编辑文本）
    const tooltipProps = useTooltipProps(
      computed(() => ellipsisConfig.value.tooltip),
      computed(() => editConfig.value.text),
      childrenNodes,
    );
    // 纯 CSS 省略 + 有 tooltip 时，需要检测"是否真的省略了"（native 测量）
    const needNativeEllipsisMeasure = computed(
      () => cssEllipsis.value && !!tooltipProps.value?.title,
    );

    // 最终"是否处于省略态"（供 tooltip 显隐与 aria 用）
    const isMergedEllipsis = computed(
      () =>
        mergedEnableEllipsis.value &&
        (cssEllipsis.value
          ? needNativeEllipsisMeasure.value && isNativeEllipsis.value
          : isJsEllipsis.value),
    );

    // 单行 / 多行 CSS 省略类名开关
    const cssTextOverflow = computed(
      () => mergedEnableEllipsis.value && rows.value === 1 && cssEllipsis.value,
    );
    const cssLineClamp = computed(
      () => mergedEnableEllipsis.value && rows.value > 1 && cssEllipsis.value,
    );

    /** 展开/收起点击（受控同步 + emit + 用户回调） */
    const onExpandClick: EllipsisConfig['onExpand'] = (e, info) => {
      expanded.value = info.expanded;
      emit('update:expanded', info.expanded);
      emit('expand', info.expanded, e as any);
      ellipsisConfig.value.onExpand?.(e, info);
    };

    // 容器宽度（ResizeObserver 维护，JS 省略测量依赖）
    const ellipsisWidth = shallowRef(0);
    // 悬停状态：操作区悬停时不显示省略 tooltip
    const isHoveringOperations = shallowRef(false);
    const isHoveringTypography = shallowRef(false);
    const onResize = ({ offsetWidth }: { offsetWidth: number }) => {
      ellipsisWidth.value = offsetWidth;
    };

    /** JS 省略态变化回调（变化时才通知用户 onEllipsis） */
    const onJsEllipsis = (jsEllipsis: boolean) => {
      const changed = isJsEllipsis.value !== jsEllipsis;
      isJsEllipsis.value = jsEllipsis;
      if (changed) ellipsisConfig.value.onEllipsis?.(jsEllipsis);
    };

    // 原生省略测量：依赖项变化后检测元素是否真的溢出了
    watch(
      () => [
        enableEllipsis.value,
        needNativeEllipsisMeasure.value,
        childrenNodes.value,
        cssLineClamp.value,
        isNativeVisible.value,
        ellipsisWidth.value,
      ],
      () => {
        const textEle = typographyDom.value;

        if (
          enableEllipsis.value &&
          needNativeEllipsisMeasure.value &&
          textEle
        ) {
          const currentEllipsis = isEleEllipsis(textEle);

          if (isNativeEllipsis.value !== currentEllipsis)
            isNativeEllipsis.value = currentEllipsis;
        }
      },
      { flush: 'post' },
    );

    // 可见性监听：元素被隐藏时（display:none 等）跳过测量，避免误判
    let observer: IntersectionObserver | null = null;
    watch(
      () => [needNativeEllipsisMeasure.value, mergedEnableEllipsis.value],
      () => {
        observer?.disconnect();
        if (
          typeof IntersectionObserver === 'undefined' ||
          !typographyDom.value ||
          !needNativeEllipsisMeasure.value ||
          !mergedEnableEllipsis.value
        )
          return;

        observer = new IntersectionObserver(() => {
          if (typographyDom.value)
            isNativeVisible.value = !!typographyDom.value.offsetParent;
        });
        if (typographyDom.value) observer.observe(typographyDom.value);
      },
      { flush: 'post', immediate: true },
    );

    onBeforeUnmount(() => {
      observer?.disconnect();
      observer = null;
    });

    // 从子节点中提取纯文本（编辑初始值 / aria-label 用）
    const getChildrenText = computed(() => {
      for (const node of childrenNodes.value) {
        if (isValidText(node)) return node;
        if ((node as any)?.children && isValidText((node as any).children))
          return (node as any).children;
      }
      return undefined;
    });

    // 顶层 aria-label：JS 省略时用完整内容做无障碍标签
    // （CSS 省略时浏览器原生读屏可读，无需覆盖）
    const topAriaLabel = computed(() => {
      if (!enableEllipsis.value || cssEllipsis.value) return undefined;
      return [
        editConfig.value.text,
        getChildrenText.value,
        props.title,
        tooltipProps.value?.title,
      ].find(isValidText);
    });

    // 操作区位置（默认 end）
    const placement = computed<'end' | 'start'>(
      () => props.actions?.placement ?? 'end',
    );

    // ========================== 操作区渲染 ==========================
    /** 展开/收起按钮 */
    const renderExpand = () => {
      const { expandable, symbol } = ellipsisConfig.value;
      return expandable ? (
        <button
          aria-label={
            expanded.value
              ? textLocale?.value?.collapse
              : textLocale?.value?.expand
          }
          class={clsx(
            `${prefixCls.value}-${expanded.value ? 'collapse' : 'expand'}`,
            mergedClassNames.value.action,
          )}
          key="expand"
          onClick={(e: MouseEvent) =>
            onExpandClick(e, { expanded: !expanded.value })
          }
          style={mergedStyles.value.action}
          type="button"
        >
          {typeof symbol === 'function' ? symbol(expanded.value) : symbol}
        </button>
      ) : null;
    };

    /** 编辑按钮（带 tooltip） */
    const renderEdit = () => {
      if (!enableEdit.value) return null;

      const { icon, tooltip, tabIndex } = editConfig.value;
      const tooltipNodes = toList(tooltip as any);

      const editTitle = tooltipNodes[0] || textLocale?.value?.edit;
      const ariaLabel = typeof editTitle === 'string' ? editTitle : '';

      // 仅图标触发方式时渲染按钮；triggerType 含 'text' 时点击文本本身即可进入编辑
      return triggerType.value.includes('icon') ? (
        <Tooltip key="edit" title={tooltip === false ? '' : editTitle}>
          <button
            aria-label={ariaLabel}
            class={clsx(
              `${prefixCls.value}-edit`,
              mergedClassNames.value.action,
            )}
            onClick={onEditClick}
            ref={editIconRef}
            style={mergedStyles.value.action}
            tabindex={tabIndex}
            type="button"
          >
            {icon || <EditOutlined {...{ role: 'button' }} />}
          </button>
        </Tooltip>
      ) : null;
    };

    /** 复制按钮 */
    const renderCopy = () => {
      if (!enableCopy.value) return null;

      return (
        <CopyBtn
          key="copy"
          {...copyConfig.value}
          className={mergedClassNames.value.action as any}
          copied={copied.value}
          iconOnly={childrenNodes.value.length === 0}
          loading={copyLoading.value}
          locale={textLocale?.value}
          onCopy={handleCopyClick}
          prefixCls={prefixCls.value}
          style={mergedStyles.value.action as any}
        />
      );
    };

    /** 操作区容器（expand/edit/copy，可放 start/end） */
    const renderOperations = (canEllipsis: boolean) => {
      const expandNode = canEllipsis && renderExpand();
      const editNode = renderEdit();
      const copyNode = renderCopy();

      if (!expandNode && !editNode && !copyNode) {
        return null;
      }

      return (
        <span
          class={clsx(
            `${prefixCls.value}-actions`,
            mergedClassNames.value.actions,
            {
              [`${prefixCls.value}-actions-start`]: placement.value === 'start',
            },
          )}
          key="operations"
          // 悬停操作区时抑制省略 tooltip（避免遮挡按钮）
          onMouseenter={() => {
            isHoveringOperations.value = true;
          }}
          onMouseleave={() => {
            isHoveringOperations.value = false;
          }}
          style={mergedStyles.value.actions}
        >
          {expandNode}
          {editNode}
          {copyNode}
        </span>
      );
    };

    /** 省略号后缀渲染（... + 自定义 suffix） */
    const renderEllipsis = (canEllipsis: boolean) => {
      return [
        canEllipsis && !expanded.value && (
          <span aria-hidden key="ellipsis">
            {ELLIPSIS_STR}
          </span>
        ),
        ellipsisConfig.value.suffix,
      ];
    };

    // 根类名：类型/禁用/省略类 + 语义化 root 类
    const componentCls = computed(() =>
      clsx(
        {
          [`${prefixCls.value}-${props.type}`]: props.type,
          [`${prefixCls.value}-disabled`]: props.disabled,
          [`${prefixCls.value}-ellipsis`]: enableEllipsis.value,
          [`${prefixCls.value}-ellipsis-single-line`]: cssTextOverflow.value,
          [`${prefixCls.value}-ellipsis-multiple-line`]: cssLineClamp.value,
          [`${prefixCls.value}-link`]: props.component === 'a',
        },
        mergedClassNames.value.root,
      ),
    );

    return () => {
      const {
        className: attrClass,
        style: attrStyle,
        restAttrs,
      } = getAttrStyleAndClass(attrs);
      // 兼容驼峰/小写两种 mouseenter/leave 事件写法，统一转发
      const onMouseenter =
        (restAttrs as any).onMouseenter ?? (restAttrs as any).onMouseEnter;
      const onMouseleave =
        (restAttrs as any).onMouseleave ?? (restAttrs as any).onMouseLeave;
      delete (restAttrs as any).onMouseenter;
      delete (restAttrs as any).onMouseEnter;
      delete (restAttrs as any).onMouseleave;
      delete (restAttrs as any).onMouseLeave;
      const children = filterEmpty(slots?.default?.());
      childrenNodes.value = children;
      // 点击行为：triggerType 含 'text' 时点击文本进入编辑，否则作为普通 click 透传
      const clickHandler = triggerType.value.includes('text')
        ? onEditClick
        : (e: MouseEvent) => emit('click', e);
      const mergedClassName = clsx(componentCls.value, attrClass);
      const mergedStyle = [
        mergedStyles.value.root,
        // 多行 CSS 省略需要内联 WebkitLineClamp（行数动态）
        cssLineClamp.value ? { WebkitLineClamp: rows.value } : null,
        attrStyle,
      ];

      // =========================== Render ===========================
      // 编辑态 → 渲染文本域（Editable）
      if (editing.value) {
        return (
          <Editable
            autoSize={editConfig.value.autoSize}
            classes={mergedClassNames.value}
            className={clsx(attrClass, props.rootClass, contextClassName.value)}
            component={props.component as any}
            direction={mergedDirection.value}
            enterIcon={editConfig.value.enterIcon}
            maxLength={editConfig.value.maxLength}
            onCancel={onEditCancel}
            onEnd={() => {
              editConfig.value.onEnd?.();
              emit('edit:end');
            }}
            onSave={onEditChange}
            prefixCls={prefixCls.value}
            style={[contextStyle.value, attrStyle] as any}
            styles={mergedStyles.value}
            value={
              editConfig.value.text ??
              // oxlint-disable-next-line eqeqeq
              (getChildrenText.value == null
                ? ''
                : String(getChildrenText.value))
            }
          />
        );
      }
      return (
        // 监听容器宽度变化（JS 省略测量依赖宽度）
        <ResizeObserver
          disabled={!mergedEnableEllipsis.value}
          onResize={onResize}
        >
          <EllipsisTooltip
            enableEllipsis={mergedEnableEllipsis.value}
            isEllipsis={isMergedEllipsis.value}
            open={isHoveringTypography.value && !isHoveringOperations.value}
            tooltipProps={tooltipProps.value}
          >
            <Typography
              aria-label={topAriaLabel.value as any}
              class={mergedClassName}
              component={props.component as any}
              direction={mergedDirection.value}
              onClick={clickHandler}
              // 悬停状态：控制省略 tooltip 显隐，并转发用户事件
              onMouseenter={(e: MouseEvent) => {
                isHoveringTypography.value = true;
                onMouseenter?.(e);
              }}
              onMouseleave={(e: MouseEvent) => {
                isHoveringTypography.value = false;
                onMouseleave?.(e);
              }}
              prefixCls={prefixCls.value}
              ref={typographyRef}
              rootClass={props.rootClass}
              style={mergedStyle as any}
              title={props.title!}
              {...restAttrs}
            >
              {/* JS 省略时用 Ellipsis 测量截断；CSS 省略时直接渲染内容 */}
              <Ellipsis
                enableMeasure={mergedEnableEllipsis.value && !cssEllipsis.value}
                rows={rows.value}
                text={children}
                width={ellipsisWidth.value}
                {...({
                  onEllipsis: onJsEllipsis,
                } as any)}
                expanded={expanded.value}
                miscDeps={[
                  copied.value,
                  expanded.value,
                  copyLoading.value,
                  enableEdit.value,
                  enableCopy.value,
                  textLocale?.value,
                  ...DECORATION_PROPS.map((key) => (props as any)[key]),
                ]}
              >
                {(node: any, canEllipsis: any) => {
                  // 内容组装：操作区(start) + 内容/截断内容 + 省略号 + 操作区(end)，再套装饰标签
                  return wrapperDecorations(
                    props,
                    <>
                      {placement.value === 'start'
                        ? renderOperations(canEllipsis)
                        : null}
                      {/* 有省略 + 存在 aria-label 时，额外渲染一份 aria-hidden 的完整内容
                          （读屏用 aria-label，视觉上隐藏完整文本避免重复） */}
                      {node.length > 0 &&
                      canEllipsis &&
                      !expanded.value &&
                      topAriaLabel.value ? (
                        <span aria-hidden key="show-content">
                          {node}
                        </span>
                      ) : (
                        node
                      )}
                      <>{renderEllipsis(canEllipsis)}</>
                      {placement.value === 'start'
                        ? null
                        : renderOperations(canEllipsis)}
                    </>,
                  );
                }}
              </Ellipsis>
            </Typography>
          </EllipsisTooltip>
        </ResizeObserver>
      );
    };
  },
  {
    name: 'ATypographyBase',
    inheritAttrs: false,
  },
);

export default Base;
