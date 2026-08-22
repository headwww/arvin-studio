import type { InjectionKey, Ref } from 'vue';

import type { GenerateConfig } from '../generate';
import type { FilledClassNames, FilledStyles } from '../hooks/useSemantic';
import type { Components, Locale } from '../interface';

import { inject, provide, ref } from 'vue';

export interface PickerContextProps<DateType = any> {
  /** Customize button component */
  button?: Components['button'];
  classNames: FilledClassNames;
  generateConfig: GenerateConfig<DateType>;
  input?: Components['input'];
  locale: Locale;
  prefixCls: string | undefined;
  styles: FilledStyles;
}

const PickerContextKey: InjectionKey<Ref<PickerContextProps>> =
  Symbol('PickerContext');

export function providePickerContext(context: Ref<PickerContextProps>) {
  provide(PickerContextKey, context);
}

export function usePickerContext() {
  return inject(
    PickerContextKey,
    ref({} as PickerContextProps),
  ) as Ref<PickerContextProps>;
}
