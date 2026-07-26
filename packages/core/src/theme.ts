import { AsCore } from './core';

/**
 * 主题
 */
export type Theme = '' | 'dark' | 'default' | 'light' | null;

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
      documentElement.dataset.asTheme = theme;
    }
  }
  return AsCore;
}

export function getTheme() {
  return themeConfigStore.theme;
}
