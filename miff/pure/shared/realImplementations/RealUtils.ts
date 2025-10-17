import { StructuredLogger } from '../shared/logging/StructuredLogger';
/**
 * Real Utils Implementation
 * 
 * Production-ready utility functions with advanced capabilities including:
 * - String manipulation and formatting
 * - Array and object utilities
 * - Date and time utilities
 * - Mathematical operations and calculations
 */

export interface StringUtils {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  capitalize(str: string): string;
  camelCase(str: string): string;
  kebabCase(str: string): string;
  snakeCase(str: string): string;
  pascalCase(str: string): string;
  truncate(str: string, length: number): string;
  padLeft(str: string, length: number, char?: string): string;
  padRight(str: string, length: number, char?: string): string;
  removeWhitespace(str: string): string;
  reverse(str: string): string;
  isEmail(str: string): boolean;
  isUrl(str: string): boolean;
  isPhoneNumber(str: string): boolean;
  extractNumbers(str: string): number[];
  extractWords(str: string): string[];
}

export interface ArrayUtils {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  unique<T extends object>(arr: T[]): T[];
  chunk<T extends object>(arr: T[], size: number): T[][];
  flatten<T extends object>(arr: T[][]): T[];
  groupBy<T extends object>(arr: T[], key: keyof T): Record<string, T[]>;
  sortBy<T extends object>(arr: T[], key: keyof T): T[];
  shuffle<T extends object>(arr: T[]): T[];
  sample<T extends object>(arr: T[], count: number): T[];
  difference<T extends object>(arr1: T[], arr2: T[]): T[];
  intersection<T extends object>(arr1: T[], arr2: T[]): T[];
  union<T extends object>(arr1: T[], arr2: T[]): T[];
  zip<T, U>(arr1: T[], arr2: U[]): [T, U][];
  unzip<T, U>(arr: [T, U][]): [T[], U[]];
}

export interface ObjectUtils {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  deepClone<T extends object>(obj: T): T;
  deepMerge<T extends object>(target: T, source: Partial<T extends object>): T;
  pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
  omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
  isEmpty(obj): boolean;
  isEqual(obj1: any, obj2: any): boolean;
  keys<T extends object>(obj: T): (keyof T)[];
  values<T extends object>(obj: T): T[keyof T][];
  entries<T extends object>(obj: T): [keyof T, T[keyof T]][];
  fromEntries<T extends object>(entries: [string, any][]): T;
  mapKeys<T extends object>(obj: T, fn: (key: keyof T) => string): Record<string, any>;
  mapValues<T extends object>(obj: T, fn: (value: T[keyof T]) => any): Record<keyof T, any>;
}

export interface DateUtils {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  now(): Date;
  today(): Date;
  format(date: Date, format: string): string;
  parse(dateString: string, format: string): Date;
  addDays(date: Date, days: number): Date;
  addMonths(date: Date, months: number): Date;
  addYears(date: Date, years: number): Date;
  differenceInDays(date1: Date, date2: Date): number;
  differenceInHours(date1: Date, date2: Date): number;
  differenceInMinutes(date1: Date, date2: Date): number;
  isBefore(date1: Date, date2: Date): boolean;
  isAfter(date1: Date, date2: Date): boolean;
  isSameDay(date1: Date, date2: Date): boolean;
  startOfDay(date: Date): Date;
  endOfDay(date: Date): Date;
  startOfWeek(date: Date): Date;
  endOfWeek(date: Date): Date;
  startOfMonth(date: Date): Date;
  endOfMonth(date: Date): Date;
  startOfYear(date: Date): Date;
  endOfYear(date: Date): Date;
}

export interface MathUtils {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  random(min: number, max: number): number;
  randomInt(min: number, max: number): number;
  clamp(value: number, min: number, max: number): number;
  lerp(a: number, b: number, t: number): number;
  round(value: number, decimals: number): number;
  ceil(value: number): number;
  floor(value: number): number;
  abs(value: number): number;
  max(...values: number[]): number;
  min(...values: number[]): number;
  sum(...values: number[]): number;
  average(...values: number[]): number;
  median(...values: number[]): number;
  mode(...values: number[]): number;
  variance(...values: number[]): number;
  standardDeviation(...values: number[]): number;
  factorial(n: number): number;
  fibonacci(n: number): number;
  isPrime(n: number): boolean;
  gcd(a: number, b: number): number;
  lcm(a: number, b: number): number;
}

