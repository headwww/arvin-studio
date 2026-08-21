import type { InjectionKey } from 'vue';

import type { OnGroupPreview, RegisterImage } from './interface';

import { inject, provide } from 'vue';

export interface PreviewGroupContextProps {
  onPreview: OnGroupPreview;
  register: RegisterImage;
}

const PreviewGroupContextKey: InjectionKey<PreviewGroupContextProps> = Symbol(
  'PreviewGroupContext',
);

export function usePreviewGroupContext() {
  return inject(PreviewGroupContextKey, null);
}

export function usePreviewGroupProvider(value: PreviewGroupContextProps) {
  provide(PreviewGroupContextKey, value);
}
