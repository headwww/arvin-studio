import type { App } from 'vue';

import Input from './Input';

type CompoundedInputType = typeof Input;
const CompoundedInput = Input as CompoundedInputType & {
  install: (app: App) => App;
};

CompoundedInput.install = (app: App) => {
  app.component(Input.name, CompoundedInput);
  return app;
};

export default CompoundedInput;
