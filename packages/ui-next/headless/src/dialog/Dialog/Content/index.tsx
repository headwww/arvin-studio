import type { CSSProperties } from 'vue';

import type { PanelProps } from './Panel';

import { defineComponent, nextTick, shallowRef, Transition } from 'vue';

import { getTransitionProps } from '../../../util';
import { offset } from '../../util';
import Panel from './Panel';

export type ContentProps = {
  ariaId: string;
  motionName?: string;
  onVisibleChanged: (visible: boolean) => void;
} & PanelProps;

const Content = defineComponent<ContentProps>(
  (props, { slots }) => {
    const dialogRef = shallowRef<HTMLDivElement>();

    const transformOrigin = shallowRef('');

    function onPrepare() {
      const { mousePosition } = props;
      nextTick(() => {
        if (!dialogRef.value) {
          return;
        }

        const elementOffset = offset(dialogRef.value);
        transformOrigin.value =
          mousePosition && (mousePosition.x || mousePosition.y)
            ? `${mousePosition.x - elementOffset.left}px ${mousePosition.y - elementOffset.top}px`
            : '';
      });
    }
    return () => {
      const {
        prefixCls,
        className,
        style,
        visible,
        destroyOnHidden,
        onVisibleChanged,
        ariaId,
        title,
        motionName,
        forceRender,
      } = props;
      // ============================= Style ==============================
      const contentStyle: CSSProperties = {};
      if (transformOrigin.value) {
        contentStyle.transformOrigin = transformOrigin.value;
      }

      // ============================= Render =============================
      const transitionProps = getTransitionProps(motionName);
      return (
        <Transition
          {...transitionProps}
          onAfterEnter={() => onVisibleChanged?.(true)}
          onAfterLeave={() => {
            onVisibleChanged?.(false);
          }}
          onBeforeEnter={onPrepare}
        >
          {visible || !destroyOnHidden || forceRender ? (
            <Panel
              v-show={visible}
              {...props}
              ariaId={ariaId}
              class={[className]}
              holderRef={(el) => {
                dialogRef.value = el;
              }}
              prefixCls={prefixCls}
              style={{ ...style, ...contentStyle }}
              title={title}
              v-slots={slots}
            />
          ) : null}
        </Transition>
      );
    };
  },
  {
    name: 'Content',
  },
);

export default Content;
