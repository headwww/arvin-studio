// oxlint-disable-next-line typescript/ban-ts-comment
// @ts-nocheck
import type { VueNode } from '../util';

import { cloneVNode, computed, defineComponent, isVNode } from 'vue';

import KeyCode from '../util/KeyCode';

export interface StarProps {
  allowHalf?: boolean;
  character?: ((props: StarProps) => any) | VueNode;
  characterRender?: (origin: any, props: StarProps) => any;
  count?: number;
  disabled?: boolean;
  focused?: boolean;
  index?: number;
  onClick?: (e: KeyboardEvent | MouseEvent, index: number) => void;
  onHover?: (e: MouseEvent, index: number) => void;
  prefixCls?: string;
  value?: number;
}

function cloneCharacterNode(node: any): any {
  if (Array.isArray(node)) {
    return node.map((item) => (isVNode(item) ? cloneVNode(item) : item));
  }

  return isVNode(node) ? cloneVNode(node) : node;
}

export default defineComponent<StarProps>(
  (props) => {
    const onHover = (e: MouseEvent) => {
      const { index } = props;
      props?.onHover?.(e, index!);
    };
    const onClick = (e: MouseEvent) => {
      const { index } = props;
      props?.onClick?.(e, index!);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const { index } = props;
      // eslint-disable-next-line unicorn/prefer-keyboard-event-key
      if (e.keyCode === KeyCode.ENTER) {
        props?.onClick?.(e, index!);
      }
    };

    const cls = computed(() => {
      const { prefixCls, index, value, allowHalf, focused } = props;
      const starValue = index! + 1;
      let className = prefixCls;
      if (value === 0 && index === 0 && focused) {
        className += ` ${prefixCls}-focused`;
      } else if (allowHalf && value! + 0.5 >= starValue && value! < starValue) {
        className += ` ${prefixCls}-half ${prefixCls}-active`;
        if (focused) {
          className += ` ${prefixCls}-focused`;
        }
      } else {
        className +=
          starValue <= value! ? ` ${prefixCls}-full` : ` ${prefixCls}-zero`;
        if (starValue === value && focused) {
          className += ` ${prefixCls}-focused`;
        }
      }
      return className;
    });

    return () => {
      const {
        disabled,
        prefixCls,
        characterRender,
        character,
        index,
        count,
        value,
      } = props;
      const characterNode =
        typeof character === 'function'
          ? (character as any)({
              disabled,
              prefixCls,
              index,
              count,
              value,
            })
          : character;
      const firstCharacterNode = cloneCharacterNode(characterNode);
      const secondCharacterNode = cloneCharacterNode(characterNode);
      let star = (
        <li class={cls.value}>
          <div
            aria-checked={value! > index! ? 'true' : 'false'}
            aria-posinset={index! + 1}
            aria-setsize={count}
            onClick={disabled ? null : onClick}
            onKeydown={disabled ? null : onKeyDown}
            onMousemove={disabled ? null : onHover}
            role="radio"
            tabindex={disabled ? -1 : 0}
          >
            <div class={`${prefixCls}-first`}>{firstCharacterNode}</div>
            <div class={`${prefixCls}-second`}>{secondCharacterNode}</div>
          </div>
        </li>
      );
      if (characterRender) {
        star = characterRender(star, props);
      }
      return star;
    };
  },
  {
    name: 'RateStar',
    inheritAttrs: false,
  },
);
