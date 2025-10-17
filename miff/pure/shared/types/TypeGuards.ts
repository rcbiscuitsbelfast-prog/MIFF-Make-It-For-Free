/**
 * TypeGuards - Advanced Type Safety and Type Narrowing
 *
 * Provides comprehensive type guards, type narrowing, and runtime type validation
 * for enhanced type safety across the MIFF framework.
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger } from '../logging/StructuredLogger';

export interface TypeGuardResult<T extends object> {
  isValid: boolean;
  value: T | null;
  error?: string;
  type: string;
}

export interface TypeValidationOptions {
  strict?: boolean;
  allowNull?: boolean;
  allowUndefined?: boolean;
  customValidator?: (value: any) => boolean;
  errorMessage?: string;
}

export class TypeGuards {
  private static instance: TypeGuards;
  private logger: StructuredLogger;

  constructor() {
    this.logger = StructuredLogger.getInstance('TypeGuards');
  }

  static getInstance(): TypeGuards {
    if (!TypeGuards.instance) {
      TypeGuards.instance = new TypeGuards();
    }
    return TypeGuards.instance;
  }

  /**
   * Basic type guards
   */
  static isString(value: any): value is string {
    return typeof value === 'string';
  }

  static isNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value: any);
  }

  static isBoolean(value: any): value is boolean {
    return typeof value === 'boolean';
  }

  static isObject(value: any): value is Record<string, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value: any);
  }

  static isArray(value: any): value is any[] {
    return Array.isArray(value: any);
  }

  static isFunction(value: any): value is Function {
    return typeof value === 'function';
  }

  static isDate(value: any): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  static isRegExp(value: any): value is RegExp {
    return value instanceof RegExp;
  }

  static isError(value: any): value is Error {
    return value instanceof Error;
  }

  static isPromise(value: any): value is Promise<any> {
    return value && typeof value.then === 'function';
  }

  /**
   * Advanced type guards with validation
   */
  static isNonEmptyString(value: any): value is string {
    return TypeGuards.isString(value: any) && value.length > 0;
  }

  static isPositiveNumber(value: any): value is number {
    return TypeGuards.isNumber(value: any) && value > 0;
  }

  static isNonNegativeNumber(value: any): value is number {
    return TypeGuards.isNumber(value: any) && value >= 0;
  }

  static isInteger(value: any): value is number {
    return TypeGuards.isNumber(value: any) && Number.isInteger(value: any);
  }

  static isPositiveInteger(value: any): value is number {
    return TypeGuards.isInteger(value: any) && value > 0;
  }

  static isNonEmptyArray(value: any): value is any[] {
    return TypeGuards.isArray(value: any) && value.length > 0;
  }

  static isNonEmptyObject(value: any): value is object {
    return TypeGuards.isObject(value: any) && Object.keys(value: any).length > 0;
  }

  /**
   * Union type guards
   */
  static isStringOrNumber(value: any): value is string | number {
    return TypeGuards.isString(value: any) || TypeGuards.isNumber(value: any);
  }

  static isStringOrNull(value: any): value is string | null {
    return TypeGuards.isString(value: any) || value === null;
  }

  static isNumberOrNull(value: any): value is number | null {
    return TypeGuards.isNumber(value: any) || value === null;
  }

  static isStringOrUndefined(value: any): value is string | undefined {
    return TypeGuards.isString(value: any) || value === undefined;
  }

  static isNumberOrUndefined(value: any): value is number | undefined {
    return TypeGuards.isNumber(value: any) || value === undefined;
  }

  /**
   * Array type guards
   */
  static isStringArray(value: any): value is string[] {
    return TypeGuards.isArray(value: any) && value.every(item => TypeGuards.isString(item));
  }

  static isNumberArray(value: any): value is number[] {
    return TypeGuards.isArray(value: any) && value.every(item => TypeGuards.isNumber(item));
  }

  static isBooleanArray(value: any): value is boolean[] {
    return TypeGuards.isArray(value: any) && value.every(item => TypeGuards.isBoolean(item));
  }

  static isObjectArray(value: any): value is object[] {
    return TypeGuards.isArray(value: any) && value.every(item => TypeGuards.isObject(item));
  }

  /**
   * Object property type guards
   */
  static hasProperty<K extends string>(obj: any, key: K): obj is Record<K, any> {
    return TypeGuards.isObject(obj) && key in obj;
  }

  static hasStringProperty<K extends string>(obj: any, key: K): obj is Record<K, string> {
    return TypeGuards.hasProperty(obj, key) && TypeGuards.isString(obj[key]);
  }

  static hasNumberProperty<K extends string>(obj: any, key: K): obj is Record<K, number> {
    return TypeGuards.hasProperty(obj, key) && TypeGuards.isNumber(obj[key]);
  }

  static hasBooleanProperty<K extends string>(obj: any, key: K): obj is Record<K, boolean> {
    return TypeGuards.hasProperty(obj, key) && TypeGuards.isBoolean(obj[key]);
  }

  static hasArrayProperty<K extends string>(obj: any, key: K): obj is Record<K, any[]> {
    return TypeGuards.hasProperty(obj, key) && TypeGuards.isArray(obj[key]);
  }

  static hasObjectProperty<K extends string>(obj: any, key: K): obj is Record<K, object> {
    return TypeGuards.hasProperty(obj, key) && TypeGuards.isObject(obj[key]);
  }

  /**
   * Runtime type validation with options
   */
  static validateString(value: any, options: TypeValidationOptions = {}): TypeGuardResult<string> {
    const { strict = true, allowNull = false, allowUndefined = false, customValidator, errorMessage } = options;

    if (value === null && allowNull) {
      return { isValid: true, value: null as any, type: 'string | null' };
    }

    if (value === undefined && allowUndefined) {
      return { isValid: true, value: undefined as any, type: 'string | undefined' };
    }

    if (!TypeGuards.isString(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || `Expected string, got ${typeof value}`,
        type: 'string'
      };
    }

    if (strict && !TypeGuards.isNonEmptyString(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || 'Expected non-empty string',
        type: 'string'
      };
    }

    if (customValidator && !customValidator(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || 'Custom validation failed',
        type: 'string'
      };
    }

    return { isValid: true, value, type: 'string' };
  }

  static validateNumber(value: any, options: TypeValidationOptions = {}): TypeGuardResult<number> {
    const { strict = true, allowNull = false, allowUndefined = false, customValidator, errorMessage } = options;

    if (value === null && allowNull) {
      return { isValid: true, value: null as any, type: 'number | null' };
    }

    if (value === undefined && allowUndefined) {
      return { isValid: true, value: undefined as any, type: 'number | undefined' };
    }

    if (!TypeGuards.isNumber(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || `Expected number, got ${typeof value}`,
        type: 'number'
      };
    }

    if (customValidator && !customValidator(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || 'Custom validation failed',
        type: 'number'
      };
    }

    return { isValid: true, value, type: 'number' };
  }

  static validateBoolean(value: any, options: TypeValidationOptions = {}): TypeGuardResult<boolean> {
    const { allowNull = false, allowUndefined = false, customValidator, errorMessage } = options;

    if (value === null && allowNull) {
      return { isValid: true, value: null as any, type: 'boolean | null' };
    }

    if (value === undefined && allowUndefined) {
      return { isValid: true, value: undefined as any, type: 'boolean | undefined' };
    }

    if (!TypeGuards.isBoolean(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || `Expected boolean, got ${typeof value}`,
        type: 'boolean'
      };
    }

    if (customValidator && !customValidator(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || 'Custom validation failed',
        type: 'boolean'
      };
    }

    return { isValid: true, value, type: 'boolean' };
  }

  static validateArray<T extends object>(value: any, options: TypeValidationOptions = {}): TypeGuardResult<T[]> {
    const { strict = true, allowNull = false, allowUndefined = false, customValidator, errorMessage } = options;

    if (value === null && allowNull) {
      return { isValid: true, value: null as any, type: 'array | null' };
    }

    if (value === undefined && allowUndefined) {
      return { isValid: true, value: undefined as any, type: 'array | undefined' };
    }

    if (!TypeGuards.isArray(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || `Expected array, got ${typeof value}`,
        type: 'array'
      };
    }

    if (strict && !TypeGuards.isNonEmptyArray(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || 'Expected non-empty array',
        type: 'array'
      };
    }

    if (customValidator && !customValidator(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || 'Custom validation failed',
        type: 'array'
      };
    }

    return { isValid: true, value, type: 'array' };
  }

  static validateObject(value: any, options: TypeValidationOptions = {}): TypeGuardResult<object> {
    const { strict = true, allowNull = false, allowUndefined = false, customValidator, errorMessage } = options;

    if (value === null && allowNull) {
      return { isValid: true, value: null as any, type: 'object | null' };
    }

    if (value === undefined && allowUndefined) {
      return { isValid: true, value: undefined as any, type: 'object | undefined' };
    }

    if (!TypeGuards.isObject(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || `Expected object, got ${typeof value}`,
        type: 'object'
      };
    }

    if (strict && !TypeGuards.isNonEmptyObject(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || 'Expected non-empty object',
        type: 'object'
      };
    }

    if (customValidator && !customValidator(value: any)) {
      return {
        isValid: false,
        value: null,
        error: errorMessage || 'Custom validation failed',
        type: 'object'
      };
    }

    return { isValid: true, value, type: 'object' };
  }

  /**
   * Complex type validation
   */
  static validateInterface<T extends object>(value: any, requiredKeys: (keyof T)[], optionalKeys: (keyof T)[] = []): TypeGuardResult<T extends object> {
    if (!TypeGuards.isObject(value: any)) {
      return {
        isValid: false,
        value: null,
        error: `Expected object, got ${typeof value}`,
        type: 'interface'
      };
    }

    const missingKeys = requiredKeys.filter((key: any) => !(key in value));
    if (missingKeys.length > 0) {
      return {
        isValid: false,
        value: null,
        error: `Missing required keys: ${missingKeys.join(', ')}`,
        type: 'interface'
      };
    }

    const extraKeys = Object.keys(value: any).filter((key: any) => 
      !requiredKeys.includes(key as keyof T) && !optionalKeys.includes(key as keyof T)
    );

    if (extraKeys.length > 0) {
      return {
        isValid: false,
        value: null,
        error: `Unexpected keys: ${extraKeys.join(', ')}`,
        type: 'interface'
      };
    }

    return { isValid: true, value, type: 'interface' };
  }

  /**
   * Type narrowing utilities
   */
  static narrowToDefined<T extends object>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
  }

  static narrowToNonNull<T extends object>(value: T | null): value is T {
    return value !== null;
  }

  static narrowToNonUndefined<T extends object>(value: T | undefined): value is T {
    return value !== undefined;
  }

  /**
   * Safe property access
   */
  static safeGet<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
    return TypeGuards.isObject(obj) && key in obj ? obj[key] : undefined;
  }

  static safeGetWithDefault<T, K extends keyof T>(obj: T, key: K, defaultValue: T[K]): T[K] {
    return TypeGuards.safeGet(obj, key) ?? defaultValue;
  }

  /**
   * Type assertion with validation
   */
  static assertString(value: any, errorMessage?: string): asserts value is string {
    if (!TypeGuards.isString(value: any)) {
      throw new Error(errorMessage || `Expected string, got ${typeof value}`);
    }
  }

  static assertNumber(value: any, errorMessage?: string): asserts value is number {
    if (!TypeGuards.isNumber(value: any)) {
      throw new Error(errorMessage || `Expected number, got ${typeof value}`);
    }
  }

  static assertBoolean(value: any, errorMessage?: string): asserts value is boolean {
    if (!TypeGuards.isBoolean(value: any)) {
      throw new Error(errorMessage || `Expected boolean, got ${typeof value}`);
    }
  }

  static assertArray(value: any, errorMessage?: string): asserts value is any[] {
    if (!TypeGuards.isArray(value: any)) {
      throw new Error(errorMessage || `Expected array, got ${typeof value}`);
    }
  }

  static assertObject(value: any, errorMessage?: string): asserts value is object {
    if (!TypeGuards.isObject(value: any)) {
      throw new Error(errorMessage || `Expected object, got ${typeof value}`);
    }
  }
}

// Export singleton instance
export const typeGuards = TypeGuards.getInstance();
export default typeGuards;