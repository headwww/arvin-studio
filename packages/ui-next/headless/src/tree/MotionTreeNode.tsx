import type { CSSMotionProps } from '../util';
import type { FlattenNode, TreeNodeProps } from './interface';
import type { TreeNodeRequiredProps } from './utils/treeUtil';

import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  ref,
  Transition,
  watch,
} from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import { getTransitionProps } from '../util';
import { TreeContextKey } from './contextTypes';
import TreeNode from './TreeNode';
import { getTreeNodeProps } from './utils/treeUtil';

export interface MotionTreeNodeProps extends Omit<TreeNodeProps, 'domRef'> {
  active?: boolean;
  motion?: CSSMotionProps;
  motionNodes?: FlattenNode[] | null;
  motionType?: 'hide' | 'show' | null;
  onMotionEnd?: () => void;
  onMotionStart?: () => void;
  treeId?: string;
  treeNodeRequiredProps: TreeNodeRequiredProps;
}

const MotionTreeNode = defineComponent<MotionTreeNodeProps>(
  (props) => {
    const context = inject(TreeContextKey, null as any);
    const prefixCls = computed(() => context?.prefixCls);

    let hideTimer: null | ReturnType<typeof setTimeout> = null;

    const triggerMotionEndRef = ref(false);
    const visible = ref(true);

    const motionName = computed(() => props?.motion?.name);
    const targetVisible = computed(
      () => !!props.motionNodes && props.motionType !== 'hide',
    );

    const triggerMotionEnd = () => {
      if (!props.motionNodes || triggerMotionEndRef.value) {
        return;
      }

      triggerMotionEndRef.value = true;
      props.onMotionEnd?.();
    };

    const triggerMotionStart = () => {
      if (props.motionNodes) {
        props?.onMotionStart?.();
      }
    };

    onBeforeUnmount(() => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      triggerMotionEnd();
    });

    watch(
      () => props.motionNodes,
      (newMotionNodes, prevMotionNodes) => {
        if (newMotionNodes) {
          // New motion start
          if (!prevMotionNodes) {
            triggerMotionEndRef.value = false;
            triggerMotionStart();
          }

          if (targetVisible.value !== visible.value) {
            // Always ensure at least one frame rendered for leave motion
            if (targetVisible.value) {
              if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
              }
              visible.value = true;
            } else {
              visible.value = true;
              if (hideTimer) {
                clearTimeout(hideTimer);
              }
              hideTimer = setTimeout(() => {
                visible.value = false;
                hideTimer = null;
              }, 0);
            }
          }
        } else if (newMotionNodes === null) {
          if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
          }
          visible.value = true;
        }
      },
      {
        immediate: true,
        flush: 'post',
      },
    );

    const onVisibleChanged = (newVisible: boolean) => {
      if (targetVisible.value === newVisible) {
        triggerMotionEnd();
      }
    };
    return () => {
      const {
        motionNodes,
        treeNodeRequiredProps,
        active,
        motion,
        motionType,
        treeId,
      } = props;
      if (motionNodes) {
        const _motionNodes = motionNodes ?? [];
        const requiredProps = treeNodeRequiredProps;
        const treeNodeMotionProps = getTransitionProps(motionName.value, {
          ...motion,
          appear: motionType === 'show',
        });
        return (
          <Transition
            {...treeNodeMotionProps}
            onAfterEnter={() => {
              onVisibleChanged(true);
            }}
            onAfterLeave={() => {
              onVisibleChanged(false);
            }}
          >
            {visible.value && (
              <div class={clsx(`${prefixCls.value}-treenode-motion`)}>
                {_motionNodes.map((treeNode) => {
                  const {
                    data: nodeData,
                    title,
                    key,
                    isStart,
                    isEnd,
                  } = treeNode as any;

                  const restProps = { ...nodeData };
                  delete restProps.children;
                  delete restProps.key;

                  const treeNodeProps = getTreeNodeProps(key, requiredProps);

                  return (
                    <TreeNode
                      {...restProps}
                      {...treeNodeProps}
                      active={active}
                      data={nodeData}
                      isEnd={isEnd}
                      isStart={isStart}
                      key={key}
                      title={title}
                      treeId={treeId}
                    />
                  );
                })}
              </div>
            )}
          </Transition>
        );
      }

      return (
        <TreeNode
          {...omit(props, [
            'motion',
            'motionNodes',
            'motionType',
            'onMotionStart',
            'onMotionEnd',
            'treeNodeRequiredProps',
          ])}
          active={active}
        />
      );
    };
  },
  {
    name: 'MotionTreeNode',
    inheritAttrs: false,
  },
);

export default MotionTreeNode;
