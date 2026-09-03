import type { CSSProperties } from 'vue';

import type { VueNode } from '../_util';
import type { DirectionType } from '../config-provider/context';

import { cloneVNode, defineComponent, isVNode } from 'vue';

import { LeftOutlined, RightOutlined } from '@arvin-studio/icons';

import Button from '../button';

export interface TransferOperationProps {
  actions: VueNode[];
  class?: string;
  direction?: DirectionType;
  disabled?: boolean;
  leftActive?: boolean;
  moveToLeft?: (event: MouseEvent) => void;
  moveToRight?: (event: MouseEvent) => void;
  oneWay?: boolean;
  rightActive?: boolean;
  style?: CSSProperties;
}

interface ActionProps {
  actions: VueNode[];
  direction?: DirectionType;
  disabled?: boolean;
  leftActive?: boolean;
  moveToLeft?: (event: MouseEvent) => void;
  moveToRight?: (event: MouseEvent) => void;
  rightActive?: boolean;
  type: 'left' | 'right';
}

function getArrowIcon(type: 'left' | 'right', direction?: DirectionType) {
  const isRight = type === 'right';
  if (direction !== 'rtl') {
    return isRight ? <RightOutlined /> : <LeftOutlined />;
  }
  return isRight ? <LeftOutlined /> : <RightOutlined />;
}

const Action = defineComponent<ActionProps>(
  (props) => {
    return () => {
      const isRight = props.type === 'right';
      const button = isRight ? props.actions[0] : props.actions[1];
      const moveHandler = isRight ? props.moveToRight : props.moveToLeft;
      const active = isRight ? props.rightActive : props.leftActive;
      const icon = getArrowIcon(props.type, props.direction);

      if (isVNode(button)) {
        const nodeProps = (button as any).props || {};
        const mergedDisabled = nodeProps.disabled || props.disabled || !active;
        const onClick = (event: MouseEvent) => {
          if (mergedDisabled) {
            event.preventDefault();
            return;
          }
          nodeProps?.onClick?.(event);
          moveHandler?.(event);
        };
        const cloned = cloneVNode(button, {
          disabled: mergedDisabled,
          onClick,
        });
        // cloneVNode merges `onClick` into an array (both original and new
        // handlers fire). Override it so our gated handler fully replaces the
        // original, matching React's cloneElement behavior.
        if (cloned.props) {
          cloned.props.onClick = onClick;
        }
        return cloned;
      }

      return (
        <Button
          disabled={props.disabled || !active}
          icon={icon}
          onClick={(event: MouseEvent) => moveHandler?.(event)}
          size="small"
          type="primary"
        >
          {button}
        </Button>
      );
    };
  },
  {
    name: 'ATransferAction',
    inheritAttrs: false,
  },
);

const Actions = defineComponent<TransferOperationProps>(
  (props) => {
    return () => {
      const { class: className, style, oneWay, actions, ...restProps } = props;
      return (
        <div class={className} style={style}>
          <Action actions={actions} type="right" {...restProps} />
          {!oneWay && <Action actions={actions} type="left" {...restProps} />}
          {actions.slice(oneWay ? 1 : 2).map((node) => node)}
        </div>
      );
    };
  },
  {
    name: 'ATransferOperation',
    inheritAttrs: false,
  },
);

export default Actions;
