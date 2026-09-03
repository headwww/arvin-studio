import type { App, CSSProperties, SlotsType, VNode } from 'vue';

import type { VueNode } from '../_util';
import type { BorderBeamColor } from './util';

import {
  cloneVNode,
  computed,
  defineComponent,
  isVNode,
  shallowRef,
  Teleport,
} from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { unrefElement } from '@vueuse/core';

import isNonNullable from '../_util/isNonNullable';
import { useComponentBaseConfig } from '../config-provider/context';
import { genCssVar } from '../theme/util/genStyleUtils';
import useBorderSize from './hooks/useBorderSize';
import useStyle from './style';
import { getBorderBeamGradient } from './util';

export type { BorderBeamColor, BorderBeamGradient } from './util';

export interface BorderBeamProps {
  color?: BorderBeamColor;
  outset?: number | string;
  prefixCls?: string;
  rootClass?: string;
}

export interface BorderBeamSlots {
  default?: () => any;
}

function getInset(width: number | string): string {
  return typeof width === 'string' ? `calc(-1 * ${width})` : `-${width}px`;
}

const BorderBeam = defineComponent<
  BorderBeamProps,
  Record<string, never>,
  string,
  SlotsType<BorderBeamSlots>
>(
  (props, { attrs, slots }) => {
    const {
      class: contextClassName,
      style: contextStyle,
      getPrefixCls,
      rootPrefixCls,
    } = useComponentBaseConfig('borderBeam', props);

    const prefixCls = computed(() =>
      getPrefixCls('border-beam', props.prefixCls),
    );
    const rootCls = computed(() => rootPrefixCls.value ?? getPrefixCls());
    const [hashId, cssVarCls] = useStyle(prefixCls);

    const varName = computed(() => genCssVar(rootCls.value, 'border-beam')[0]);

    const hostDom = shallowRef<HTMLElement | null>(null);
    const borderInfo = useBorderSize(hostDom);
    const beamGradient = computed(() => getBorderBeamGradient(props.color));

    const insetOffset = computed<string>(() => {
      const { outset } = props;
      if (isNonNullable(outset)) {
        return getInset(outset);
      }
      return borderInfo.value.borderWidth.map(getInset).join(' ');
    });

    const setHostDom = (el: unknown) => {
      hostDom.value = (unrefElement(el as any) as HTMLElement | null) ?? null;
    };

    return () => {
      const children = filterEmpty(slots.default?.() ?? []);
      const beamStyle: CSSProperties & Record<`--${string}`, string> = {
        ...contextStyle?.value,
        ...(attrs as any).style,
        ...(beamGradient.value && {
          [varName.value('beam-gradient')]: beamGradient.value,
        }),
        [varName.value('inset-offset')]: insetOffset.value,
        [varName.value('border-radius')]: borderInfo.value.borderRadius,
      };

      const beamNode: VueNode = hostDom.value ? (
        <Teleport to={hostDom.value}>
          <div
            aria-hidden="true"
            class={clsx(
              prefixCls.value,
              contextClassName?.value,
              props.rootClass,
              (attrs as any).class,
              hashId.value,
              cssVarCls.value,
            )}
            style={beamStyle}
          />
        </Teleport>
      ) : null;

      const renderChild = () => {
        if (children.length !== 1 || !isVNode(children[0])) {
          return children;
        }
        const child = children[0] as VNode;
        return cloneVNode(child, { ref: setHostDom }, true);
      };

      return (
        <>
          {renderChild()}
          {beamNode}
        </>
      );
    };
  },
  {
    name: 'AsBorderBeam',
    inheritAttrs: false,
  },
);

export default BorderBeam;

(BorderBeam as any).install = (app: App) => {
  app.component(BorderBeam.name, BorderBeam);
};
