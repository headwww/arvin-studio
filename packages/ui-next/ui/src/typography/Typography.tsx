/**
 * Typography 根容器组件（ATypography）
 *
 * 最基础的排版容器：渲染一个语义化标签（默认 article，可自定义 component），
 * 提供 rtl 方向类与样式注入。区别于 Base（Typography.Text/Title/Link/Paragraph
 * 的真正实现），本组件只负责"容器外壳"：无编辑/复制/省略号等能力。
 *
 * 对外暴露 `el`（根元素 ref），供 Base 通过 ref 拿到实际 DOM。
 */
import type { SlotsType } from 'vue';

import type { EmptyEmit } from '../_util';
import type { TypographyBaseProps, TypographySlots } from './interface';

import { defineComponent, resolveDynamicComponent, shallowRef } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import useStyle from './style';

const Typography = defineComponent<
  TypographyBaseProps,
  EmptyEmit,
  string,
  SlotsType<TypographySlots>
>(
  (props, { slots, attrs, expose }) => {
    // 从 ConfigProvider 取出：全局方向、prefixCls、全局 class/style
    const {
      direction: contextDirection,
      prefixCls,
      style: contextStyle,
      class: contextClassName,
    } = useComponentBaseConfig('typography', props);
    // 组件自身可覆盖方向（局部优先）
    const { direction: typographyDirection } = toPropsRefs(props, 'direction');
    // 注册样式，返回 hashId / cssVarCls
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const elementRef = shallowRef<HTMLElement>();

    // 暴露根元素 ref，供父级（Base）测量省略号等使用
    expose({ el: elementRef });

    return () => {
      // 渲染的标签类型：默认 article，可用 component 覆盖（如 div/section）
      const Component = resolveDynamicComponent(
        props.component || 'article',
      ) as any;
      // 方向：局部 > 全局
      const direction = typographyDirection.value || contextDirection.value;
      const { className, restAttrs, style } = getAttrStyleAndClass(attrs);
      const componentClassName = clsx(
        prefixCls.value,
        contextClassName.value,
        {
          [`${prefixCls.value}-rtl`]: direction === 'rtl',
        },
        props.rootClass,
        className,
        hashId.value,
        cssVarCls.value,
      );

      // 样式合并：全局 style 打底，用户 attrs.style 覆盖
      const mergedStyle: any = {
        ...contextStyle.value,
        ...style,
      };

      return (
        <Component
          class={componentClassName}
          ref={elementRef}
          style={mergedStyle}
          title={props.title}
          {...restAttrs}
        >
          {slots.default?.()}
        </Component>
      );
    };
  },
  {
    name: 'AsTypography',
    inheritAttrs: false,
  },
);

export default Typography;
