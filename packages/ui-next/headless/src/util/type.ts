import type {
  App,
  Component,
  Plugin,
  PropType,
  Ref,
  SlotsType,
  VNode,
} from 'vue';

export const tuple = <T extends string[]>(...args: T) => args;

export const tupleNum = <T extends number[]>(...args: T) => args;
export type ElementOf<T> = T extends (infer E)[]
  ? E
  : T extends readonly (infer F)[]
    ? F
    : never;

export type LiteralUnion<T extends string> = (string & {}) | T;

export type Data = Record<string, unknown>;

export type Key = number | string;

type DefaultFactory<T> = (props: Data) => null | T | undefined;

export interface PropOptions<T = any, D = T> {
  default?: D | DefaultFactory<D> | null | object | undefined;
  required?: boolean;
  type?: null | PropType<T> | true;
  validator?: (value: unknown) => boolean;
}

declare type VNodeChildAtom =
  | boolean
  | Component
  | null
  | number
  | string
  | undefined
  | VNode
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | void;

export type VueNode = VNode | VNodeChildAtom | VNodeChildAtom[];

export function withInstall<T>(comp: T) {
  const c = comp as any;
  c.install = function (app: App) {
    app.component(c.displayName || c.name, comp as any);
  };

  return comp as Plugin & T;
}

export type MaybeRef<T> = Ref<T> | T;

export function eventType<T>() {
  return { type: [Function, Array] as PropType<T | T[]> };
}

export function objectType<T = object>(defaultVal?: T) {
  return { type: Object as PropType<T>, default: defaultVal as T };
}

export function booleanType(defaultVal?: boolean) {
  return { type: Boolean, default: defaultVal as boolean };
}

export function functionType<T = () => object>(defaultVal?: T) {
  return { type: Function as PropType<T>, default: defaultVal as T };
}

export function anyType<T = any>(defaultVal?: T, required?: boolean) {
  const type = { validator: () => true, default: defaultVal as T } as unknown;
  return required
    ? (type as {
        default: T;
        required: true;
        type: PropType<T>;
      })
    : (type as {
        default: T;
        type: PropType<T>;
      });
}
export function vNodeType<T = VueNode>() {
  return { validator: () => true } as unknown as { type: PropType<T> };
}

export function arrayType<T extends any[]>(defaultVal?: T) {
  return { type: Array as unknown as PropType<T>, default: defaultVal as T };
}

export function stringType<T extends string = string>(defaultVal?: T) {
  return { type: String as unknown as PropType<T>, default: defaultVal as T };
}

export function someType<T>(types?: any[], defaultVal?: T) {
  return types
    ? { type: types as PropType<T>, default: defaultVal as T }
    : anyType<T>(defaultVal);
}

export type CustomSlotsType<T extends Record<string, any>> = SlotsType<T>;

export type AnyObject = Record<PropertyKey, any>;
