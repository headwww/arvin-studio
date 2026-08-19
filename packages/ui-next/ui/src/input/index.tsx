import type { App } from 'vue';

import Input from './Input';
import OTP from './OTP';
import Password from './Password';
import Search from './Search';
export type { InputEmits, InputProps, InputRef, InputSlots } from './Input';
export type { OTPEmits, OTPProps, OTPSlots } from './OTP';
export type { InputPasswordRef, PasswordProps } from './Password';
export type { InputSearchRef, SearchProps } from './Search';

type CompoundedInputType = typeof Input & {
  install: (app: App) => App;
  OTP: typeof OTP;
  Password: typeof Password;
  Search: typeof Search;
};

const CompoundedInput = Input as CompoundedInputType;

CompoundedInput.Search = Search;
CompoundedInput.Password = Password;
CompoundedInput.OTP = OTP;

CompoundedInput.install = (app: App) => {
  app.component(Input.name, CompoundedInput);
  app.component(Search.name, Search);
  app.component(Password.name, Password);
  app.component(OTP.name, OTP);
  return app;
};

export default CompoundedInput;

export const InputOTP = OTP;
export const InputPassword = Password;
export const InputSearch = Search;
