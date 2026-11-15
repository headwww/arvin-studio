import type { CSSInterpolation } from '@arvin-studio/cssinjs';

import type { TableToken } from './interface';

export function genScrollStyle(token: TableToken): CSSInterpolation {
  const {
    componentCls,
    borderWidth,
    borderColor,
    headerBackgroundColor,
    scrollbarWidth,
    scrollbarHeight,
  } = token;

  return [
    {
      [`${componentCls}`]: {
        [`&.is--loading`]: {
          [`& > ${componentCls}--scroll-x-virtual`]: { visibility: 'hidden' },

          [`& > ${componentCls}--layout-wrapper`]: {
            [`& > ${componentCls}--scroll-y-virtual`]: { visibility: 'hidden' },
          },
        },

        [`${componentCls}--scroll-x-virtual`]: { height: 0 },
        [`${componentCls}--scroll-y-virtual`]: { width: 0 },

        [`${componentCls}--scroll-x-virtual, ${componentCls}--scroll-y-virtual`]:
          {
            visibility: 'hidden',
            position: 'relative',
            flexShrink: 0,
            zIndex: 7,
          },

        [`${componentCls}--scroll-x-handle,
          ${componentCls}--scroll-y-handle,
          ${componentCls}--scroll-x-wrapper,
          ${componentCls}--scroll-y-wrapper,
          ${componentCls}--scroll-y-top-corner,
          ${componentCls}--scroll-y-bottom-corner,
          ${componentCls}--scroll-x-left-corner,
          ${componentCls}--scroll-x-right-corner`]: {
          position: 'absolute',
        },

        [`${componentCls}--scroll-x-handle, ${componentCls}--scroll-x-wrapper`]:
          {
            width: '100%',
            left: 0,
            bottom: 0,
          },

        [`${componentCls}--scroll-x-wrapper`]: { height: '100%' },

        [`${componentCls}--scroll-x-handle`]: {
          overflowY: 'hidden',
          overflowX: 'scroll',
          height: scrollbarHeight,
        },

        [`${componentCls}--scroll-y-handle, ${componentCls}--scroll-y-wrapper`]:
          {
            width: '100%',
            height: '100%',
            right: 0,
            top: 0,
          },

        [`${componentCls}--scroll-y-handle`]: {
          overflowY: 'scroll',
          overflowX: 'hidden',
          width: scrollbarWidth,
          height: '100%',
        },

        [`${componentCls}--scroll-x-space`]: { height: 1 },
        [`${componentCls}--scroll-y-space`]: { width: 1 },

        [`${componentCls}--scroll-x-left-corner,
          ${componentCls}--scroll-x-right-corner,
          ${componentCls}--scroll-y-top-corner,
          ${componentCls}--scroll-y-bottom-corner`]: {
          display: 'none',
          position: 'absolute',
        },

        [`${componentCls}--scroll-x-left-corner, ${componentCls}--scroll-x-right-corner`]:
          {
            bottom: 0,
            width: 0,
            height: '100%',

            [`&::before`]: {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: `calc(100% + ${borderWidth})`,
              height: '100%',
              zIndex: 1,
              borderWidth,
              borderStyle: 'solid',
              borderColor,
            },
          },

        [`${componentCls}--scroll-x-left-corner`]: { left: 0 },
        [`${componentCls}--scroll-x-right-corner`]: { right: 0 },

        [`&.sy-pos--right`]: {
          [`${componentCls}--scroll-y-top-corner, ${componentCls}--scroll-y-bottom-corner`]:
            {
              right: 0,
              width: `calc(100% + ${borderWidth})`,
            },

          // SCSS 原文把同一个选择器写了两遍，这里合并成一条
          [`${componentCls}--scroll-x-right-corner`]: {
            [`&::before`]: {
              left: `calc(${borderWidth} * -1)`,
              borderRight: 0,
            },
          },
        },

        [`&.sy-pos--left`]: {
          [`${componentCls}--scroll-y-top-corner, ${componentCls}--scroll-y-bottom-corner`]:
            {
              left: 0,
              width: `calc(100% + ${borderWidth})`,
            },

          [`${componentCls}--scroll-x-left-corner`]: {
            [`&::before`]: {
              top: `calc(${borderWidth} * -1)`,
              height: `calc(100% + ${borderWidth})`,
            },
          },
        },

        [`&.sx-pos--bottom`]: {
          [`${componentCls}--scroll-x-right-corner`]: {
            bottom: borderWidth,

            [`&::before`]: { borderBottom: 0 },
          },
        },

        [`${componentCls}--scroll-y-top-corner`]: {
          backgroundColor: headerBackgroundColor,
        },

        [`${componentCls}--scroll-y-top-corner, ${componentCls}--scroll-y-bottom-corner`]:
          {
            top: 0,
            height: 0,
          },

        [`${componentCls}--scroll-y-bottom-corner`]: {
          marginTop: `calc(${borderWidth} * -1)`,
        },
      },
      [`${componentCls}--render-default`]: {
        [`&.border--default, &.border--full, &.border--outer, &.border--inner`]:
          {
            [`&.sy-pos--right`]: {
              [`${componentCls}--scroll-y-top-corner`]: {
                backgroundImage: `linear-gradient(${borderColor}, ${borderColor}), linear-gradient(${borderColor}, ${borderColor})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${borderWidth} 100%, 100% ${borderWidth}`,
                backgroundPosition: 'left top, left bottom',
              },

              [`${componentCls}--scroll-y-bottom-corner`]: {
                backgroundImage: `linear-gradient(${borderColor}, ${borderColor}), linear-gradient(${borderColor}, ${borderColor})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${borderWidth} 100%, 100% ${borderWidth}`,
                backgroundPosition: 'left top, left top',
              },
            },

            [`&.sy-pos--left`]: {
              [`${componentCls}--scroll-y-top-corner`]: {
                backgroundImage: `linear-gradient(${borderColor}, ${borderColor}), linear-gradient(${borderColor}, ${borderColor})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${borderWidth} 100%, 100% ${borderWidth}`,
                backgroundPosition: 'right top, left bottom',
              },

              [`${componentCls}--scroll-y-bottom-corner`]: {
                backgroundImage: `linear-gradient(${borderColor}, ${borderColor}), linear-gradient(${borderColor}, ${borderColor})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${borderWidth} 100%, 100% ${borderWidth}`,
                backgroundPosition: 'right top, left top',
              },
            },

            [`${componentCls}--scroll-x-handle-appearance`]: {
              position: 'absolute',
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
              pointerEvents: 'none',
            },

            [`&.sx-pos--top`]: {
              [`${componentCls}--scroll-x-handle-appearance`]: {
                top: 0,
                borderBottom: `${borderWidth} solid ${borderColor}`,
              },
            },

            [`&.sx-pos--bottom`]: {
              [`${componentCls}--scroll-x-handle-appearance`]: {
                bottom: 0,
                height: `calc(100% + ${borderWidth})`,
                borderTop: `${borderWidth} solid ${borderColor}`,
              },
            },
          },

        [`&.border--default, &.border--full`]: {
          [`${componentCls}--scroll-y-handle-appearance`]: {
            position: 'absolute',
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none',
          },

          [`&.sy-pos--left`]: {
            [`${componentCls}--scroll-y-handle-appearance`]: {
              left: 0,
              borderRight: `${borderWidth} solid ${borderColor}`,
            },
          },

          [`&.sy-pos--right`]: {
            [`${componentCls}--scroll-y-handle-appearance`]: {
              right: 0,
              width: `calc(100% + ${borderWidth})`,
              borderLeft: `${borderWidth} solid ${borderColor}`,
            },
          },
        },
      },
    },
  ];
}
