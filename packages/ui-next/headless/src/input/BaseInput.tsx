import type { BaseInputProps } from './interface';

import {
  computed,
  createVNode,
  defineComponent,
  Fragment,
  shallowRef,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

import { filterEmpty } from '../util';
import { hasAddon, hasPrefixSuffix } from './utils/commonUtils';

/** 对外暴露的容器 ref 形态 */
export interface HolderRef {
  /** Provider holder ref. Will return `null` if not wrap anything */
  /** 根元素：未包裹时为 null（原样 input 场景由 Input 层直接持有 input ref） */
  nativeElement: HTMLElement | null;
}

const BaseInput = defineComponent<BaseInputProps>(
  (props, { slots, expose, attrs }) => {
    // affix-wrapper 容器 ref
    const containerRef = shallowRef<HTMLDivElement>();
    // 点击容器（前缀/后缀/addon/空白区域）→ 聚焦 input
    const onInputClick = (e: MouseEvent) => {
      if (containerRef.value?.contains(e.target as Element)) {
        props?.triggerFocus?.();
      }
    };
    // 是否需要 affix-wrapper 层
    const hasAffix = computed(() => hasPrefixSuffix(props));

    // ======================== Ref ======================== //
    // group-wrapper 容器 ref（有 addon 时存在）
    const groupRef = shallowRef<HTMLDivElement>();
    expose({
      nativeElement: computed(() => groupRef.value || containerRef.value),
    });
    return () => {
      const {
        components,
        allowClear,
        readOnly,
        disabled,
        value,
        prefixCls,
        handleReset,
        onClear,
        suffix,
        focused,
        classNames,
        styles,
        dataAttrs,
        prefix,
        addonAfter,
        addonBefore,
        hidden,
      } = props;
      // 归一化插槽：单个子节点直接用，多个包成 Fragment
      let children: any = filterEmpty(slots?.default?.() ?? []);
      children =
        children.length === 1
          ? children[0]
          : createVNode(Fragment, null, children);
      const inputElement = children;
      // 各层可替换的标签（默认 span，可换 div）
      const AffixWrapperComponent = components?.affixWrapper || 'span';
      const GroupWrapperComponent = components?.groupWrapper || 'span';
      const WrapperComponent = components?.wrapper || 'span';
      const GroupAddonComponent = components?.groupAddon || 'span';

      // 给 input 注入 value；无 affix 时把 variant 类挂到 input 自身
      let element = createVNode(inputElement, {
        value,
        class: !hasAffix.value && classNames?.variant,
      });
      // ================== Prefix & Suffix ================== //
      // 有前缀/后缀/清除 → 包 affix-wrapper
      if (hasAffix.value) {
        let clearIcon: any = null;

        // ================== Clear Icon ================== //
        // 清除按钮（仅在有值、未禁用、非只读时显示）
        if (allowClear) {
          const clearDisabled =
            typeof allowClear === 'object' && allowClear?.disabled;
          const needClear = !disabled && !readOnly && value && !clearDisabled;
          const clearIconCls = `${prefixCls}-clear-icon`;
          const iconNode =
            typeof allowClear === 'object' && allowClear?.clearIcon
              ? allowClear.clearIcon
              : '✖';

          clearIcon = (
            // 用 button 保证键盘可达（Tab 可聚焦、Enter/空格可触发）
            <button
              class={clsx(clearIconCls, classNames?.clear, {
                [`${clearIconCls}-hidden`]: !needClear,
                [`${clearIconCls}-has-suffix`]: !!suffix,
              })}
              disabled={clearDisabled || undefined}
              onClick={(event) => {
                if (clearDisabled) return;
                handleReset?.(event);
                onClear?.();
              }}
              // 阻止 mousedown 默认行为：避免点击清除时先触发 input 失焦
              onMousedown={(e) => e.preventDefault()}
              style={styles?.clear}
              type="button"
            >
              {iconNode}
            </button>
          );
        }

        const affixWrapperPrefixCls = `${prefixCls}-affix-wrapper`;
        const affixWrapperCls = clsx(
          affixWrapperPrefixCls,
          {
            [`${prefixCls}-disabled`]: disabled,
            [`${affixWrapperPrefixCls}-disabled`]: disabled, // Not used, but keep it
            [`${affixWrapperPrefixCls}-focused`]: focused, // Not used, but keep it
            [`${affixWrapperPrefixCls}-readonly`]: readOnly,
            [`${affixWrapperPrefixCls}-input-with-clear-btn`]:
              suffix && allowClear && value,
          },
          classNames?.affixWrapper,
          classNames?.variant,
        );

        // 后缀区：清除按钮 + 用户 suffix（清除按钮在有 suffix 时并入同一容器）
        const suffixNode = (suffix || allowClear) && (
          <span
            class={clsx(`${prefixCls}-suffix`, classNames?.suffix)}
            style={styles?.suffix}
          >
            {clearIcon}
            {suffix}
          </span>
        );

        // affix-wrapper：前缀 + input + 后缀（点击任意位置聚焦）
        element = (
          <AffixWrapperComponent
            class={affixWrapperCls}
            onClick={onInputClick}
            style={styles?.affixWrapper}
            {...dataAttrs?.affixWrapper}
            ref={containerRef}
          >
            {prefix && (
              <span
                class={clsx(`${prefixCls}-prefix`, classNames?.prefix)}
                style={styles?.prefix}
              >
                {prefix}
              </span>
            )}
            {element}
            {suffixNode}
          </AffixWrapperComponent>
        );
      }

      // ================== Addon ================== //
      // 有前后 addon → 再包一层 group（addon + affix/input 整体）
      if (hasAddon(props)) {
        const wrapperCls = `${prefixCls}-group`;
        const addonCls = `${wrapperCls}-addon`;
        const groupWrapperCls = `${wrapperCls}-wrapper`;

        const mergedWrapperClassName = clsx(
          `${prefixCls}-wrapper`,
          wrapperCls,
          classNames?.wrapper,
        );

        const mergedGroupClassName = clsx(
          groupWrapperCls,
          {
            [`${groupWrapperCls}-disabled`]: disabled,
          },
          classNames?.groupWrapper,
        );

        // Need another wrapper for changing display:table to display:inline-block
        // and put style prop in wrapper
        // 需要再套一层 wrapper：group-wrapper 管 display:table，
        // wrapper 管 display:inline-block，避免样式冲突
        element = (
          <GroupWrapperComponent class={mergedGroupClassName} ref={groupRef}>
            <WrapperComponent class={mergedWrapperClassName}>
              {addonBefore && (
                <GroupAddonComponent class={addonCls}>
                  {addonBefore}
                </GroupAddonComponent>
              )}
              {element}
              {addonAfter && (
                <GroupAddonComponent class={addonCls}>
                  {addonAfter}
                </GroupAddonComponent>
              )}
            </WrapperComponent>
          </GroupWrapperComponent>
        );
      }
      // `className` and `style` are always on the root element
      // class/style 始终落在最外层根元素上（最终渲染时补上 attrs）
      return createVNode(element, {
        ...attrs,
        hidden,
      });
    };
  },
  {
    name: 'BaseInput',
    inheritAttrs: false,
  },
);
export default BaseInput;
