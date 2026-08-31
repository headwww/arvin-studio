import type { InjectionKey, Ref } from 'vue';

import type { ConfirmCancelBtnProps } from './components/ConfirmCancelBtn';
import type { ConfirmOkBtnProps } from './components/ConfirmOkBtn';
import type { NormalCancelBtnProps } from './components/NormalCancelBtn';
import type { NormalOkBtnProps } from './components/NormalOkBtn';

import { inject, provide, ref } from 'vue';

export type ModalContextProps = ConfirmCancelBtnProps &
  ConfirmOkBtnProps &
  NormalCancelBtnProps &
  NormalOkBtnProps;

const ModalContextKey: InjectionKey<Ref<ModalContextProps>> =
  Symbol('ModalContext');

export function useModalContext() {
  return inject(ModalContextKey, ref({}) as Ref<ModalContextProps>);
}

export function useModalProvider(value: Ref<ModalContextProps>) {
  provide(ModalContextKey, value);
}
