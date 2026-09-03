import type { AddButtonProps } from '../interface';

import { defineComponent, shallowRef } from 'vue';

/**
 * AddButton（TSX 版，对应 TabNavList/AddButton.vue）
 *
 * 新增标签按钮：editable 开启且 showAdd !== false 时渲染，
 * 点击触发 editable.onEdit('add', ...)。
 */
import { RenderComponent } from '../../util/RenderComponent';

const AddButton = defineComponent<AddButtonProps>(
  (props, { expose }) => {
    const buttonRef = shallowRef<HTMLButtonElement>();

    function handleClick(event: MouseEvent) {
      props.editable?.onEdit('add', { event });
    }

    expose({
      buttonRef,
    });

    return () =>
      props.editable && props.editable.showAdd !== false ? (
        <button
          aria-label={props.locale?.addAriaLabel || 'Add tab'}
          class={`${props.prefixCls}-nav-add`}
          onClick={handleClick}
          ref={buttonRef}
          style={props.style}
          type="button"
        >
          <RenderComponent render={props.editable.addIcon || '+'} />
        </button>
      ) : null;
  },
  {
    name: 'AddButton',
    inheritAttrs: false,
  },
);

export default AddButton;
