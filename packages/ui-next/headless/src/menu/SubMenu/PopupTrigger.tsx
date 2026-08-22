import type { CSSProperties } from 'vue';

import type { VueNode } from '../../util';
import type { MenuMode } from '../interface';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

import Trigger from '../../trigger';
import { raf } from '../../util';
import { useMenuContext } from '../context/MenuContext';
import placements, { placementsRtl } from '../placements';
import { getMotion } from '../utils/motionUtil';

const popupPlacementMap = {
  horizontal: 'bottomLeft',
  vertical: 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop',
};

export interface PopupTriggerProps {
  disabled: boolean;
  mode: MenuMode;
  onVisibleChange: (visible: boolean) => void;
  popup: VueNode;
  popupClassName?: string;
  popupOffset?: number[];
  popupStyle?: CSSProperties;
  prefixCls: string;
  visible: boolean;
}

const PopupTrigger = defineComponent<PopupTriggerProps>((props, { slots }) => {
  const menuContext = useMenuContext();
  const innerVisible = shallowRef(props.visible ?? false);
  const placement = computed(() => {
    const rtl = menuContext?.value?.rtl;
    const builtinPlacements = menuContext?.value?.builtinPlacements;
    return rtl
      ? { ...placementsRtl, ...builtinPlacements }
      : { ...placements, ...builtinPlacements };
  });

  const triggerMode = computed<MenuMode>(() => props.mode);
  const popupPlacement = computed(() => {
    return (popupPlacementMap as any)[triggerMode.value];
  });
  const defaultMotions = computed(() => menuContext?.value?.defaultMotions);
  const motion = computed(() => menuContext?.value?.motion);

  const targetMotion = computed(() => {
    return {
      ...getMotion(triggerMode.value, motion.value, defaultMotions.value),
    };
  });

  const targetMotionRef = shallowRef(targetMotion.value);
  watch(
    triggerMode,
    (mode) => {
      if (mode !== 'inline') {
        /**
         * PopupTrigger is only used for vertical and horizontal types.
         * When collapsed is unfolded, the inline animation will destroy the vertical animation.
         */
        targetMotionRef.value = targetMotion.value as any;
      }
    },
    {
      immediate: true,
    },
  );
  watch([motion, defaultMotions], () => {
    if (triggerMode.value !== 'inline') {
      targetMotionRef.value = targetMotion.value as any;
    }
  });

  const mergedMotion = computed(() => {
    return {
      ...targetMotionRef.value,
      appear: true,
    };
  });

  // Delay to change visible
  const visibleRef = shallowRef<number>();
  watch(
    () => props.visible,
    (visible, _, onCleanup) => {
      visibleRef.value = raf(() => {
        innerVisible.value = visible;
      });
      onCleanup(() => {
        if (visibleRef.value !== undefined) {
          raf.cancel(visibleRef.value);
        }
      });
    },
  );

  return () => {
    const {
      popupClassName,
      popup,
      popupStyle,
      popupOffset,
      disabled,
      onVisibleChange,
      prefixCls,
    } = props;
    const {
      rtl,
      rootClass,
      mode,
      getPopupContainer,
      triggerSubMenuAction,
      subMenuCloseDelay,
      subMenuOpenDelay,
      forceSubMenuRender,
    } = menuContext?.value ?? {};
    return (
      <Trigger
        action={disabled ? [] : [triggerSubMenuAction!]}
        builtinPlacements={placement.value}
        forceRender={forceSubMenuRender}
        fresh
        getPopupContainer={getPopupContainer}
        mouseEnterDelay={subMenuOpenDelay}
        mouseLeaveDelay={subMenuCloseDelay}
        onOpenChange={onVisibleChange}
        popup={popup}
        popupAlign={popupOffset && { offset: popupOffset }}
        popupClassName={clsx(
          `${prefixCls}-popup`,
          { [`${prefixCls}-rtl`]: rtl },
          popupClassName,
          rootClass,
        )}
        popupMotion={mergedMotion.value}
        popupPlacement={popupPlacement.value}
        popupStyle={popupStyle}
        popupVisible={innerVisible.value}
        prefixCls={prefixCls}
        stretch={mode === 'horizontal' ? 'minWidth' : undefined}
      >
        {slots?.default?.()}
      </Trigger>
    );
  };
});

export default PopupTrigger;
