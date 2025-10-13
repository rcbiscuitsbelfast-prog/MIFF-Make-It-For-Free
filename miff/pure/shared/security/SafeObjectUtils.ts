/**
 * SafeObjectUtils - Safe object operations to prevent prototype pollution
 * 
 * Provides safe alternatives to object operations that prevent prototype
 * pollution attacks and ensure objects are created safely.
 * 
 * @version 1.0.0
 * @author MIFF Framework Security Team
 */

export interface SafeMergeOptions {
  deep?: boolean;
  allowPrototypeOverwrite?: boolean;
  maxDepth?: number;
}

export class SafeObjectUtils {
  private static readonly DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];
  private static readonly MAX_DEPTH = 100;
  private static readonly MAX_KEYS = 10000;

  /**
   * Safely merge objects without prototype pollution
   */
  static safeMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    const result = this.createSafeObject(target);
    
    for (const source of sources) {
      if (source && typeof source === 'object') {
        this.mergeObject(result, source, { deep: true });
      }
    }
    
    return result;
  }

  /**
   * Safely assign properties to an object
   */
  static safeAssign<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    const result = this.createSafeObject(target);
    
    for (const source of sources) {
      if (source && typeof source === 'object') {
        this.mergeObject(result, source, { deep: false });
      }
    }
    
    return result;
  }

  /**
   * Safely clone an object without prototype pollution
   */
  static safeClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.safeClone(item)) as T;
    }

    const cloned = this.createSafeObject({});
    this.mergeObject(cloned, obj, { deep: true });
    return cloned as T;
  }

  /**
   * Create a safe object without dangerous prototype properties
   */
  static createSafeObject<T extends Record<string, any>>(obj: T): T {
    const safe = Object.create(null);
    
    for (const key in obj) {
      if (this.isSafeKey(key) && obj.hasOwnProperty(key)) {
        safe[key] = obj[key];
      }
    }
    
    return safe as T;
  }

  /**
   * Check if a key is safe to use (not a prototype pollution vector)
   */
  static isSafeKey(key: string): boolean {
    if (typeof key !== 'string') {
      return false;
    }

    // Check for dangerous keys
    if (this.DANGEROUS_KEYS.includes(key)) {
      return false;
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /^__proto__$/i,
      /^constructor$/i,
      /^prototype$/i,
      /^__.*__$/i,  // Double underscore patterns
      /^\[object\s+\w+\]$/i  // [object Object] patterns
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(key)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Safely get a property value from an object
   */
  static safeGet<T>(obj: any, path: string, defaultValue?: T): T! {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (!this.isSafeKey(key)) {
        return defaultValue;
      }

      if (current === null || typeof current !== 'object') {
        return defaultValue;
      }

      current = current[key];
    }

    return current;
  }

  /**
   * Safely set a property value on an object
   */
  static safeSet<T extends Record<string, any>>(obj: T, path: string, value: any): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    const keys = path.split('.');
    const lastKey = keys.pop();
    
    if (!lastKey || !this.isSafeKey(lastKey)) {
      return false;
    }

    let current = obj;
    
    for (const key of keys) {
      if (!this.isSafeKey(key)) {
        return false;
      }

      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = this.createSafeObject({});
      }
      
      current = current[key];
    }

    current[lastKey] = value;
    return true;
  }

  /**
   * Validate an object for prototype pollution
   */
  static validateObject(obj: any, maxDepth = this.MAX_DEPTH): { isValid: boolean; error?: string } {
    try {
      const visited = new WeakSet();
      return this.validateObjectRecursive(obj, visited, 0, maxDepth);
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Object validation failed'
      };
    }
  }

  /**
   * Recursively validate an object
   */
  private static validateObjectRecursive(obj: any, visited: WeakSet<any>, depth: number, maxDepth: number): { isValid: boolean; error?: string } {
    if (depth > maxDepth) {
      return {
        isValid: false,
        error: `Maximum depth exceeded: ${depth} > ${maxDepth}`
      };
    }

    if (obj === null || typeof obj !== 'object') {
      return { isValid: true };
    }

    if (visited.has(obj)) {
      return { isValid: true }; // Circular reference, but not dangerous
    }

    visited.add(obj);

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = this.validateObjectRecursive(obj[i], visited, depth + 1, maxDepth);
        if (!result.isValid) {
          return result;
        }
      }
    } else {
      const keys = Object.keys(obj);
      
      if (keys.length > this.MAX_KEYS) {
        return {
          isValid: false,
          error: `Too many keys: ${keys.length} > ${this.MAX_KEYS}`
        };
      }

      for (const key of keys) {
        if (!this.isSafeKey(key)) {
          return {
            isValid: false,
            error: `Dangerous key detected: ${key}`
          };
        }

        const result = this.validateObjectRecursive(obj[key], visited, depth + 1, maxDepth);
        if (!result.isValid) {
          return result;
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Merge objects safely
   */
  private static mergeObject(target: any, source: any, options: SafeMergeOptions = {}): void {
    const { deep = false, maxDepth = this.MAX_DEPTH } = options;
    
    for (const key in source) {
      if (!this.isSafeKey(key) || !source.hasOwnProperty(key)) {
        continue;
      }

      const sourceValue = source[key];
      const targetValue = target[key];

      if (deep && 
          sourceValue !== null && 
          typeof sourceValue === 'object' && 
          !Array.isArray(sourceValue) &&
          targetValue !== null && 
          typeof targetValue === 'object' && 
          !Array.isArray(targetValue)) {
        
        if (!target[key]) {
          target[key] = this.createSafeObject({});
        }
        this.mergeObject(target[key], sourceValue, { ...options, maxDepth: maxDepth - 1 });
      } else {
        target[key] = sourceValue;
      }
    }
  }

  /**
   * Sanitize an object by removing dangerous properties
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = this.createSafeObject({});
    
    for (const key in obj) {
      if (this.isSafeKey(key) && obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (value !== null && typeof value === 'object') {
          sanitized[key] = this.sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    
    return sanitized as T;
  }
}

// Export default instance
export const safeObjectUtils = new SafeObjectUtils();
export { SafeObjectUtils as default };