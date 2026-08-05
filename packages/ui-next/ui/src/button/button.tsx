import type { App } from 'vue';

import type { ButtonHTMLType } from './button-helper';

import { defineComponent, shallowRef } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

export interface ButtonProps {
  htmlType?: ButtonHTMLType;
}

const AsButton = defineComponent<ButtonProps>(
  (props, { attrs, slots }) => {
    const buttonRef = shallowRef<HTMLAnchorElement | HTMLButtonElement>();
    const htmlType = props.htmlType ?? 'button';

    const cls = clsx('as-btn', attrs.class);

    return () => {
      return (
        <button
          {...omit(attrs, ['class', 'style'])}
          class={cls}
          ref={buttonRef}
          type={htmlType}
        >
          {slots.default()}
        </button>
      );
    };
  },
  {
    name: 'AsButton',
    inheritAttrs: false,
  },
);

const Button = AsButton as typeof AsButton & {
  __AS_BUTTON: boolean;
};

Button.__AS_BUTTON = true;

(Button as any).install = (app: App) => {
  app.component(AsButton.name, Button);
};

export default Button;
