import type { CSSProperties, PropType, SlotsType } from 'vue';

import type { OnStartMove } from '../interface';

import { defineComponent, ref, shallowRef } from 'vue';

import { getIndex } from '../util';
import Handle from './Handle';

export interface RenderProps {
  dragging: boolean;
  draggingDelete: boolean;
  index: null | number;
  node: any;
  prefixCls: string;
  value: number;
}
export interface HandlesRef {
  focus: (index: number) => void;
  hideHelp: VoidFunction;
}

export default defineComponent({
  name: 'Handles',
  props: {
    prefixCls: { type: String, required: true },
    values: { type: Array, required: true },
    handleStyle: {
      type: [Object, Array] as PropType<CSSProperties | CSSProperties[]>,
    },
    onStartMove: { type: Function as PropType<OnStartMove>, required: true },
    onOffsetChange: {
      type: Function as PropType<
        (value: 'max' | 'min' | number, valueIndex: number) => void
      >,
      required: true,
    },
    onFocus: { type: Function as PropType<(e: FocusEvent) => void> },
    onBlur: { type: Function as PropType<(e: FocusEvent) => void> },
    onDelete: {
      type: Function as PropType<(index: number) => void>,
      required: true,
    },
    handleRender: { type: Function as PropType<(props: RenderProps) => any> },
    activeHandleRender: {
      type: Function as PropType<(props: RenderProps) => any>,
    },
    draggingIndex: { type: Number, default: -1 },
    draggingDelete: { type: Boolean, default: false },
    onChangeComplete: Function as PropType<() => void>,
  },
  emits: ['focus'],
  slots: Object as SlotsType<{
    activeHandleRender: any;
    handleRender: any;
  }>,
  setup(props, { emit, expose }) {
    const handleRefs = shallowRef<Record<number, any>>({});

    // =========================== Active ===========================
    const activeVisible = ref(false);
    const activeIndex = ref(-1);

    const onActive = (index: number) => {
      activeIndex.value = index;
      activeVisible.value = true;
    };

    const onHandleFocus = (e: FocusEvent, index: number) => {
      onActive(index);
      emit('focus', e);
    };

    const onHandleMouseEnter = (_e: MouseEvent, index: number) => {
      onActive(index);
    };

    const setHandleRef = (
      index: number,
      node: InstanceType<typeof Handle> | null,
    ) => {
      if (node) {
        handleRefs.value[index] = node;
      } else {
        delete handleRefs.value[index];
      }
    };

    expose({
      focus: (index: number) => {
        handleRefs.value[index]?.focus?.();
      },
      hideHelp: () => {
        activeVisible.value = false;
      },
    });

    return () => {
      const {
        prefixCls,
        onStartMove,
        onOffsetChange,
        values,
        handleRender,
        activeHandleRender,
        draggingIndex,
        draggingDelete,
        // oxlint-disable-next-line no-unused-vars
        onFocus,
        onBlur,
        handleStyle,
        ...restProps
      } = props;

      // =========================== Render ===========================
      // Handle Props
      const handleProps = {
        prefixCls,
        onStartMove,
        onOffsetChange,
        render: handleRender,
        onFocus: onHandleFocus,
        onMouseenter: onHandleMouseEnter,
        onBlur,
        ...restProps,
      };
      return (
        <>
          {values?.map((value: unknown, index: number) => {
            const dragging = draggingIndex === index;
            return (
              <Handle
                dragging={dragging}
                draggingDelete={dragging && draggingDelete}
                key={index}
                ref={(node: any) => setHandleRef(index, node)}
                style={getIndex(handleStyle, index)}
                value={value as number}
                valueIndex={index}
                {...handleProps}
              />
            );
          })}

          {/* Used for render tooltip, this is not a real handle */}
          {activeHandleRender && activeVisible.value && (
            <Handle
              key="a11y"
              {...handleProps}
              aria-hidden
              dragging={draggingIndex !== -1}
              draggingDelete={draggingDelete}
              render={activeHandleRender}
              style={{ pointerEvents: 'none' }}
              value={values[activeIndex.value] as number}
              valueIndex={null}
            />
          )}
        </>
      );
    };
  },
});
