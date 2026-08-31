import type { ModalLocale } from './interface';

import defaultLocale from '../locale/en_US';

let runtimeLocale: ModalLocale = {
  ...(defaultLocale.Modal as ModalLocale),
};

let localeList: ModalLocale[] = [];

function generateLocale() {
  return localeList.reduce<ModalLocale>(
    (merged, locale) => ({ ...merged, ...locale }),
    defaultLocale.Modal!,
  );
}

export function changeConfirmLocale(newLocale?: ModalLocale) {
  if (newLocale) {
    const cloneLocale = { ...newLocale };
    localeList.push(cloneLocale);
    runtimeLocale = generateLocale();

    return () => {
      localeList = localeList.filter((locale) => locale !== cloneLocale);
      runtimeLocale = generateLocale();
    };
  }

  runtimeLocale = {
    ...(defaultLocale.Modal as ModalLocale),
  };
}

export function getConfirmLocale() {
  return runtimeLocale;
}
