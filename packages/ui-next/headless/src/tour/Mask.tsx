import type { CSSProperties, SVGAttributes } from 'vue';

import type { PosInfo } from './hooks/useTarget';
import type { SemanticName, TourProps } from './interface';

import { defineComponent, useId } from 'vue';

import { clsx } from '@arvin-studio/kit';

import Portal from '../portal';

const COVER_PROPS: SVGAttributes = {
  fill: 'transparent',
  'pointer-events': 'auto',
};

export interface MaskProps {
  animated?: boolean | { placeholder: boolean };
  classNames?: Partial<Record<SemanticName, string>>;
  disabledInteraction?: boolean;
  // to fill mask color, e.g. rgba(80,0,0,0.5)
  fill?: string;
  getPopupContainer?: TourProps['getPopupContainer'];
  onEsc?: (info: { event: KeyboardEvent; top: boolean }) => void;
  open?: boolean;
  pos?: null | PosInfo; // 获取引导卡片指向的元素
  prefixCls?: string;
  rootClassName?: string;
  showMask?: boolean;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  zIndex?: number;
}

const Mask = defineComponent<MaskProps>(
  (props, { attrs }) => {
    const id = useId();
    const isSafari =
      typeof navigator !== 'undefined' &&
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    return () => {
      const {
        prefixCls,
        rootClassName,
        pos,
        showMask,
        fill = 'rgba(0,0,0,0.5)',
        open,
        animated,
        zIndex,
        disabledInteraction,
        styles,
        classNames: tourClassNames,
        getPopupContainer,
        onEsc,
      } = props;
      const maskId = `${prefixCls}-mask-${id}`;
      const mergedAnimated =
        typeof animated === 'object' ? animated?.placeholder : animated;

      const maskRectSize = isSafari
        ? { width: '100%', height: '100%' }
        : { width: '100vw', height: '100vh' };

      const inlineMode = getPopupContainer === false;

      return (
        <Portal
          autoLock={!inlineMode}
          getContainer={getPopupContainer as any}
          onEsc={onEsc}
          open={open}
        >
          <div
            class={clsx(
              `${prefixCls}-mask`,
              rootClassName,
              tourClassNames?.mask,
            )}
            style={{
              position: inlineMode ? 'absolute' : 'fixed',
              left: `0px`,
              right: `0px`,
              top: `0px`,
              bottom: `0px`,
              zIndex,
              pointerEvents: pos && !disabledInteraction ? 'none' : 'auto',
              ...(attrs as any).style,
              ...styles?.mask,
            }}
          >
            {showMask ? (
              <svg style={{ width: '100%', height: '100%' }}>
                <defs>
                  <mask id={maskId}>
                    <rect x="0" y="0" {...maskRectSize} fill="white" />
                    {pos && (
                      <rect
                        class={
                          mergedAnimated
                            ? `${prefixCls}-placeholder-animated`
                            : ''
                        }
                        fill="black"
                        height={pos.height}
                        rx={pos.radius}
                        width={pos.width}
                        x={pos.left}
                        y={pos.top}
                      />
                    )}
                  </mask>
                </defs>
                <rect
                  fill={fill}
                  height="100%"
                  mask={`url(#${maskId})`}
                  width="100%"
                  x="0"
                  y="0"
                />

                {/* Block click region */}
                {pos && (
                  <>
                    {/* Top */}

                    <rect
                      {...COVER_PROPS}
                      height={Math.max(pos.top, 0)}
                      width="100%"
                      x="0"
                      y="0"
                    />
                    {/* Left */}
                    <rect
                      {...COVER_PROPS}
                      height="100%"
                      width={Math.max(pos.left, 0)}
                      x="0"
                      y="0"
                    />
                    {/* Bottom */}
                    <rect
                      {...COVER_PROPS}
                      height={`calc(100% - ${pos.top + pos.height}px)`}
                      width="100%"
                      x="0"
                      y={pos.top + pos.height}
                    />
                    {/* Right */}
                    <rect
                      {...COVER_PROPS}
                      height="100%"
                      width={`calc(100% - ${pos.left + pos.width}px)`}
                      x={pos.left + pos.width}
                      y="0"
                    />
                  </>
                )}
              </svg>
            ) : null}
          </div>
        </Portal>
      );
    };
  },
  {
    name: 'TourMask',
    inheritAttrs: false,
  },
);

export default Mask;
