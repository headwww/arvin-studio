import type { CSSProperties } from 'vue';

import type {
  ActionType,
  AlignType,
  ArrowType,
  TriggerProps,
  TriggerRef,
} from '../trigger';
import type { VueNode } from '../util';

import { computed, createVNode, defineComponent, ref } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { Trigger } from '../trigger';
import { filterEmpty } from '../util';
import useId from '../util/hooks/useId';
import placements from './placements';
import Popup from './Popup';

export type SemanticName = 'arrow' | 'container' | 'root' | 'uniqueContainer';

export interface TooltipProps extends Pick<
  TriggerProps,
  | 'builtinPlacements'
  | 'disabled'
  | 'forceRender'
  | 'fresh'
  | 'mouseEnterDelay'
  | 'mouseLeaveDelay'
  | 'onPopupAlign'
  | 'popupVisible'
  | 'prefixCls'
> {
  afterVisibleChange?: (visible: boolean) => void;
  align?: AlignType;

  arrowContent?: VueNode;

  // Style
  classNames?: Partial<Record<SemanticName, string>>;
  defaultVisible?: boolean;
  destroyOnHidden?: boolean;
  getTooltipContainer?: (node: HTMLElement) => HTMLElement;

  id?: string;
  /** Config popup motion */
  motion?: TriggerProps['popupMotion'];
  onVisibleChange?: (visible: boolean) => void;

  overlay: (() => VueNode) | VueNode;
  placement?: string;
  showArrow?: ArrowType | boolean;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  // Rest
  trigger?: ActionType | ActionType[];
  /**
   * Configures Tooltip to reuse the background for transition usage.
   * This is an experimental API and may not be stable.
   */
  unique?: TriggerProps['unique'];

  visible?: boolean;

  zIndex?: number;
}

export interface TooltipRef extends TriggerRef {}

const defaults = {
  mouseEnterDelay: 0,
  mouseLeaveDelay: 0.1,
  prefixCls: 'headless-tooltip',
  trigger: ['hover'],
  placement: 'right',
  align: {},
  showArrow: true,
  visible: undefined,
  defaultVisible: undefined,
  forceRender: undefined,
  fresh: undefined,
} as any;
const Tooltip = defineComponent<TooltipProps>(
  (props = defaults, { slots, expose }) => {
    const mergedId = useId(props.id);
    const triggerRef = ref<TriggerRef>();

    // ========================= Arrow ==========================
    // Process arrow configuration
    const mergedArrow = computed(() => {
      const showArrow = props.showArrow;
      const classNames = props.classNames;
      const styles = props.styles || {};
      const arrowContent = props.arrowContent;
      if (!showArrow) {
        return false;
      }
      // Convert true to object for unified processing
      const arrowConfig = showArrow === true ? {} : showArrow;
      // Apply semantic styles with unified logic
      return {
        ...arrowConfig,
        className: clsx(arrowConfig.className, classNames?.arrow),
        style: { ...arrowConfig.style, ...styles?.arrow },
        content: arrowConfig.content ?? arrowContent,
      };
    });
    expose({
      nativeElement: computed(() => triggerRef.value?.nativeElement),
      popupElement: computed(() => triggerRef.value?.popupElement),
      forceAlign: () => {
        triggerRef.value?.forceAlign();
      },
    });
    return () => {
      const {
        trigger = ['hover'],
        mouseEnterDelay = 0,
        mouseLeaveDelay = 0.1,
        prefixCls = 'vc-tooltip',
        onVisibleChange,
        afterVisibleChange,
        motion,
        placement = 'right',
        align = {},
        destroyOnHidden = false,
        defaultVisible,
        getTooltipContainer,
        // oxlint-disable-next-line no-unused-vars
        arrowContent,
        overlay,
        // oxlint-disable-next-line no-unused-vars
        id,
        // oxlint-disable-next-line no-unused-vars
        showArrow = true,
        classNames,
        styles,
        builtinPlacements,
        ...restProps
      } = props;
      const mergedPlacements = builtinPlacements ?? placements;
      const getChildren = ({ open }: any) => {
        const children = filterEmpty(slots?.default?.({ open }));
        const child = children?.[0];
        const ariaProps = {
          'aria-describedby': overlay && open ? mergedId : undefined,
        };
        return createVNode(child, ariaProps);
      };
      const extraProps: Partial<TooltipProps & TriggerProps> = { ...restProps };
      if ('visible' in props) {
        extraProps.popupVisible = props.visible;
      }
      // ========================= Render =========================
      return (
        <Trigger
          {...extraProps}
          action={trigger}
          afterOpenChange={afterVisibleChange}
          arrow={mergedArrow.value!}
          autoDestroy={destroyOnHidden}
          builtinPlacements={mergedPlacements}
          defaultPopupVisible={defaultVisible}
          getPopupContainer={getTooltipContainer}
          mouseEnterDelay={mouseEnterDelay}
          mouseLeaveDelay={mouseLeaveDelay}
          onOpenChange={onVisibleChange}
          popup={
            <Popup
              classNames={classNames}
              id={mergedId}
              key="content"
              prefixCls={prefixCls}
              styles={styles}
            >
              {typeof overlay === 'function' ? (overlay as any)?.() : overlay}
            </Popup>
          }
          popupAlign={align}
          popupClassName={classNames?.root}
          popupMotion={motion}
          popupPlacement={placement}
          popupStyle={styles?.root}
          prefixCls={prefixCls}
          ref={triggerRef}
          uniqueContainerClassName={classNames?.uniqueContainer}
          uniqueContainerStyle={styles?.uniqueContainer}
          v-slots={getChildren}
        />
      );
    };
  },
  {
    name: 'Tooltip',
  },
);

export default Tooltip;
