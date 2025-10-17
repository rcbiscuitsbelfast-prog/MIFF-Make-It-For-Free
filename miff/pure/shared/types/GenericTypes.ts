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
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

// Type constraint utilities
export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

export type NumberKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

export type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

export type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export type ArrayKeys<T> = {
  [K in keyof T]: T[K] extends any[] ? K : never;
}[keyof T];

export type ObjectKeys<T> = {
  [K in keyof T]: T[K] extends object ? K : never;
}[keyof T];

// Conditional type utilities
export type If<C extends boolean, T, F> = C extends true ? T : F;
export type IsArray<T> = T extends any[] ? true : false;
export type IsObject<T> = T extends object ? true : false;
export type IsFunction<T> = T extends Function ? true : false;
export type IsString<T> = T extends string ? true : false;
export type IsNumber<T> = T extends number ? true : false;
export type IsBoolean<T> = T extends boolean ? true : false;

// Utility type operations
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;
export type Push<T extends any[], V> = [...T, V];
export type Unshift<T extends any[], V> = [V, ...T];
export type Concat<T extends any[], U extends any[]> = [...T, ...U];
export type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
export type Tail<T extends any[]> = T extends [any, ...infer T] ? T : never;
export type Length<T extends any[]> = T['length'];

// Type mapping utilities
export type MapKeys<T, M> = {
  [K in keyof T as M extends Record<K, infer U> ? U : K]: T[K];
};

export type MapValues<T, M> = {
  [K in keyof T]: M extends Record<K, infer U> ? U : T[K];
};

export type FilterKeys<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

export type ExcludeKeys<T, U> = {
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

export interface Comparable<T> {
  compareTo(other: T): number;
}

export interface Hashable {
  hashCode(): number;
}

// Generic type factory
export interface TypeFactory<T> {
  create(): T;
  createFrom(data: Partial<T>): T;
  validate(data): data is T;
  clone(instance: T): T;
  equals(a: T, b: T): boolean;
}

export class GenericTypeFactory<T> implements TypeFactory<T> {
  private logger: StructuredLogger;
  private validator: (data: any) => data is T;
  private cloner: (instance: T) => T;
  private equalizer: (a: T, b: T) => boolean;

  constructor(
    validator: (data: any) => data is T,
    cloner: (instance: T) => T = (instance: T) => ({ ...instance } as T),
    equalizer: (a: T, b: T) => boolean = (a: T, b: T) => JSON.stringify(a) === JSON.stringify(b)
  ) {
    this.logger = new StructuredLogger('GenericTypeFactory');
    this.validator = validator;
    this.cloner = cloner;
    this.equalizer = equalizer;
  }

  create(): T {
    StructuredLogger.debug('Creating new instance');
    return {} as T;
  }

  createFrom(data: Partial<T>): T {
    StructuredLogger.debug('Creating instance from partial data', { data });
    return { ...data } as T;
  }

  validate(data): data is T {
    const isValid = this.validator(data);
    if (!isValid) {
      StructuredLogger.warn('Validation failed', { data, type: typeof data });
    }
    return isValid;
  }

  clone(instance: T): T {
    StructuredLogger.debug('Cloning instance');
    return this.cloner(instance);
  }

  equals(a: T, b: T): boolean {
    const isEqual = this.equalizer(a, b);
    StructuredLogger.debug('Comparing instances', { isEqual });
    return isEqual;
  }
}

// Generic utility functions
export class GenericUtils {
  private static instance: GenericUtils;
  private logger: StructuredLogger;

  constructor() {
    this.logger = new StructuredLogger('GenericUtils');
  }

  static getInstance(): GenericUtils {
    if (!GenericUtils.instance) {
      GenericUtils.instance = new GenericUtils();
    }
    return GenericUtils.instance;
  }

  /**
   * Safe property access with type narrowing
   */
  static safeAccess<T, K extends keyof T>(obj: T, key: K): T[K!] | undefined {
    if (!TypeGuards.isObject(obj)) {
      StructuredLogger.warn('Attempted to access property on non-object', { obj, key });
      return undefined;
    }
    return obj[key!];
  }

  /**
   * Safe property access with default value
   */
  static safeAccessWithDefault<T, K extends keyof T>(obj: T, key: K, defaultValue: T[K]): T[K] {
    const value = this.safeAccess(obj, key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Deep clone with type safety
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
      return obj.map((item: any) => this.deepClone(item)) as T;
    }

    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key!] = this.deepClone(obj[key!]);
        }
      }
      return cloned;
    }

    return obj;
  }

  /**
   * Deep merge with type safety
   */
  static deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key!];
        const targetValue = result[key!];

        if (TypeGuards.isObject(sourceValue) && TypeGuards.isObject(targetValue)) {
          result[key!] = this.deepMerge(targetValue, sourceValue);
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
  static pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
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
  static omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj } as any;
    for (const key of keys) {
      delete result[key!];
    }
    return result;
  }

  /**
   * Type-safe object keys
   */
  static keys<T extends Record<string, any>>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }

  /**
   * Type-safe object values
   */
  static values<T extends Record<string, any>>(obj: T): T[keyof T][] {
    return Object.values(obj);
  }

  /**
   * Type-safe object entries
   */
  static entries<T extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
  }

  /**
   * Type-safe array filter
   */
  static filter<T, U extends T>(array: T[], predicate: (value: T, index: number, array: T[]) => value is U): U[] {
    return array.filter(predicate);
  }

  /**
   * Type-safe array map
   */
  static map<T, U>(array: T[], mapper: (value: T, index: number, array: T[]) => U): U[] {
    return array.map(mapper);
  }

  /**
   * Type-safe array reduce
   */
  static reduce<T, U>(array: T[], reducer: (accumulator: U, currentValue: T, index: number, array: T[]) => U, initialValue: U): U {
    return array.reduce(reducer, initialValue);
  }

  /**
   * Type-safe array find
   */
  static find<T, U extends T>(array: T[], predicate: (value: T, index: number, array: T[]) => value is U): U | undefined {
    return array.find(predicate);
  }

  /**
   * Type-safe array some
   */
  static some<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): boolean {
    return array.some(predicate);
  }

  /**
   * Type-safe array every
   */
  static every<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): boolean {
    return array.every(predicate);
  }
}

// Generic type constraints
export type NonEmptyArray<T> = [T, ...T[]];
export type NonEmptyString = string & { readonly __brand: unique symbol };
export type PositiveNumber = number & { readonly __brand: unique symbol };
export type NonNegativeNumber = number & { readonly __brand: unique symbol };
export type Integer = number & { readonly __brand: unique symbol };
export type PositiveInteger = number & { readonly __brand: unique symbol };

// Branded type utilities
export function createBrandedType<T, B extends string>(value: T, brand: B): T & { readonly __brand: B } {
  return value as T & { readonly __brand: B };
}

export function isBrandedType<T, B extends string>(value: any, brand: B): value is T & { readonly __brand: B } {
  return value && typeof value === 'object' && '__brand' in value && value.__brand === brand;
}

// Export singleton instances
export const genericUtils = GenericUtils.getInstance();
export default genericUtils;