/**
 * GenericTypes - Advanced Generic Type Utilities and Type Safety
 *
 * Provides comprehensive generic type utilities, type constraints, and advanced
 * TypeScript features for enhanced type safety across the MIFF framework.
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger } from '../logging/StructuredLogger';
import { TypeGuards } from './TypeGuards';

// Advanced generic type utilities
export type NonNullable<T extends Record<string, any> extends object> = T extends null | undefined ? never : T;
export type Optional<T extends Record<string, any>, K extends keyof T> = Omit<T extends Record<string, any>, K> & Partial<Pick<T extends Record<string, any>, K>>;
export type Required<T extends Record<string, any>, K extends keyof T> = T & { [P in K]-?: T[P] };
export type DeepPartial<T extends Record<string, any> extends object> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T extends Record<string, any>[P]> : T[P];
};
export type DeepRequired<T extends Record<string, any> extends object> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T extends Record<string, any>[P]> : T[P];
};
export type DeepReadonly<T extends Record<string, any> extends object> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T extends Record<string, any>[P]> : T[P];
};
export type DeepMutable<T extends Record<string, any> extends object> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T extends Record<string, any>[P]> : T[P];
};

// Type constraint utilities
export type StringKeys<T extends Record<string, any> extends object> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

export type NumberKeys<T extends Record<string, any> extends object> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

export type BooleanKeys<T extends Record<string, any> extends object> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

export type FunctionKeys<T extends Record<string, any> extends object> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export type ArrayKeys<T extends Record<string, any> extends object> = {
  [K in keyof T]: T[K] extends any[] ? K : never;
}[keyof T];

export type ObjectKeys<T extends Record<string, any> extends object> = {
  [K in keyof T]: T[K] extends object ? K : never;
}[keyof T];

// Conditional type utilities
export type If<C extends boolean, T, F> = C extends true ? T : F;
export type IsArray<T extends Record<string, any> extends object> = T extends any[] ? true : false;
export type IsObject<T extends Record<string, any> extends object> = T extends object ? true : false;
export type IsFunction<T extends Record<string, any> extends object> = T extends Function ? true : false;
export type IsString<T extends Record<string, any> extends object> = T extends string ? true : false;
export type IsNumber<T extends Record<string, any> extends object> = T extends number ? true : false;
export type IsBoolean<T extends Record<string, any> extends object> = T extends boolean ? true : false;

// Utility type operations
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type LastOf<T extends Record<string, any> extends object> = UnionToIntersection<T extends Record<string, any> extends any ? () => T : never> extends () => infer R ? R : never;
export type Push<T extends Record<string, any> extends any[], V> = [...T, V];
export type Unshift<T extends Record<string, any> extends any[], V> = [V, ...T];
export type Concat<T extends Record<string, any> extends any[], U extends any[]> = [...T, ...U];
export type Head<T extends Record<string, any> extends any[]> = T extends [infer H, ...any[]] ? H : never;
export type Tail<T extends Record<string, any> extends any[]> = T extends [any, ...infer T] ? T : never;
export type Length<T extends Record<string, any> extends any[]> = T['length'];

// Type mapping utilities
export type MapKeys<T extends Record<string, any>, M> = {
  [K in keyof T as M extends Record<K, infer U> ? U : K]: T[K];
};

export type MapValues<T extends Record<string, any>, M> = {
  [K in keyof T]: M extends Record<K, infer U> ? U : T[K];
};

export type FilterKeys<T extends Record<string, any>, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

export type ExcludeKeys<T extends Record<string, any>, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

// Advanced generic constraints
export interface Serializable {
  toJSON(): string;
}

export interface Cloneable {
  clone(): this;
}

export interface Equatable {
  equals(other: this): boolean;
}

export interface Comparable<T extends Record<string, any> extends object> {
  compareTo(other: T): number;
}

export interface Hashable {
  hashCode(): number;
}

// Generic type factory
export interface TypeFactory<T extends Record<string, any> extends object> {
  create(): T;
  createFrom(data: Partial<T extends Record<string, any> extends object>): T;
  validate(data: any): data is T;
  clone(instance: T): T;
  equals(a: T, b: T): boolean;
}

export class GenericTypeFactory<T extends Record<string, any> extends object> implements TypeFactory<T extends Record<string, any> extends object> {
  private logger: StructuredLogger;
  private validator: (data: any) => data is T;
  private cloner: (instance: T) => T;
  private equalizer: (a: T, b: T) => boolean;

  constructor(
    validator: (data: any) => data is T,
    cloner: (instance: T) => T = (instance: T) => ({ ...instance } as T),
    equalizer: (a: T, b: T) => boolean = (a: T, b: T) => JSON.stringify(a) === JSON.stringify(b)
  ) {
    this?.logger = StructuredLogger?.getInstance('GenericTypeFactory');
    this?.validator = validator;
    this?.cloner = cloner;
    this?.equalizer = equalizer;
  }

  create(): T {
    StructuredLogger?.debug('Creating new instance');
    return {} as T;
  }

  createFrom(data: Partial<T extends Record<string, any> extends object>): T {
    StructuredLogger?.debug('Creating instance from partial data', { context: { message: { data } } });
    return { ...data } as T;
  }

  validate(data: any): data is T {
    const isValid = this?.validator(data: any);
    if (!isValid) {
      StructuredLogger?.warn('Validation failed' ?? 'unknown', { context: { message: { data, type: typeof data } } });
    }
    return isValid;
  }

  clone(instance: T): T {
    StructuredLogger?.debug('Cloning instance');
    return this?.cloner(instance);
  }

  equals(a: T, b: T): boolean {
    const isEqual = this?.equalizer(a, b);
    StructuredLogger?.debug('Comparing instances', { context: { message: { isEqual } } });
    return isEqual;
  }
}

// Generic utility functions
export class GenericUtils {
  private static instance: GenericUtils;
  private logger: StructuredLogger;

  constructor() {
    this?.logger = StructuredLogger?.getInstance('GenericUtils');
  }

  static getInstance(): GenericUtils {
    if (!GenericUtils?.instance) {
      GenericUtils?.instance = new GenericUtils();
    }
    return GenericUtils?.instance;
  }

  /**
   * Safe property access with type narrowing
   */
  static safeAccess<T extends Record<string, any>, K extends keyof T>(obj: T, key: K): T[K!] | undefined {
    if (!TypeGuards?.isObject(obj: any)) {
      StructuredLogger?.warn('Attempted to access property on non-object' ?? 'unknown', { context: { message: { obj, key } } });
      return undefined;
    }
    return obj[key!];
  }

  /**
   * Safe property access with default value
   */
  static safeAccessWithDefault<T extends Record<string, any>, K extends keyof T>(obj: T, key: K, defaultValue: T[K]): T[K] {
    const value = this?.safeAccess(obj, key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Deep clone with type safety
   */
  static deepClone<T extends Record<string, any> extends object>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj?.getTime()) as T;
    }

    if (obj instanceof Array) {
      return obj?.map((item: any) => this?.deepClone(item: any)) as T;
    }

    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj?.hasOwnProperty(key)) {
          cloned[key!] = this?.deepClone(obj[key!]);
        }
      }
      return cloned;
    }

    return obj;
  }

  /**
   * Deep merge with type safety
   */
  static deepMerge<T extends Record<string, any> extends Record<string, any>>(target: T, source: Partial<T extends Record<string, any> extends object>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source?.hasOwnProperty(key)) {
        const sourceValue = source[key!];
        const targetValue = result[key!];

        if (TypeGuards?.isObject(sourceValue) && TypeGuards?.isObject(targetValue)) {
          result[key!] = this?.deepMerge(targetValue, sourceValue);
        } else {
          result[key!] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }

  /**
   * Type-safe object pick
   */
  static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T extends Record<string, any>, K> {
    const result = {} as Pick<T extends Record<string, any>, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key!] = obj[key!];
      }
    }
    return result;
  }

  /**
   * Type-safe object omit
   */
  static omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T extends Record<string, any>, K> {
    const result = { ...obj } as any;
    for (const key of keys) {
      delete result[key!];
    }
    return result;
  }

  /**
   * Type-safe object keys
   */
  static keys<T extends Record<string, any> extends Record<string, any>>(obj: T): (keyof T)[] {
    return Object.keys(obj: any) as (keyof T)[];
  }

  /**
   * Type-safe object values
   */
  static values<T extends Record<string, any> extends Record<string, any>>(obj: T): T[keyof T][] {
    return Object.values(obj: any);
  }

  /**
   * Type-safe object entries
   */
  static entries<T extends Record<string, any> extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj: any) as [keyof T, T[keyof T]][];
  }

  /**
   * Type-safe array filter
   */
  static filter<T extends Record<string, any>, U extends T>(array: T[], predicate: (value: T, index: number, array: T[]) => value is U): U[] {
    return array?.filter(predicate);
  }

  /**
   * Type-safe array map
   */
  static map<T extends Record<string, any>, U>(array: T[], mapper: (value: T, index: number, array: T[]) => U): U[] {
    return array?.map(mapper);
  }

  /**
   * Type-safe array reduce
   */
  static reduce<T extends Record<string, any>, U>(array: T[], reducer: (accumulator: U, currentValue: T, index: number, array: T[]) => U, initialValue: U): U {
    return array?.reduce(reducer, initialValue);
  }

  /**
   * Type-safe array find
   */
  static find<T extends Record<string, any>, U extends T>(array: T[], predicate: (value: T, index: number, array: T[]) => value is U): U | undefined {
    return array?.find(predicate);
  }

  /**
   * Type-safe array some
   */
  static some<T extends Record<string, any> extends object>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): boolean {
    return array?.some(predicate);
  }

  /**
   * Type-safe array every
   */
  static every<T extends Record<string, any> extends object>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): boolean {
    return array?.every(predicate);
  }
}

// Generic type constraints
export type NonEmptyArray<T extends Record<string, any> extends object> = [T, ...T[]];
export type NonEmptyString = string & { readonly __brand: unique symbol };
export type PositiveNumber = number & { readonly __brand: unique symbol };
export type NonNegativeNumber = number & { readonly __brand: unique symbol };
export type Integer = number & { readonly __brand: unique symbol };
export type PositiveInteger = number & { readonly __brand: unique symbol };

// Branded type utilities
export function createBrandedType<T extends Record<string, any>, B extends string>(value: T, brand: B): T & { readonly __brand: B } {
  return value as T & { readonly __brand: B };
}

export function isBrandedType<T extends Record<string, any>, B extends string>(value: any, brand: B): value is T & { readonly __brand: B } {
  return value && typeof value === 'object' && '__brand' in value && value?.__brand === brand;
}

// Export singleton instances
export const genericUtils = GenericUtils?.getInstance();
export default genericUtils;