/** 字面量联合类型：优先收窄为 T 中的字面量，同时允许任意 U 字符串（带提示但不受限） */
export type LiteralUnion<T extends U, U> = (Record<never, never> & U) | T;
