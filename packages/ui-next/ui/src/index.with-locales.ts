import type { Plugin } from 'vue';

import type { Locale } from './locale';

import as from '.';

export * from '.';

interface LocaleModule {
  default: Locale;
}

const localeModules = import.meta.glob<LocaleModule>('./locale/*_*.ts', {
  eager: true,
});

export const locales: Record<string, Locale> = Object.fromEntries(
  Object.entries(localeModules)
    .map(([path, mod]) => {
      const matches = path.match(/\/([A-Za-z]+_[A-Za-z]+)\.ts$/);
      const localeName = matches?.[1];

      if (!localeName) return null;

      return [localeName, mod.default] as const;
    })
    .filter((item): item is readonly [string, Locale] => item !== null),
);

const asWithLocales = {
  ...as,
  locales,
} as Plugin & { locales: Record<string, Locale> };

export default asWithLocales;
