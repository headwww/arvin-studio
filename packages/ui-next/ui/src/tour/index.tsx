import type { App, SlotsType } from 'vue';

import type { TourProps as VcTourProps } from '@arvin-studio/headless';

import type {
  TourProps as BaseTourProps,
  TourClassNamesType,
  TourEmits,
  TourSlots,
  TourStepProps,
  TourStylesType,
} from './interface';

import { computed, defineComponent } from 'vue';

import { filterEmpty, Tour as VcTour } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import {
  pureAttrs,
  useMergeSemantic,
  useToArr,
  useToProps,
  useZIndex,
} from '../_util/hooks';
import getPlacements from '../_util/placements';
import { toPropsRefs } from '../_util/tools';
import { checkRenderNode } from '../_util/vueNode';
import { ZIndexProvider } from '../_util/zindexContext';
import { useComponentBaseConfig } from '../config-provider/context';
import { useToken } from '../theme/internal';
import TourPanel from './panelRender';
import PurePanel from './PurePanel';
import useStyle from './style';

export interface InternalTourProps
  extends
    BaseTourProps,
    /* @vue-ignore */
    TourEmitsProps {}

export interface TourEmitsProps {
  onChange?: TourEmits['change'];
  onClose?: TourEmits['close'];
  onFinish?: TourEmits['finish'];
  onPopupAlign?: TourEmits['popupAlign'];
  'onUpdate:current'?: TourEmits['update:current'];
  'onUpdate:open'?: TourEmits['update:open'];
}

const Tour = defineComponent<
  InternalTourProps,
  TourEmits,
  string,
  SlotsType<TourSlots>
>(
  (props, { slots, emit, attrs }) => {
    const {
      prefixCls,
      direction,
      closeIcon: contextCloseIcon,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('tour', props, ['closeIcon']);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');

    const [hashId, cssVarCls] = useStyle(prefixCls);
    const [, token] = useToken();
    const mergedSteps = computed(() => {
      return (props?.steps ?? []).map((step, index) => {
        const _cover = filterEmpty(
          slots?.coverRender?.({ step, index }),
        ).filter(Boolean);
        const _title = filterEmpty(
          slots?.titleRender?.({ step, index }),
        ).filter(Boolean);
        const _description = filterEmpty(
          slots?.descriptionRender?.({ step, index }),
        ).filter(Boolean);

        return {
          ...step,
          cover: step?.cover ?? checkRenderNode(_cover),
          title: step?.title ?? checkRenderNode(_title),
          description: step?.description ?? checkRenderNode(_description),
          class: clsx(step.class, {
            [`${prefixCls.value}-primary`]:
              (step.type ?? props.type) === 'primary',
          }),
        };
      });
    });
    const vcSteps = computed<VcTourProps['steps']>(() => {
      return mergedSteps.value.map((step) => {
        const { class: stepClass, ...restStep } = step ?? {};
        return {
          ...restStep,
          className: stepClass,
        } as any;
      });
    });

    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => {
      return {
        ...props,
        steps: mergedSteps.value,
      } as BaseTourProps;
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TourClassNamesType,
      TourStylesType,
      BaseTourProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    const builtinPlacements: BaseTourProps['builtinPlacements'] = (config) =>
      getPlacements({
        arrowPointAtCenter: config?.arrowPointAtCenter ?? true,
        autoAdjustOverflow: true,
        offset: token.value.marginXXS,
        arrowWidth: token.value.sizePopupArrow,
        borderRadius: token.value.borderRadius,
      });

    // ============================ zIndex ============================
    const [zIndex, contextZIndex] = useZIndex(
      'Tour',
      computed(() => props.zIndex),
    );
    return () => {
      const { rootClass, type, closeIcon } = props;
      const mergedRootClassName = clsx(
        {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        hashId.value,
        cssVarCls.value,
        rootClass,
        contextClassName.value,
        mergedClassNames.value?.root,
        (attrs as any).class,
      );

      const semanticStyles = {
        ...mergedStyles.value,
        mask: {
          ...mergedStyles.value?.root,
          ...mergedStyles.value?.mask,
          ...contextStyle.value,
          ...(attrs as any).style,
        },
      };
      const indicatorsRender =
        slots?.indicatorsRender ?? props?.indicatorsRender;
      const actionsRender = slots?.actionsRender ?? props?.actionsRender;

      const mergedRenderPanel: VcTourProps['renderPanel'] = (
        stepProps,
        stepCurrent,
      ) => {
        return (
          <TourPanel
            actionsRender={actionsRender}
            classes={mergedClassNames.value}
            current={stepCurrent}
            indicatorsRender={indicatorsRender}
            nextButtonProps={slots?.nextButton}
            prevButtonProps={slots?.prevButton}
            stepProps={
              {
                ...stepProps,
                classes:
                  (stepProps as any)?.classes ?? (stepProps as any)?.classNames,
              } as any
            }
            styles={semanticStyles}
            type={type}
          />
        );
      };
      const restProps = omit(props, [
        'prefixCls',
        'type',
        'indicatorsRender',
        'actionsRender',
        'steps',
        'closeIcon',
        'styles',
      ]);
      return (
        <ZIndexProvider value={contextZIndex.value}>
          <VcTour
            {...pureAttrs(attrs)}
            {...restProps}
            animated
            builtinPlacements={builtinPlacements}
            classNames={mergedClassNames.value}
            closeIcon={closeIcon ?? contextCloseIcon.value}
            onChange={(current: any) => {
              emit('update:current', current);
              emit('change', current);
            }}
            onClose={(current: any) => {
              emit('close', current);
              emit('update:open', false);
            }}
            onFinish={() => {
              emit('finish');
              emit('update:open', false);
            }}
            onPopupAlign={(el: any, info: any) => {
              emit('popupAlign', el, info);
            }}
            prefixCls={prefixCls.value}
            renderPanel={mergedRenderPanel}
            rootClassName={mergedRootClassName}
            steps={vcSteps.value}
            styles={semanticStyles}
            zIndex={zIndex.value}
          />
        </ZIndexProvider>
      );
    };
  },
  {
    name: 'AsTour',
    inheritAttrs: false,
  },
);

(Tour as any).install = (app: App) => {
  app.component(Tour.name, Tour);
};

export type {
  TourEmits,
  TourLocale,
  TourSemanticName,
  TourSlots,
  TourStylesType,
} from './interface';
export type TourProps = InternalTourProps;

(Tour as any)._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

export default Tour;

export type TourStepItem = TourStepProps;
