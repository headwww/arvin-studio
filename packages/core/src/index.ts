import { AsCore } from './core';
import { getI18n, setI18n } from './i18n';
import { getTheme, setTheme } from './theme';

const ArvinStudio = Object.assign(AsCore, {
  setI18n,
  getI18n,
  setTheme,
  getTheme,
});

setTheme();

export * from './i18n';
export * from './theme';

export default ArvinStudio;
