import type { App, CSSProperties } from 'vue';

import type {
  Orientation,
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context.ts';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import {
  pureAttrs,
  useMergeSemantic,
  useOrientation,
  useToArr,
} from '../_util/hooks';
import { toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import useStyle from './style';

export type TitlePlacement = 'center' | 'end' | 'left' | 'right' | 'start';

const titlePlacementList = new Set(['center', 'end', 'left', 'right', 'start']);

export type DividerSemanticName = keyof DividerSemanticClassNames &
  keyof DividerSemanticStyles;

export interface DividerSemanticClassNames {
  content?: string;
  rail?: string;
  root?: string;
}

export interface DividerSemanticStyles {
  content?: CSSProperties;
  rail?: CSSProperties;
  root?: CSSProperties;
}

export type DividerClassNamesType = SemanticClassNamesType<
  DividerProps,
  DividerSemanticClassNames
>;

export type DividerStylesType = SemanticStylesType<
  DividerProps,
  DividerSemanticStyles
>;

export interface DividerProps extends ComponentBaseProps {
  classes?: DividerClassNamesType;
  dashed?: boolean;
  /**
   * @default center
   */
  orientation?: Orientation;
  plain?: boolean;
  size?: SizeType;
  styles?: DividerStylesType;
  titlePlacement?: TitlePlacement;
  variant?: 'dashed' | 'dotted' | 'solid';
  vertical?: boolean;
}

const defaultProps = {
  orientation: 'center',
  variant: 'solid',
} as any;
const Divider = defineComponent<DividerProps>(
  (props = defaultProps, { slots, attrs }) => {
    const {
      class: contextClassName,
      classes: contextClassNames,
      styles: contextStyles,
      direction,
      prefixCls,
    } = useComponentBaseConfig('divider', props);
    const { vertical, orientation, classes, styles, size } = toPropsRefs(
      props,
      'orientation',
      'vertical',
      'classes',
      'styles',
      'size',
    );
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const sizeFullName = useSize(size);
    const validTitlePlacement = computed(() =>
      titlePlacementList.has(orientation.value || ''),
    );
    const mergedTitlePlacement = computed<'center' | 'end' | 'start'>(() => {
      const placement =
        props?.titlePlacement ??
        (validTitlePlacement.value
          ? (orientation.value as TitlePlacement)
          : 'center');
      if (placement === 'left') {
        return direction.value === 'rtl' ? 'end' : 'start';
      }
      if (placement === 'right') {
        return direction.value === 'rtl' ? 'start' : 'end';
      }
      return placement;
    });

    const [mergedOrientation, mergedVertical] = useOrientation(
      orientation,
      vertical,
    );

    // ========================= Semantic =========================
    const mergedProps = computed(() => {
      return {
        ...props,
        orientation: mergedOrientation.value,
        titlePlacement: mergedTitlePlacement.value,
        size: sizeFullName.value,
      };
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      DividerClassNamesType,
      DividerStylesType,
      DividerProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      computed(() => {
        return {
          props: mergedProps.value,
        };
      }),
    );

    return () => {
      const { variant, dashed, plain, rootClass } = props;
      const children = filterEmpty(slots?.default?.());
      const hasChildren = children.length > 0;
      const railCls = `${prefixCls.value}-rail`;
      const classString = clsx(
        prefixCls.value,
        contextClassName?.value,
        hashId.value,
        cssVarCls.value,
        `${prefixCls.value}-${mergedOrientation.value}`,
        {
          [`${prefixCls.value}-with-text`]: hasChildren,
          [`${prefixCls.value}-with-text-${mergedTitlePlacement.value}`]:
            hasChildren,
          [`${prefixCls.value}-dashed`]: !!dashed,
          [`${prefixCls.value}-${variant}`]: variant !== 'solid',
          [`${prefixCls.value}-plain`]: !!plain,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-md`]:
            sizeFullName.value === 'medium' || sizeFullName.value === 'middle',
          [`${prefixCls.value}-sm`]: sizeFullName.value === 'small',
          [railCls]: !hasChildren,
          [mergedClassNames.value.rail as string]:
            mergedClassNames.value.rail && !hasChildren,
        },
        rootClass,
        (attrs as any).class,
        mergedClassNames.value.root,
      );

      return (
        <div
          class={classString}
          style={[
            contextStyles.value,
            mergedStyles.value.root,
            hasChildren ? {} : mergedStyles.value.rail,
            (attrs as any).style,
          ]}
          {...pureAttrs(attrs)}
          role="separator"
        >
          {hasChildren && !mergedVertical.value && (
            <>
              <div
                class={clsx(
                  railCls,
                  `${railCls}-start`,
                  mergedClassNames.value.rail,
                )}
                style={mergedStyles.value.rail}
              />
              <span
                class={clsx(
                  `${prefixCls.value}-inner-text`,
                  mergedClassNames.value.content,
                )}
                style={mergedStyles.value.content}
              >
                {children}
              </span>

              <div
                class={clsx(
                  railCls,
                  `${railCls}-end`,
                  mergedClassNames.value.rail,
                )}
                style={mergedStyles.value.rail}
              />
            </>
          )}
        </div>
      );
    };
  },
  {
    name: 'AsDivider',
    inheritAttrs: false,
  },
);
(Divider as any).install = (app: App) => {
  app.component(Divider.name, Divider);
};

export default Divider;
