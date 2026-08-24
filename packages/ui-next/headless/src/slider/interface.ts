import type { CSSProperties } from 'vue';

export type Direction = 'btt' | 'ltr' | 'rtl' | 'ttb';

export type OnStartMove = (
  e: MouseEvent | TouchEvent,
  valueIndex: number,
  startValues?: number[],
) => void;

export type AriaValueFormat = (value: number) => string;

export type SemanticName = 'handle' | 'rail' | 'track' | 'tracks';

export type SliderClassNames = Partial<Record<SemanticName, string>>;

export type SliderStyles = Partial<Record<SemanticName, CSSProperties>>;
