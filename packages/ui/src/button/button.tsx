import type { App } from 'vue';

import type { ButtonHTMLType } from './button-helper';

import { defineComponent, shallowRef } from 'vue';

import { omit } from '@arvin-studio/kit';

export interface ButtonProps {
  htmlType?: ButtonHTMLType;
}

const AsButton = defineComponent<ButtonProps>(
  (props, { attrs }) => {
    const buttonRef = shallowRef<HTMLAnchorElement | HTMLButtonElement>();
    const htmlType = props.htmlType ?? 'button';
    return () => {
      return (
        <button
          {...omit(attrs, ['class', 'style'])}
          ref={buttonRef}
          type={htmlType}
        ></button>
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
