/**
 * Space.Addon 装饰格组件
 *
 * 用途：给紧凑拼接组（Space.Compact）里的输入类控件挂"附件"——如货币符号 ￥、
 * 单位"元"、前缀 http:// 等。它本身不可交互，但视觉上要与旁边的输入框融为一体：
 * - 通过 useCompactItemContext 消费 Compact 上下文，自动获得
 *   `-compact-item` / `-compact-first-item` / `-compact-last-item` 类，
 *   参与边框合并与圆角削减（与 Input/Button 同一套 genCompactItemStyle 规则）；
 *   与输入框的状态保持一致；
 * - 独立使用时（不在 Compact 内）退化为一个普通装饰盒子。
 *
 */
import type { InputStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider/context';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks'; // 拆分 attrs：className / style / 其余透传
import { getStatusClassNames } from '../_util/statusUtils'; // 状态类名（error/warning 等）
import { useBaseConfig } from '../config-provider/context';
import { useCompactItemContext } from './Compact'; // 紧凑组上下文（边框合并/圆角削减）
import useStyle from './style/addon';

export interface SpaceCompactCellProps {
  /** 禁用态（拼 -disabled 类） */
  disabled?: boolean;
  /** 自定义前缀类名（缺省 as-space-addon） */
  prefixCls?: string;
  /** 状态（error/warning 等，拼状态类名着色） */
  status?: InputStatus;
  /** 变体：outlined（默认）| filled | borderless */
  variant?: Variant;
}

/** 默认 props：variant 缺省为 outlined（与输入框默认变体一致） */
const defaults = {
  variant: 'outlined',
} as any;
const SpaceAddon = defineComponent<SpaceCompactCellProps>(
  (props = defaults, { slots, attrs }) => {
    const { prefixCls, direction: directionConfig } = useBaseConfig(
      'space-addon',
      props,
    );
    // 注册 addon 样式（含 addonPaddingInline/Block 设计 token），返回 hashId/cssVarCls
    const [hashId, cssVarCls] = useStyle(prefixCls);
    // 消费 Compact 上下文：得到紧凑类名（参与边框合并）与紧凑组尺寸
    const { compactItemClassnames, compactSize } = useCompactItemContext(
      prefixCls,
      directionConfig,
    );
    return () => {
      const { status, variant, disabled } = props;
      // 状态类名：如 as-space-addon-error / -warning
      const statusCls = getStatusClassNames(prefixCls.value, status);
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      // 合并类名：基础 + hashId + 紧凑类 + cssVarCls + 变体类 + 状态类 + 尺寸类 + 禁用类 + 用户类
      const classes = clsx(
        prefixCls.value,
        hashId.value,
        compactItemClassnames.value,
        cssVarCls.value,
        `${prefixCls.value}-varias-${variant}`,
        statusCls,
        {
          [`${prefixCls.value}-${compactSize.value}`]: compactSize.value,
          [`${prefixCls.value}-disabled`]: disabled,
        },
        className,
      );

      return (
        <div class={classes} style={style} {...restAttrs}>
          {slots?.default?.()}
        </div>
      );
    };
  },
  {
    name: 'AsSpaceAddon',
    inheritAttrs: false, // attrs 由 getAttrStyleAndClass 手动分发
  },
);

export default SpaceAddon;
