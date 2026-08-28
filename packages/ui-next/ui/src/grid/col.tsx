import type { App, CSSProperties } from 'vue';

import type { LiteralUnion } from '@arvin-studio/headless';

import { computed, defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { responsiveArrayReversed } from '../_util/responsiveObserver';
import { useConfig } from '../config-provider/context';
import { genCssVar } from '../theme/util/genStyleUtils';
import { useRowContext } from './RowContext';
import { useColStyle } from './style';

type ColSpanType = number | string;

type FlexType = LiteralUnion<'auto' | 'none'> | number;

export interface ColSize {
  flex?: FlexType;
  offset?: ColSpanType;
  order?: ColSpanType;
  pull?: ColSpanType;
  push?: ColSpanType;
  span?: ColSpanType;
}

export interface ColProps {
  flex?: FlexType;
  lg?: ColSize | ColSpanType;
  md?: ColSize | ColSpanType;
  offset?: ColSpanType;
  order?: ColSpanType;
  prefixCls?: string;
  pull?: ColSpanType;
  push?: ColSpanType;
  sm?: ColSize | ColSpanType;
  span?: ColSpanType;
  xl?: ColSize | ColSpanType;
  xs?: ColSize | ColSpanType;
  xxl?: ColSize | ColSpanType;
  xxxl?: ColSize | ColSpanType;
}

function isNumber(value: any): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

function parseFlex(flex: FlexType): string {
  if (isNumber(flex)) {
    return `${flex} ${flex} auto`;
  }

  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(flex)) {
    return `0 0 ${flex}`;
  }

  return flex;
}

const Col = defineComponent<ColProps>(
  (props, { slots, attrs }) => {
    const configCtx = useConfig();
    const { gutter, wrap } = useRowContext();

    const prefixCls = computed(() =>
      configCtx.value?.getPrefixCls('col', props.prefixCls),
    );
    const rootPrefixCls = computed(() => configCtx.value?.getPrefixCls());
    const [varName] = genCssVar(rootPrefixCls.value, 'col');

    const [hashId, cssVarCls] = useColStyle(prefixCls);

    return () => {
      const { span, order, offset, push, pull, flex } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);

      // ===================== Size ======================
      const sizeStyle: Record<string, string> = {};

      let sizeClassObj: Record<string, boolean | ColSpanType> = {};
      responsiveArrayReversed.forEach((size) => {
        let sizeProps: ColSize = {};
        const propSize = props[size];
        if (typeof propSize === 'number') {
          sizeProps.span = propSize;
        } else if (typeof propSize === 'object') {
          sizeProps = propSize || {};
        }

        // delete others[size];

        sizeClassObj = {
          ...sizeClassObj,
          [`${prefixCls.value}-${size}-${sizeProps.span}`]:
            sizeProps.span !== undefined,
          [`${prefixCls.value}-${size}-order-${sizeProps.order}`]:
            sizeProps.order || sizeProps.order === 0,
          [`${prefixCls.value}-${size}-offset-${sizeProps.offset}`]:
            sizeProps.offset || sizeProps.offset === 0,
          [`${prefixCls.value}-${size}-push-${sizeProps.push}`]:
            sizeProps.push || sizeProps.push === 0,
          [`${prefixCls.value}-${size}-pull-${sizeProps.pull}`]:
            sizeProps.pull || sizeProps.pull === 0,
          [`${prefixCls.value}-rtl`]: configCtx.value.direction === 'rtl',
        };

        // Responsive flex layout
        if (sizeProps.flex || sizeProps.flex === 0) {
          sizeClassObj[`${prefixCls.value}-${size}-flex`] = true;
          sizeStyle[varName(`${size}-flex`)] = parseFlex(sizeProps.flex);
        }
      });

      // ==================== Normal =====================
      const classes = clsx(
        prefixCls.value,
        {
          [`${prefixCls.value}-${span}`]: span !== undefined,
          [`${prefixCls.value}-order-${order}`]: order,
          [`${prefixCls.value}-offset-${offset}`]: offset,
          [`${prefixCls.value}-push-${push}`]: push,
          [`${prefixCls.value}-pull-${pull}`]: pull,
        },
        sizeClassObj,
        hashId.value,
        cssVarCls.value,
        className,
      );
      const mergedStyle: CSSProperties = {};

      // Horizontal gutter use padding
      if (gutter?.value && gutter.value[0] > 0) {
        const horizontalGutter = gutter.value[0] / 2;
        mergedStyle.paddingLeft = `${horizontalGutter}px`;
        mergedStyle.paddingRight = `${horizontalGutter}px`;
      }
      if (flex || flex === 0) {
        mergedStyle.flex = parseFlex(flex);
        // Hack for Firefox to avoid size issue
        // https://github.com/ant-design/ant-design/pull/20023#issuecomment-564389553
        if (wrap?.value === false && !mergedStyle.minWidth) {
          mergedStyle.minWidth = 0;
        }
      }

      // ==================== Render =====================

      return (
        <div
          {...restAttrs}
          class={classes}
          style={[mergedStyle, style, sizeStyle]}
        >
          {slots.default?.()}
        </div>
      );
    };
  },
  {
    name: 'AsCol',
    inheritAttrs: false,
  },
);
(Col as any).install = (app: App) => {
  app.component(Col.name, Col);
};
export default Col;
