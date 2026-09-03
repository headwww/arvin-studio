import type { App } from 'vue';

import Form from './Form';
import FormItem from './FormItem';
import { useForm, useFormInstance } from './hooks/useForm';

(Form as any).install = (app: App) => {
  app.component(Form.name, Form);
  app.component(FormItem.name, FormItem);
};
(Form as any).useForm = useForm;
(Form as any).useFormInstance = useFormInstance;
export default Form;

export { FormItem, useForm, useFormInstance };
export {
  type FormEmits,
  type FormInstance,
  type FormProps,
  type FormSlots,
} from './Form';
export type { FormItemEmits, FormItemProps, FormItemSlots } from './FormItem';
export type { FormHookInstance } from './hooks/useForm';

export type { Rule, RuleObject, RuleRender, RuleType } from './types';
