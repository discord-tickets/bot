// THANK YOU GEMINI (I have no idea how this works)

export const MAX_DEPTH = 3;

export type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

export type AddOne<N extends number, Arr extends unknown[] = []> = Arr['length'] extends N
  ? [...Arr, unknown]['length']
  : AddOne<N, [...Arr, unknown]>;


export type Join<K, P> = K extends string ?
  P extends string ?
  `${K}${DotPrefix<P>}`
  : never
  : never;

export type DeepKeys<T, Depth extends number = 0> = Depth extends typeof MAX_DEPTH
  ? ''
  : T extends object
    ? {
        [K in keyof T]-?: K extends string
          ? Join<K, DeepKeys<NonNullable<T[K]>, AddOne<Depth>>> | `${K}`
          : never;
      }[keyof T]
    : '';

export type GetValueTypeInternal<T, P, Depth extends number = 0> = Depth extends typeof MAX_DEPTH
  ? unknown
  : P extends keyof T
    ? T[P]
    : P extends `${infer K}.${infer Rest}`
      ? K extends keyof T
        ? GetValueTypeInternal<NonNullable<T[K]>, Rest, AddOne<Depth>>
        : never
      : never;

export type GetValueType<T, P extends string> = GetValueTypeInternal<T, P>;
