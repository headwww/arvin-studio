import type { CSSProperties } from 'vue';

import type { VueNode } from '../util';

import { computed, defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { toPropsRefs } from '../util';
import { useStepsProvider } from './Context';
import Step from './Step';

export type Status = 'error' | 'finish' | 'process' | 'wait';

const EmptyObject: Record<string, any> = {};

export type SemanticName =
  | 'item'
  | 'itemContent'
  | 'itemHeader'
  | 'itemIcon'
  | 'itemRail'
  | 'itemSection'
  | 'itemSubtitle'
  | 'itemTitle'
  | 'itemWrapper'
  | 'root';

export type ItemSemanticName =
  | 'content'
  | 'header'
  | 'icon'
  | 'rail'
  | 'root'
  | 'section'
  | 'subtitle'
  | 'title'
  | 'wrapper';

export type ComponentType = any | string;

export interface StepItem {
  class?: string;
  classNames?: Partial<Record<ItemSemanticName, string>>;
  content?: VueNode;
  /** @deprecated Please use `content` instead. */
  description?: VueNode;
  disabled?: boolean;
  icon?: VueNode;
  onClick?: (e: MouseEvent) => void;
  status?: Status;
  style?: CSSProperties;
  styles?: Partial<Record<ItemSemanticName, CSSProperties>>;
  subTitle?: VueNode;
  title?: VueNode;
}

export type StepIconRender = (info: {
  content: VueNode;
  // @deprecated Please use `content` instead.
  description: VueNode;
  index: number;
  node: VueNode;
  status: Status;
  title: VueNode;
}) => VueNode;

export interface RenderInfo {
  active: boolean;
  index: number;
  item: StepItem;
}

export interface StepsProps {
  className?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  // a11y
  /** Internal usage of antd. Do not deps on this. */
  components?: {
    item?: ComponentType;
    root?: ComponentType;
  };
  current?: number;
  // render
  iconRender?: (
    originNode: any,
    info: RenderInfo & {
      components: {
        Icon: any;
      };
    },
  ) => any;
  initial?: number;

  itemRender?: (originNode: any, info: RenderInfo) => any;
  items?: StepItem[];

  itemWrapperRender?: (originNode: any) => any;

  onChange?: (current: number) => void;
  // layout
  orientation?: 'horizontal' | 'vertical';
  // style
  prefixCls?: string;
  rootClassName?: string;
  // data
  status?: Status;

  style?: CSSProperties;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  titlePlacement?: 'horizontal' | 'vertical';
}

const defaults = {
  prefixCls: 'vc-steps',
  status: 'process',
  current: 0,
  initial: 0,
} as any;

const Steps = defineComponent<StepsProps>(
  (props = defaults, { attrs }) => {
    const {
      orientation,
      titlePlacement,
      items,
      initial,
      current,
      status,
      components,
      prefixCls,
    } = toPropsRefs(
      props,
      'orientation',
      'titlePlacement',
      'items',
      'initial',
      'current',
      'status',
      'components',
      'prefixCls',
    );
    // ============================= layout =============================
    const isVertical = computed(() => orientation.value === 'vertical');
    const mergedOrientation = computed(() =>
      isVertical.value ? 'vertical' : 'horizontal',
    );
    const mergeTitlePlacement = computed(() =>
      !isVertical.value && titlePlacement.value === 'vertical'
        ? 'vertical'
        : 'horizontal',
    );

    // ============================== Data ==============================
    const mergedItems = computed(() => {
      return (items.value || []).filter(Boolean);
    });

    const statuses = computed(() => {
      return mergedItems.value.map((item, index) => {
        const itemStatus = item.status;
        const stepNumber = initial.value! + index;
        if (!itemStatus) {
          if (stepNumber === current.value) {
            return status.value;
          } else if (stepNumber < current.value!) {
            return 'finish';
          }
          return 'wait';
        }
        return itemStatus;
      });
    });

    // ============================= events =============================
    const onStepClick = (next: number) => {
      if (props.onChange && current.value !== next) {
        props.onChange(next);
      }
    };

    const stepIconContext = computed(() => {
      return {
        prefixCls: prefixCls.value,
        classNames: props.classNames,
        styles: props.styles,
        ItemComponent: components.value?.item ?? 'div',
      };
    });
    useStepsProvider(stepIconContext as any);

    const renderStep = (item: StepItem, index: number) => {
      const { classNames, styles, itemRender, iconRender, itemWrapperRender } =
        props;
      const stepIndex = initial.value! + index;
      const itemStatus = statuses.value[index]!;
      const nextStatus = statuses.value[index + 1]!;

      const data = {
        ...item,
        status: itemStatus,
      };

      return (
        <Step
          active={stepIndex === current.value}
          classNames={classNames ?? {}}
          // Data
          data={data}
          // Render
          iconRender={iconRender}
          index={stepIndex}
          itemRender={itemRender}
          itemWrapperRender={itemWrapperRender}
          key={stepIndex}
          last={mergedItems.value.length - 1 === index}
          nextStatus={nextStatus}
          onClick={props.onChange ? onStepClick : undefined}
          // Style
          prefixCls={prefixCls.value}
          styles={styles ?? {}}
        />
      );
    };

    return () => {
      const {
        classNames = EmptyObject,
        styles = EmptyObject,
        rootClassName,
        className,
        style,
      } = props;
      const { root: RootComponent = 'div' } = components.value ?? {};

      // ============================= styles =============================
      const classString = clsx(
        prefixCls.value,
        `${prefixCls.value}-${mergedOrientation.value}`,
        `${prefixCls.value}-title-${mergeTitlePlacement.value}`,
        rootClassName,
        className,
        classNames.root,
      );
      // ============================= render =============================

      return (
        <RootComponent
          class={classString}
          style={{
            ...style,
            ...styles?.root,
          }}
          {...attrs}
        >
          {mergedItems.value.map(renderStep)}
        </RootComponent>
      );
    };
  },
  {
    name: 'Steps',
    inheritAttrs: false,
  },
);

export default Steps;
