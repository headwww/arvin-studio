import { AsCore } from './core';

/**
 * 主题
 */
export type Theme = null | '' | 'default' | 'light' | 'dark';

export const themeConfigStore: {
  theme: Theme;
} = {
  theme: '',
};

export function setTheme(name?: Theme) {
  const theme = !name || name === 'default' ? 'light' : name;
  themeConfigStore.theme = theme;
  if (typeof document !== 'undefined') {
    const documentElement = document.documentElement;
    if (documentElement) {
      documentElement.setAttribute('data-as-theme', theme);
    }
  }
  return AsCore;
}

export function getTheme() {
  return themeConfigStore.theme;
}
