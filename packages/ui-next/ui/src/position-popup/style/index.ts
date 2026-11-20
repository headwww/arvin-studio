import type { ComputedRef } from 'vue';

import type { CSSObject } from '@arvin-studio/cssinjs';

import type { GlobalToken } from '../../theme/internal';

import { computed } from 'vue';

import { Keyframes } from '@arvin-studio/cssinjs';

import { useStyleRegister, useToken } from '../../theme/internal';

const positionPopupZoomIn = new Keyframes('PositionPopupZoomIn', {
  '0%': {
    transform: 'scale(0.8)',
    opacity: 0,
  },
  '100%': {
    transform: 'scale(1)',
    opacity: 1,
  },
});

const positionPopupZoomOut = new Keyframes('PositionPopupZoomOut', {
  '0%': {
    transform: 'scale(1)',
    opacity: 1,
  },
  '100%': {
    transform: 'scale(0.8)',
    opacity: 0,
  },
});

const genStyle = (prefixCls: string, token: GlobalToken): CSSObject => {
  const arrowCls = `${prefixCls}-arrow`;
  const zoomCls = `.${prefixCls}-zoom`;

  return {
    // 透明锚点：只负责给 Trigger 提供文档坐标，不参与命中测试
    [`.${prefixCls}-anchor`]: {
      position: 'absolute',
      pointerEvents: 'none',
    },

    [`.${prefixCls}`]: {
      // 必须是 absolute：Trigger 写的是文档坐标，靠它随页面一起滚出视口
      position: 'absolute',
      boxSizing: 'border-box',
      minWidth: 160,
      padding: `${token.paddingSM}px ${token.padding}px`,
      color: token.colorText,
      backgroundColor: token.colorBgElevated,
      borderRadius: token.borderRadiusLG,
      boxShadow: token.boxShadowSecondary,
      zIndex: token.zIndexPopupBase + 50,
      transformOrigin: 'var(--arrow-x, 50%) var(--arrow-y, 50%)',
    },

    [`.${prefixCls}-content`]: {
      maxHeight: 'min(60vh, 420px)',
      overflow: 'auto',
      overscrollBehavior: 'contain',
    },

    // 箭头位置由 Trigger 写到 popup 根节点的 --arrow-x 决定
    [`.${arrowCls}`]: {
      position: 'absolute',
      left: 'var(--arrow-x, 50%)',
      width: 8,
      height: 8,
      backgroundColor: token.colorBgElevated,
      transform: 'translateX(-50%) rotate(45deg)',
      boxShadow: '-1px -1px 3px rgba(0, 0, 0, 0.04)',
      pointerEvents: 'none',
    },

    [`.${prefixCls}-placement-bottom .${arrowCls}`]: { top: -4 },
    [`.${prefixCls}-placement-bottomLeft .${arrowCls}`]: { top: -4 },
    [`.${prefixCls}-placement-bottomRight .${arrowCls}`]: { top: -4 },
    [`.${prefixCls}-placement-top .${arrowCls}`]: { bottom: -4 },
    [`.${prefixCls}-placement-topLeft .${arrowCls}`]: { bottom: -4 },
    [`.${prefixCls}-placement-topRight .${arrowCls}`]: { bottom: -4 },
    // ===== zoom 动画，类名和 Trigger 的 popupMotion 对应 =====
    [`${zoomCls}-enter, ${zoomCls}-appear`]: {
      animationDuration: token.motionDurationMid,
      animationFillMode: 'both',
      animationPlayState: 'paused',
      animationTimingFunction: token.motionEaseOutCirc,
      opacity: 0,
      transform: 'scale(0.8)',
    },

    [`${zoomCls}-leave`]: {
      animationDuration: token.motionDurationMid,
      animationFillMode: 'both',
      animationPlayState: 'paused',
      animationTimingFunction: token.motionEaseInOutCirc,
    },

    [`${zoomCls}-enter${zoomCls}-enter-active, ${zoomCls}-appear${zoomCls}-appear-active`]:
      {
        animationName: positionPopupZoomIn,
        animationPlayState: 'running',
      },

    [`${zoomCls}-leave${zoomCls}-leave-active`]: {
      animationName: positionPopupZoomOut,
      animationPlayState: 'running',
      pointerEvents: 'none',
    },
  };
};

export default function useStyle(prefixCls: ComputedRef<string>) {
  const [theme, token] = useToken();

  useStyleRegister(
    computed(() => ({
      theme: theme.value!,
      token: token.value,
      hashId: '',
      path: ['PositionPopup', prefixCls.value],
      layer: { name: 'as' },
    })),
    () => genStyle(prefixCls.value, token.value),
  );
}