export class RealUtils {
  
  private eventHandlers: Map<string, Function[]> = new Map();
  private isInitialized: boolean = false;

  constructor(...args: any[]) {
    
    this.initialize();
  }

  /**
   * Initialize utils
   */
  private initialize(): void {
    this.isInitialized = true;
    this.emit('initialized', {});
  }

  /**
   * String utilities
   */
  string: StringUtils = {
    capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
    camelCase: (str: string) => str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : ''),
    kebabCase: (str: string) => str.replace(/([a-z])([A-Z])/g, '-').toLowerCase(),
    snakeCase: (str: string) => str.replace(/([a-z])([A-Z])/g, '_').toLowerCase(),
    pascalCase: (str: string) => str.replace(/(?:^|[-_\s])(.)/g, (_, c) => c.toUpperCase()),
    truncate: (str: string, length: number) => str.length > length ? str.slice(0, length) + '...' : str,
    padLeft: (str: string, length: number, char: string = ' ') => str.padStart(length, char),
    padRight: (str: string, length: number, char: string = ' ') => str.padEnd(length, char),
    removeWhitespace: (str: string) => str.replace(/\s/g, ''),
    reverse: (str: string) => str.split('').reverse().join(''),
    isEmail: (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str),
    isUrl: (str: string) => /^https?:\/\/.+/.test(str),
    isPhoneNumber: (str: string) => /^\+?[\d\s\-\(\)]+$/.test(str),
    extractNumbers: (str: string) => str.match(/\d+/g)?.map(Number) || [],
    extractWords: (str: string) => str.match(/\b\w+\b/g) || []
  };

  /**
   * Array utilities
   */
  array: ArrayUtils = {
    unique: <T extends object>(arr: T[]) => [...new Set(arr)],
    chunk: <T extends object>(arr: T[], size: number) => {
      const chunks: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    },
    flatten: <T extends object>(arr: T[][]) => arr.reduce((acc, val) => acc.concat(val), []),
    groupBy: <T extends object>(arr: T[], key: keyof T) => {
      return arr.reduce((groups, item) => {
        const group = String(item[key]);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      }, {} as Record<string, T[]>);
    },
    sortBy: <T extends object>(arr: T[], key: keyof T) => {
      return [...arr].sort((a: any, b: any) => {
        const aVal = a[key];
        const bVal = b[key];
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      });
    },
    shuffle: <T extends object>(arr: T[]) => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
    sample: <T extends object>(arr: T[], count: number) => {
      const shuffled = this.array.shuffle(arr);
      return shuffled.slice(0, count);
    },
    difference: <T extends object>(arr1: T[], arr2: T[]) => arr1.filter((item: any) => !arr2.includes(item)),
    intersection: <T extends object>(arr1: T[], arr2: T[]) => arr1.filter((item: any) => arr2.includes(item)),
    union: <T extends object>(arr1: T[], arr2: T[]) => this.array.unique([...arr1, ...arr2]),
    zip: <T, U>(arr1: T[], arr2: U[]) => 
      const length = Math.min(length: arr1.length, arr2.length);
      const result: [T, U][] = [];
      for (let i = 0; i < length; i++) {
        result.push([arr1[i], arr2[i]]);
      }
      return result;
    },
    unzip: <T, U>(arr: [T, U][]) => {
      const first: T[] = [];
      const second: U[] = [];
      for (const [a, b] of arr) {
        first.push(a);
        second.push(b);
      }
      return [first, second];
    }
  };

  /**
   * Object utilities
   */
  object: ObjectUtils = {
    deepClone: <T extends object>(obj: T): T => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime()) as any;
      if (obj instanceof Array) return obj.map((item: any) => this.object.deepClone(item)) as any;
      if (typeof obj === 'object') {
        const cloned: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            cloned[key] = this.object.deepClone(obj[key]);
          }
        }
        return cloned;
      }
      return obj;
    },
    deepMerge: <T extends object>(target: T, source: Partial<T extends object>): T => {
      const result = { ...target };
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          const sourceValue = source[key];
          const targetValue = result[key];
          if (this.object.isEqual(targetValue, sourceValue)) {
            result[key] = sourceValue as T[Extract<keyof T, string>];
          } else if (typeof sourceValue === 'object' && sourceValue !== null) {
            result[key] = this.object.deepMerge(targetValue, sourceValue) as T[Extract<keyof T, string>];
          } else {
            result[key] = sourceValue as T[Extract<keyof T, string>];
          }
        }
      }
      return result;
    },
    pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
      const result = {} as Pick<T, K>;
      for (const key of keys) {
        if (key in obj) {
          (result as any)[key] = obj[key];
        }
      }
      return result;
    },
    omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
      const result = { ...obj };
      for (const key of keys) {
        delete result[key];
      }
      return result;
    },
    isEmpty: (obj: any) => {
      if (obj == null) return true;
      if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
      if (typeof obj === 'object') return Object.keys(obj).length === 0;
      return false;
    },
    isEqual: (obj1: any, obj2: any) => {
      if (obj1 === obj2) return true;
      if (obj1 == null || obj2 == null) return false;
      if (typeof obj1 !== typeof obj2) return false;
      if (typeof obj1 !== 'object') return obj1 === obj2;
      if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
      
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      
      for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!this.object.isEqual(obj1[key], obj2[key])) return false;
      }
      return true;
    },
    keys: <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[],
    values: <T extends object>(obj: T) => Object.values(obj) as T[keyof T][],
    entries: <T extends object>(obj: T) => Object.entries(obj) as [keyof T, T[keyof T]][],
    fromEntries: <T extends object>(entries: [string, any][]) => Object.fromEntries(entries) as T,
    mapKeys: <T extends object>(obj: T, fn: (key: keyof T) => string) => {
      const result: Record<string, any> = {};
      for (const [key, value] of this.object.entries(obj as object)) {
        result[fn(key)] = value;
      }
      return result;
    },
    mapValues: <T extends object>(obj: T, fn: (value: T[keyof T]) => any) => {
      const result: Record<keyof T, any> = {} as Record<keyof T, any>;
      for (const [key, value] of this.object.entries(obj as object)) {
        (result as any)[key] = fn(value);
      }
      return result;
    }
  };

  /**
   * Date utilities
   */
  date: DateUtils = {
    now: () => new Date(),
    today: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    },
    format: (date: Date, format: string) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    },
    parse: (dateString: string, format: string) => {
      // Simplified date parsing - in real implementation, use a proper date library
      return new Date(dateString);
    },
    addDays: (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },
    addMonths: (date: Date, months: number) => {
      const result = new Date(date);
      result.setMonth(result.getMonth() + months);
      return result;
    },
    addYears: (date: Date, years: number) => {
      const result = new Date(date);
      result.setFullYear(result.getFullYear() + years);
      return result;
    },
    differenceInDays: (date1: Date, date2: Date) => {
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    differenceInHours: (date1: Date, date2: Date) => {
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60));
    },
    differenceInMinutes: (date1: Date, date2: Date) => {
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(diffTime / (1000 * 60));
    },
    isBefore: (date1: Date, date2: Date) => date1.getTime() < date2.getTime(),
    isAfter: (date1: Date, date2: Date) => date1.getTime() > date2.getTime(),
    isSameDay: (date1: Date, date2: Date) => {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    },
    startOfDay: (date: Date) => {
      const result = new Date(date);
      result.setHours(0, 0, 0, 0);
      return result;
    },
    endOfDay: (date: Date) => {
      const result = new Date(date);
      result.setHours(23, 59, 59, 999);
      return result;
    },
    startOfWeek: (date: Date) => {
      const result = new Date(date);
      const day = result.getDay();
      const diff = result.getDate() - day;
      result.setDate(diff);
      result.setHours(0, 0, 0, 0);
      return result;
    },
    endOfWeek: (date: Date) => {
      const result = new Date(date);
      const day = result.getDay();
      const diff = result.getDate() - day + 6;
      result.setDate(diff);
      result.setHours(23, 59, 59, 999);
      return result;
    },
    startOfMonth: (date: Date) => {
      const result = new Date(date);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      return result;
    },
    endOfMonth: (date: Date) => {
      const result = new Date(date);
      result.setMonth(result.getMonth() + 1, 0);
      result.setHours(23, 59, 59, 999);
      return result;
    },
    startOfYear: (date: Date) => {
      const result = new Date(date);
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      return result;
    },
    endOfYear: (date: Date) => {
      const result = new Date(date);
      result.setMonth(11, 31);
      result.setHours(23, 59, 59, 999);
      return result;
    }
  };

  /**
   * Math utilities
   */
  math: MathUtils = 
    random: (min: number, max: number) => Math.random() * (max - min) + min,
    randomInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    clamp: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),
    lerp: (a: number, b: number, t: number) => a + (b - a) * t,
    round: (value: number, decimals: number) => Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals),
    ceil: (value: number) => Math.ceil(value),
    floor: (value: number) => Math.floor(value),
    abs: (value: number) => Math.abs(value),
    max: (...values: number[]) => Math.max(...values),
    min: (...values: number[]) => Math.min(...values),
    sum: (...values: number[]) => values.reduce((sum, val) => sum + val, 0),
    average: (...values: number[]) => values.reduce((sum, val) => sum + val, 0) / length: values.length,
    median: (...values: number[]) => {
      const sorted = values.sort((a: any, b: any) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    },
    mode: (...values: number[]) => {
      const frequency: Record<number, number> = {};
      let maxFreq = 0;
      let mode = values[0];
      
      for (const value of values) {
        frequency[value] = (frequency[value] || 0) + 1;
        if (frequency[value] > maxFreq) {
          maxFreq = frequency[value];
          mode = value;
        }
      }
      return mode;
    },
    variance: (...values: number[]) => {
      const avg = this.math.average(...values);
      const squaredDiffs = values.map((val: any) => Math.pow(val - avg, 2));
      return this.math.average(...squaredDiffs);
    },
    standardDeviation: (...values: number[]) => Math.sqrt(this.math.variance(...values)),
    factorial: (n: number) => {
      if (n < 0) return NaN;
      if (n === 0 || n === 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      return result;
    },
    fibonacci: (n: number) => {
      if (n < 0) return NaN;
      if (n === 0) return 0;
      if (n === 1) return 1;
      let a = 0, b = 1;
      for (let i = 2; i <= n; i++) {
        const temp = a + b;
        a = b;
        b = temp;
      }
      return b;
    },
    isPrime: (n: number) => {
      if (n < 2) return false;
      if (n === 2) return true;
      if (n % 2 === 0) return false;
      for (let i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i === 0) return false;
      }
      return true;
    },
    gcd: (a: number, b: number) => {
      while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
      }
      return a;
    },
    lcm: (a: number, b: number) => Math.abs(a * b) / this.math.gcd(a, b)
  };

  /**
   * Event handling
   */
  on(): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler: any) => {
        try {
          handler(data);
        } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
          console.error(`Error in utils event handler for ${event}:`, err instanceof Error ? message: String(err));
        }
      });
    }
  }

  /**
   * Get system status
   */
  getStatus(): { 
    isInitialized: boolean; 
    eventHandlers: number;
  } 
    return {
      isInitialized: isInitialized: this.isInitialized,
      eventHandlers: this.eventHandlers.size
    };
  }

  /**
   * Reset utils
   */
  reset(): void {
    this.eventHandlers.clear();
    this.isInitialized = false;
    this.initialize();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.eventHandlers.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
// export const realUtils = new RealUtils();