import type { App, CSSProperties, Ref } from 'vue';

import type { Breakpoint, ScreenMap } from '../_util/responsiveObserver';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { responsiveArray } from '../_util/responsiveObserver';
import { useConfig } from '../config-provider/context';
import { useBreakpoint } from './hooks/useBreakpoint';
import useGutter from './hooks/useGutter';
import { useRowContextProvider } from './RowContext';
import { useRowStyle } from './style';

const _RowAligns = ['top', 'middle', 'bottom', 'stretch'] as const;
const _RowJustify = [
  'start',
  'end',
  'center',
  'space-around',
  'space-between',
  'space-evenly',
] as const;

type ResponsiveLike<T> = {
  [key in Breakpoint]?: T;
};

export type Gutter = number | Partial<Record<Breakpoint, number>> | undefined;

type ResponsiveAligns = ResponsiveLike<(typeof _RowAligns)[number]>;
type ResponsiveJustify = ResponsiveLike<(typeof _RowJustify)[number]>;
export interface RowProps {
  align?: (typeof _RowAligns)[number] | ResponsiveAligns;
  gutter?: [Gutter, Gutter] | Gutter;
  justify?: (typeof _RowJustify)[number] | ResponsiveJustify;
  prefixCls?: string;
  wrap?: boolean;
}

function useMergedPropByScreen(
  oriProp: Ref<RowProps['align'] | RowProps['justify']>,
  screen: Ref<null | ScreenMap>,
) {
  const prop = shallowRef(
    typeof oriProp.value === 'string' ? oriProp.value : '',
  );
  const calcMergedAlignOrJustify = () => {
    if (typeof oriProp.value === 'string') {
      prop.value = oriProp.value;
    }
    if (typeof oriProp.value !== 'object') {
      return;
    }
    for (const element of responsiveArray) {
      const breakpoint: Breakpoint = element!;
      // if do not match, do nothing
      if (!screen.value || !screen.value[breakpoint]) {
        continue;
      }
      const curVal = oriProp.value[breakpoint];
      if (curVal !== undefined) {
        prop.value = curVal;
        return;
      }
    }
  };
  watch(
    [() => JSON.stringify(oriProp.value), screen],
    () => {
      calcMergedAlignOrJustify();
    },
    {
      immediate: true,
    },
  );
  return prop;
}
const defaults = {
  gutter: 0,
} as any;

const Row = defineComponent<RowProps>(
  (props = defaults, { attrs, slots }) => {
    const configCtx = useConfig();
    const screens = useBreakpoint(true, null);

    const mergedAlign = useMergedPropByScreen(
      computed(() => props.align),
      screens,
    );
    const mergedJustify = useMergedPropByScreen(
      computed(() => props.justify),
      screens,
    );
    const prefixCls = computed(() =>
      configCtx.value?.getPrefixCls('row', props.prefixCls),
    );
    const [hashId, cssVarCls] = useRowStyle(prefixCls);

    const gutters = useGutter(
      computed(() => props.gutter),
      screens,
    );

    useRowContextProvider({
      gutter: gutters as Ref<[number, number]>,
      wrap: computed(() => props.wrap),
    });

    return () => {
      const { wrap } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const classes = clsx(
        prefixCls.value,
        {
          [`${prefixCls.value}-no-wrap`]: wrap === false,
          [`${prefixCls.value}-${mergedJustify.value}`]: mergedJustify.value,
          [`${prefixCls.value}-${mergedAlign.value}`]: mergedAlign.value,
          [`${prefixCls.value}-rtl`]: configCtx.value.direction === 'rtl',
        },
        hashId.value,
        cssVarCls.value,
        className,
      );

      // Add gutter related style
      const rowStyle: CSSProperties = {};
      const horizontalGutter =
        gutters.value[0] !== null && gutters.value[0]! > 0
          ? gutters.value[0]! / -2
          : undefined;
      if (horizontalGutter) {
        rowStyle.marginLeft = `${horizontalGutter}px`;
        rowStyle.marginRight = `${horizontalGutter}px`;
      }
      // "gutters" is a new array in each rendering phase, it'll make 'React.useMemo' effectless.
      // So we deconstruct "gutters" variable here.
      const [_, gutterV] = gutters.value;
      if (gutterV) {
        rowStyle.rowGap = `${gutterV}px`;
      }

      return (
        <div {...restAttrs} class={classes} style={[rowStyle, style]}>
          {slots?.default?.()}
        </div>
      );
    };
  },
  {
    name: 'AsRow',
    inheritAttrs: false,
  },
);
(Row as any).install = (app: App) => {
  app.component(Row.name, Row);
};

export default Row;
