import type { App, CSSProperties, SlotsType } from 'vue';

import type { Locale } from '../../locale';
import type { CopyConfig } from '../interface';

import { defineComponent } from 'vue';

import {
  CheckOutlined,
  CopyOutlined,
  LoadingOutlined,
} from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import Tooltip from '../../tooltip';
import { getNode, toList } from './util';

export interface CopyBtnProps /* @vue-ignore */
  extends CopyBtnEmitsProps, Omit<CopyConfig, 'onCopy'> {
  className?: string;
  /** 是否处于"已复制"态（3s 内） */
  copied: boolean;
  /** 无内容时仅显示图标 */
  iconOnly: boolean;
  /** 复制进行中 */
  loading: boolean;
  /** 本地化文案（copy / copied） */
  locale: Locale['Text'];
  prefixCls: string;
  style?: CSSProperties;
}

export interface CopyBtnEmits {
  copy: (e: MouseEvent) => void;
}
export interface CopyBtnEmitsProps {
  onCopy?: CopyBtnEmits['copy'];
}

const CopyBtn = defineComponent<
  CopyBtnProps,
  CopyBtnEmits,
  string,
  SlotsType<Record<string, never>>
>(
  (props, { emit }) => {
    const handleCopy = (e: MouseEvent) => {
      emit('copy', e);
    };

    return () => {
      const tooltipNodes = toList(props.tooltips as any);
      const iconNodes = toList(props.icon as any);
      const { copied: copiedText, copy: copyText } = props.locale ?? {};
      // 按状态取对应文案/图标：未复制取 [0]，已复制取 [1]
      const systemStr = props.copied ? copiedText : copyText;
      const copyTitle = getNode(
        tooltipNodes[props.copied ? 1 : 0],
        systemStr as any,
      );
      const ariaLabel =
        typeof copyTitle === 'string' ? copyTitle : (systemStr as string);

      return (
        <Tooltip title={copyTitle}>
          <button
            aria-label={ariaLabel}
            class={clsx(
              `${props.prefixCls}-copy`,
              {
                [`${props.prefixCls}-copy-success`]: props.copied,
                [`${props.prefixCls}-copy-icon-only`]: props.iconOnly,
              },
              props.className,
            )}
            onClick={handleCopy}
            style={props.style}
            tabindex={props.tabIndex}
            type="button"
          >
            {/* 图标三态：已复制 → Check；默认 → Copy，复制中 → Loading */}
            {props.copied
              ? getNode(iconNodes[1], <CheckOutlined />, true)
              : getNode(
                  iconNodes[0],
                  props.loading ? <LoadingOutlined /> : <CopyOutlined />,
                  true,
                )}
          </button>
        </Tooltip>
      );
    };
  },
  {
    name: 'TypographyCopyBtn',
    inheritAttrs: false,
  },
);

// 独立注册能力（可脱离 Typography 单独使用）
(CopyBtn as any).install = (app: App) => {
  app.component(CopyBtn.name, CopyBtn);
};

export default CopyBtn;
